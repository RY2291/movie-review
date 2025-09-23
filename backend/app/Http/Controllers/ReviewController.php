<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function getUserReview($movieId)
    {
        $review = Review::where('user_id', auth()->id)
            ->where('movie_id', $movieId)
            ->first();

        if (!$review) {
            return response()->json(['success' => false], 404);
        }

        return response()->json(['success' => true, 'data' => $review]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|integer',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:500',
        ]);

        Log::debug("validate", [$validated]);
        Log::debug("auth()->id()", [auth()->id()]);

        $review = Review::create([
            'user_id' => auth()->id(),
            'movie_id' => $validated['movie_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);
        // Log::debug("review", [response()->json(['success' => true, 'data' => $review])]);

        return response()->json(['success' => true, 'data' => $review]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|integer',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:500',
            'review_id' => 'nullable',
        ]);

        $review = Review::find($validated['review_id']);

        $review->rating = $validated['rating'];
        $review->comment = $validated['comment'];
        $review->update();

        return response()->json(['success' => true]);
    }

    public function getReviewed()
    {
        $isLogin = Auth::check();

        $query = Review::join('movies', 'reviews.movie_id', '=', 'movies.id')
            ->where('is_deleted', 0)
            ->groupBy(
                'reviews.movie_id',
                'movies.id',
                'movies.api_id',
                'movies.title',
                'movies.poster_path',
                'movies.release_date'
            )
            ->select(
                'movies.id',
                'movies.api_id',
                'movies.title',
                'movies.poster_path',
                'movies.release_date',
                DB::raw('Floor(AVG(reviews.rating)) as rating')
            );

        if ($isLogin) {
            $userId = auth()->id();
            $query->where('user_id', $userId);
        }

        $reviews = $query->get();

        Log::debug('$reviews', [$reviews]);
        return response()->json(['success' => true, 'data' => $reviews]);
    }
}
