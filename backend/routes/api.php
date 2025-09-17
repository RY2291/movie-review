<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/movies/latest', [MovieController::class, 'latest']);
Route::get('/movies/search', [MovieController::class, 'search']);
