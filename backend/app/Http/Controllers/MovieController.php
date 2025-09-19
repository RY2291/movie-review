<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TmdbService;

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
        $request->validate(['searchKeyword' => 'required|string']);
        $movies = $this->tmdb->searchMovies($request->input('searchKeyword'));

        $data = collect($movies ?? [])->map(fn($m) => [
            'id' => $m['id'] ?? '',
            'title' => $m['title'] ?? '',
            'poster_path' => $m['poster_path'] ?? '',
            'release_date' => $m['release_date'] ?? '',
        ]);

        return response()->json($data);
    }
}
