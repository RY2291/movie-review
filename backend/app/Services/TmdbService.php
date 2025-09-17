<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Exceptions\TmdbApiException;

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
    $json = $this->request('/search/movie', $params);

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

  private function formatMovieList(array $json): array
  {
    return collect($json['results'] ?? [])
      ->map(fn($m) => [
        'id' => $m['id'],
        'title' => $m['title'],
        'poster_path' => $m['poster_path'] ? "https://image.tmdb.org/t/p/w500{$m['poster_path']}" : null,
        'release_date' => $m['release_date'],
      ])
      ->all();
  }
}
