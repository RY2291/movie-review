"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, Calendar, Clock, ArrowLeft, Heart, Share, Play } from 'lucide-react';
import Header from '@/components/Header';

const MovieDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // クエリパラメータから映画IDを取得
  const movieId = params.id;

  useEffect(() => {
    if (!movieId) {
      setError('映画IDが見つかりません');
      setLoading(false);
      return;
    }

    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError('');

        // APIから映画詳細を取得
        const response = await fetch(
          `http://localhost:8080/api/movies/${movieId}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('映画詳細の取得に失敗しました');
        }

        const data = await response.json();
        setMovie(data.data);;
      } catch (error) {
        console.error('Error fetching movie detail:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movieId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {movie ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* ヒーロー部分 */}
            <div className="relative">
              <div className="flex flex-col lg:flex-row">
                {/* ポスター画像 */}
                <div className="lg:w-1/3 xl:w-1/4">
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-full h-96 lg:h-full object-cover"
                  />
                </div>

                {/* 映画情報 */}
                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      {movie.title}
                    </h1>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-6 h-6" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Share className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* 評価とメタ情報 */}
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    {movie.rating && (
                      <div className="flex items-center">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                        <span className="text-xl font-semibold">{movie.rating}</span>
                        <span className="text-gray-500 ml-1">/10</span>
                      </div>
                    )}

                    {movie.release_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>{movie.release_date}</span>
                      </div>
                    )}

                    {movie.runtime && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-2" />
                        <span>{movie.runtime}分</span>
                      </div>
                    )}
                  </div>

                  {/* ジャンル */}
                  {movie.genres && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* あらすじ */}
                  {movie.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">あらすじ</h3>
                      <p className="text-gray-700 leading-relaxed">{movie.description}</p>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      予告編を見る
                    </button>
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                      レビューを書く
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 追加情報セクション */}
            <div className="p-8 border-t bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* キャスト情報（サンプル） */}
                {movie.cast && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">主要キャスト</h3>
                    <div className="space-y-2">
                      {movie.cast.slice(0, 5).map((actor, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          {actor.name}
                          {actor.character && (
                            <span className="text-gray-500 ml-2">as {actor.character}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* スタッフ情報（サンプル） */}
                {movie.director && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">スタッフ</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>監督: {movie.director}</div>
                      {movie.producer && <div>プロデューサー: {movie.producer}</div>}
                      {movie.screenplay && <div>脚本: {movie.screenplay}</div>}
                    </div>
                  </div>
                )}

                {/* その他の情報 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">作品情報</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {movie.country && <div>製作国: {movie.country}</div>}
                    {movie.language && <div>言語: {movie.language}</div>}
                    {movie.budget && <div>制作費: {movie.budget}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">映画情報が見つかりません</p>
            <button
              onClick={handleBack}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              戻る
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MovieDetail;