<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use \Illuminate\Support\Facades\RateLimiter as RateLimiter;


// Remove the globally defined functions:
// renderAuthException, renderValidationException, renderGeneralException
// as their logic is now handled within ->withExceptions()

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        RateLimiter::for('api', function (Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        // API middleware stack with Sanctum
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Define middleware aliases
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
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class, // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Http/Middleware/EnsureEmailIsVerified.php]
            
            // Custom middleware
            'role' => \App\Http\Middleware\RoleMiddleware::class, // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Http/Middleware/RoleMiddleware.php]
            'verified.doctor' => \App\Http\Middleware\VerifiedDoctor::class, // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Http/Middleware/VerifiedDoctor.php]
            'active.user' => \App\Http\Middleware\ActiveUser::class, // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Http/Middleware/ActiveUser.php]
        ]);

        // Enable rate limiting for all API routes
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle authentication exceptions for API
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated. Please login.',
                ], 401);
            }
            // Fallback for non-API requests (though we shouldn't have any for an API-centric app)
            // If you have web routes that might trigger this, you might redirect to a login page.
            // For a pure API, returning JSON is appropriate.
            return response()->json(['message' => 'Unauthenticated (Non-API context)'], 401);
        });

        // Handle validation exceptions
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }
            // For non-API requests, re-throw to let Laravel handle it (e.g., redirect back with errors)
            // For a pure API, this part might not be hit if all requests are API requests.
            throw $e;
        });

        // Handle general exceptions for API
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
                $response = [
                    'message' => $e->getMessage() ?: 'Server Error',
                ];
                if (config('app.debug')) {
                    $response['error'] = [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTrace() // Consider limiting trace in production even if debug is on for API
                    ];
                }
                return response()->json($response, $status);
            }
            // For non-API requests, re-throw to let Laravel handle it (e.g., show error page)
            throw $e;
        });
    })->create();
