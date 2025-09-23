"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, Calendar, Clock, ArrowLeft, Heart, Share, Play, X, Edit } from 'lucide-react';
import Header from '@/components/Header';

const MovieDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // クエリパラメータから映画IDを取得
  const movieApiId = params.id;

  useEffect(() => {
    if (!movieApiId) {
      setError('映画IDが見つかりません');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      await Promise.all([
        fetchMovieDetail(),
        fetchUserData(),
        fetchUserReview()
      ]);
    };

    fetchData();
  }, [movieApiId]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      setError('');

      // APIから映画詳細を取得
      const response = await fetch(
        `http://localhost:8080/api/movies/${movieApiId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('映画詳細の取得に失敗しました');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setMovie(result.data);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        setMovie(result);
      }
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    }
  };

  const fetchUserReview = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/reviews/user/${movieId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const reviewData = await response.json();
        if (reviewData.success && reviewData.data) {
          setUserReview(reviewData.data);
          setReviewForm({
            rating: reviewData.data.rating,
            comment: reviewData.data.comment
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    } finally {
      setLoading(false);
    }
  }


  const handleBack = () => {
    router.back();
  };

  const handleReviewAction = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // ログイン済みの場合はモーダルを表示
    setShowReviewModal(true);
  }

  const handleCloseModal = () => {
    setShowReviewModal(false);
    // フォームをリセット（編集の場合は元の値に戻す）
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment
      });
    } else {
      setReviewForm({
        rating: 0,
        comment: ''
      });
    }
  }

  const handleRatingClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (reviewForm.rating === 0) {
      alert('評価を選択してください');
      return;
    }

    setReviewSubmitting(true);
    try {
      const movie_id = movie.id;
      const url = userReview
        ? 'http://localhost:8080/api/reviews/update'
        : 'http://localhost:8080/api/reviews';

      const method = 'POST';

      const response = fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          movie_id: movie_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          review_id: userReview.id ?? null
        }),
      });

      if (!(await response).ok) {
        throw new Error('レビューの保存に失敗しました');
      }

      const result = await (await response).json();

      if (result.success) {
        setUserReview(result.data);
        setShowReviewModal(false);
        alert(userReview ? 'レビューを更新しました' : 'レビューを投稿しました');
      } else {
        throw new Error(result.error || 'レビューの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getReviewButtonText = () => {
    if (!user) return 'ログインしてレビューを書く';
    return userReview ? 'レビューを編集する' : 'レビューを書く';
  }

  const getReviewButtonIcon = () => {
    if (!user) return <Play className="w-5 h-5 mr-2" />;
    return userReview ? <Edit className="w-5 h-5 mr-2" /> : <Star className="w-5 h-5 mr-2" />;
  }

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
                    <button
                      onClick={handleReviewAction}
                      className={`px-6 py-3 rounded-lg transition-colors flex items-center ${user
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                    >
                      {getReviewButtonIcon()}
                      {getReviewButtonText()}
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

      {/* レビューモーダル */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userReview ? 'レビューを編集' : 'レビューを書く'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {movie && (
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{movie.title}</h3>
                    {movie.release_date && (
                      <p className="text-gray-600 text-sm">{movie.release_date}</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitReview}>
                {/* 評価 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    評価 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${rating <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                            }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewForm.rating > 0 ? `${reviewForm.rating}/5` : '評価してください'}
                    </span>
                  </div>
                </div>

                {/* コメント */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コメント
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="映画の感想を書いてください..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reviewForm.comment.length}/500文字
                  </p>
                </div>

                {/* ボタン */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={reviewSubmitting}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || reviewForm.rating === 0}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {userReview ? '更新中...' : '投稿中...'}
                      </span>
                    ) : (
                      userReview ? '更新する' : '投稿する'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;