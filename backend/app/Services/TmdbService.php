<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Exceptions\TmdbApiException;
use App\Models\Movie;

class TmdbService
{
  protected string $baseUrl = 'https://api.themoviedb.org/3';
  protected string $apiToken;

  public function __construct()
  {
    $this->apiToken = config('services.tmdb.token');
  }

  /**
   * 最新映画を取得する
   *
   * @param integer $page
   * @return array<array<string,mixed>>
   * @throws TmdbApiException
   */
  public function fetchLatestMovies(int $page = 1): array
  {
    $params = [
      'language' => 'ja-JP',
      'page' => $page
    ];
    $json = $this->request('/movie/now_playing', $params);

    return $this->formatMovieList($json);
  }

  /**
   * キーワード検索(部分一致)
   *
   * @param string $keyword
   * @param integer $page
   * @return array
   * @throws TmdbApiExceptions
   */
  public function searchMovies(string $keyword, int $page = 1): array
  {
    $params = [
      'language' => 'ja-JP',
      'page' => $page,
      'query' => $keyword,
      'include_adult' => false,
    ];

    $movies = Movie::searchByKeyword($keyword);

    if ($movies->isNotEmpty()) {
      return $this->formatMovieList($movies->toArray());
    }

    $json = $this->request('/search/movie', $params);

    $records = collect($json['results'] ?? [])
      ->map(function ($item) {
        return [
          'api_id'      => $item['id'], // TMDB の ID を api_id カラムに
          'title'       => $item['title'],
          'poster_url'  => $item['poster_path'] ?? ' '
            ? "https://image.tmdb.org/t/p/w500{$item['poster_path']}"
            : null,
          'description' => $item['overview'] ?? null,
          'release_date' => !array_key_exists('release_date', $item) || trim($item['release_date']) == '' ? null : $item['release_date'],
          'updated_at'  => now(),  // upsert に必要
          'created_at'  => now(),
        ];
      })
      ->all();

    Movie::upsertMovies($records);

    return $this->formatMovieList($json);
  }

  private function request(string $path, array $params): array
  {
    try {
      $response = Http::withHeaders([
        'Authorization' => "Bearer {$this->apiToken}",
        'accept' => 'application/json',
      ])->get("{$this->baseUrl}$path", $params);

      if ($response->failed()) {
        throw new TmdbApiException('TMDB API Error', $response->status());
      }
    } catch (\Illuminate\Http\Client\ConnectionException $e) {
      // ネットワーク不通やタイムアウト
      throw new TmdbApiException('TMDB connection error', 0, $e);
    } catch (\Throwable $e) {
      // それ以外はすべてここに
      throw new TmdbApiException('Unexpected TMDB error', 0, $e);
    }

    return $response->json();
  }

  private function formatMovieList(array $data): array
  {
    if (array_key_exists('results', $data)) {
      return collect($data['results'] ?? [])
        ->map(fn($m) => [
          'id' => $m['id'],
          'title' => $m['title'],
          'poster_path' => $m['poster_path'] ? "https://image.tmdb.org/t/p/w500{$m['poster_path']}" : null,
          'release_date' => array_key_exists('release_date', $m) ? $m['release_date'] : null,
        ])
        ->all();
    } else {
      return collect($data)
        ->map(fn($m) => [
          'id' => $m['id'],
          'title' => $m['title'],
          'poster_path' => array_key_exists('poster_path', $m) ? "https://image.tmdb.org/t/p/w500{$m['poster_path']}" : null,
          'release_date' => array_key_exists('release_date', $m) ? $m['release_date'] : null,
        ])
        ->all();
    }
  }
}
