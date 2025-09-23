<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ReviewController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/movies/latest', [MovieController::class, 'latest']);
Route::get('/movies/search', [MovieController::class, 'search']);
Route::get('/movies/{apiId}', [MovieController::class, 'detail']);

Route::get('/reviews/reviewed', [reviewController::class, 'getReviewed']);
Route::get('/reviews/user/{movieId}', [reviewController::class, 'getUserReview']);
Route::post('/reviews', [reviewController::class, 'store']);
Route::post('/reviews/update', [reviewController::class, 'update']);
