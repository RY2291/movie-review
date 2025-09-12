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
    // 以下を設定することによって、corsのエラーが発生しない
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'register', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3001')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // ブラウザが JavaScript からアクセスできるレスポンスヘッダー を制御するための設定で、Sanctum の CSRF トークン (XSRF-TOKEN) を取得できるよにする
    'exposed_headers' => ['*'],

    'max_age' => 0,

    'supports_credentials' => true,

];
