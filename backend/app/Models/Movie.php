<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    protected $fillable = [
        'api_id',
        'title',
        'poster_path',
        'description',
        'release_date'
    ];

    /**
     * タイトル部分一致検索
     */
    public static function searchByKeyword(string $keyword)
    {
        return static::where('title', 'like', "%{$keyword}%")->get();
    }

    /**
     * まとめてアップサート
     */
    public static function upsertMovies(array $movies): void
    {
        static::upsert($movies, ['api_id'], ['title', 'poster_path', 'description', 'release_date']);
    }
}
