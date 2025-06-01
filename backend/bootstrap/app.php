<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter; // Ensure this Facade is imported
use Illuminate\Cache\RateLimiting\Limit;    // Ensure Limit class is imported

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global HTTP middleware stack.
        // HandleCors should be early, especially for preflight requests.
        $middleware->use([
            \Illuminate\Http\Middleware\TrustProxies::class,
            \Illuminate\Http\Middleware\HandleCors::class, // Handles CORS headers
            // Add other global middleware if necessary, e.g.:
            // \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
            // \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
            // \Illuminate\Http\Middleware\TrimStrings::class,
            // \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        ]);

        // API specific middleware stack
        // EnsureFrontendRequestsAreStateful is crucial for Sanctum SPA auth.
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        
        // Middleware aliases
        $middleware->alias([
            'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
            'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
            'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
            'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
            'can' => \Illuminate\Auth\Middleware\Authorize::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
            'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            
            // Custom middleware
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'verified.doctor' => \App\Http\Middleware\VerifiedDoctor::class,
            'active.user' => \App\Http\Middleware\ActiveUser::class,
        ]);

        // Configure API rate limiting.
        // This is the correct place for RateLimiter::for in Laravel 11.
        // The "Facade root not set" error indicates an issue earlier in bootstrapping
        // or with the RateLimiter service provider/cache setup.
        try {
            RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
            });
        } catch (\RuntimeException $e) {
            // Log the fact that RateLimiter could not be configured here.
            // This helps confirm if this specific block is the source of a bootstrap-time error.
            error_log('Failed to configure RateLimiter in bootstrap/app.php: ' . $e->getMessage());
            // Depending on your error handling preference, you might re-throw or handle differently.
            // For now, we'll let it potentially fail if there's a deeper issue.
        }
        
        $middleware->throttleApi(); // Applies the 'throttle:api' middleware group.

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle authentication exceptions for API
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated. Please login.',
                ], 401);
            }
            return response()->json(['message' => 'Unauthenticated (Non-API context)'], 401);
        });

        // Handle validation exceptions
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], 422);
            }
            throw $e;
        });

        // Handle general exceptions for API
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $status = $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface ? $e->getStatusCode() : 500;
                
                $responsePayload = [
                    'message' => ($status === 500 && !config('app.debug')) ? 'Server Error' : $e->getMessage(),
                ];

                if (config('app.debug')) {
                    $responsePayload['error_details'] = [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        // Limit trace in production or if too verbose
                        'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 15),
                    ];
                }
                return response()->json($responsePayload, $status);
            }
            throw $e; 
        });
    })->create();
