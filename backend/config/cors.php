<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*', // All your API routes
        'sanctum/csrf-cookie', // For Sanctum SPA authentication
        'login', // If you have web-based login/logout for API tokens
        'logout',
        'register',
        // Add any other specific paths that need CORS headers if not covered by 'api/*'
    ],

    'allowed_methods' => ['*'], // Allows all methods (GET, POST, PUT, DELETE, etc.)

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Allows all headers

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Crucial for Sanctum cookie-based authentication

];
