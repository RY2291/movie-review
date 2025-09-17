<?php

namespace App\Exceptions;

use Exception;

/**
 * 「TMDB との通信で異常が起きた」ことを表すアプリケーション独自の例外
 */
class TmdbApiException extends Exception {}
