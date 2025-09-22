<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Log;

class MovieController extends Controller
{
    public function __construct(private TmdbService $tmdb) {}

    public function latest()
    {
        $movies = $this->tmdb->fetchLatestMovies();

        return response()->json($movies);
    }

    public function search(Request $request)
    {
        try {
            $request->validate(['searchKeyword' => 'required|string']);
            $movies = $this->tmdb->searchMovies($request->input('searchKeyword'));

            $data = collect($movies ?? [])->map(fn($m) => [
                'id' => $m['id'] ?? '',
                'title' => $m['title'] ?? '',
                'poster_path' => $m['poster_path'] ?? '',
                'release_date' => $m['release_date'] ?? '',
            ]);

            return response()->json($data);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    public function detail(int $id)
    {
        try {
            $movie = Movie::where('api_id', $id)->first();

            if (!$movie) {
                return response()->json([
                    'error' => '映画が見つかりません',
                    'message' => 'Movie not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $movie
            ], 200);
        } catch (\Exception $e) {
            Log::error('Movie detail fetch error: ' . $e->getMessage());

            return response()->json([
                'error' => 'データの取得に失敗しました',
                'message' => 'Failed to fetch movie details'
            ], 500);
        }
    }
}
