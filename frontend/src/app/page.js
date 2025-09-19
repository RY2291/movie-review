"use client"

import LoginLinks from '@/app/LoginLinks'
import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Film, ChevronRight, Play } from 'lucide-react';


// export const metadata = {
//     title: 'Movie Stock',
// }

const MovieReviewTop = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [latestMovies, setLatestMovies] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [latestError, setLatestError] = useState('');
    const [searchedMovies, setSearchedMovies] = useState([]);
    const [searchedMoviesError, setSearchedMoviesError] = useState('');

    useEffect(() => {
        const fetchLatestMovies = async () => {
            try {
                setLoading(true);
                setLatestError(null);

                const response = await fetch('http://localhost:8080/api/movies/latest');

                if (!response.ok) {
                    if (response.status === 409) {
                        setLatestMovies([]);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setLatestMovies(data || [])
            } catch (error) {
                console.error('Error fetching latest movies:', error);
                setLatestError(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestMovies();
    }, []);

    const handleSearch = () => {
        const fetchSearchMovie = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `http://localhost:8080/api/movies/search?searchKeyword=${encodeURIComponent(searchKeyword)}`,
                    {
                        credentials: 'include', // これがないとLaravel側でCORSエラー発生する
                    }
                );

                if (!response.ok) {
                    throw new Error('検索に失敗しました');
                }

                const data = await response.json();
                setSearchedMovies(data || []);
            } catch (error) {
                console.error('Error fetching search movies:', error);
                setSearchedMoviesError(error.message);
            } finally {
                setLoading(false);
            }
        }
        console.log(searchedMovies);
        fetchSearchMovie();
    }
    // ダミーデータ
    const reviewedMovies = [
    ];

    const MovieCard = ({ movie, isReviewed = false }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 min-w-0 flex-shrink-0 w-64">
            <div className="relative">
                <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-full h-96 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {movie.rating}
                </div>
                {isReviewed && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                        レビュー済み
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{movie.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                        {isReviewed ? movie.reviewDate : movie.release_date}
                    </span>
                </div>
                {isReviewed && (
                    <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 mr-2">あなたの評価:</span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < movie.userRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <p className="text-gray-700 text-sm line-clamp-3">
                    {isReviewed ? movie.reviewSnippet : movie.overview}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Film className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">MovieReview</h1>
                        </div>
                        <nav className="hidden md:flex space-x-6">
                            <a href="#" className="hover:text-blue-200 transition-colors">ホーム</a>
                            <a href="#" className="hover:text-blue-200 transition-colors">映画</a>
                            <a href="#" className="hover:text-blue-200 transition-colors">レビュー</a>
                            <a href="#" className="hover:text-blue-200 transition-colors">マイページ</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* 検索セクション */}
                <section className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">映画を検索</h2>
                        <p className="text-gray-600">お気に入りの映画を見つけてレビューしよう</p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="映画のタイトルを入力してください..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 最新映画セクション */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                            最新映画
                        </h2>
                        <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                            すべて見る
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    {Loading && (
                        <div className="flex space-x-6 overflow-x-auto pb-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-gray-200 animate-pulse rounded-lg w-64 h-96 flex-shrink-0"></div>
                            ))}
                        </div>
                    )}

                    {latestError && (
                        <div className="text-center py-8 text-red-600">
                            データの取得に失敗しました。再読み込みしてください。
                        </div>
                    )}

                    {latestMovies && latestMovies.length > 0 && (
                        <div className="flex space-x-6 overflow-x-auto pb-4">
                            {latestMovies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}

                    {latestMovies && latestMovies.length === 0 && (
                        <div className="text-center py-8 text-gray-600">
                            最新映画が見つかりませんでした。
                        </div>
                    )}
                </section>

                {/* レビュー済みセクション */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Star className="w-6 h-6 mr-2 text-green-600 fill-current" />
                            レビュー済み
                        </h2>
                        <button className="flex items-center text-green-600 hover:text-green-800 transition-colors">
                            すべて見る
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                        {reviewedMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} isReviewed={true} />
                        ))}
                    </div>
                </section>

                {/* 統計情報 */}
                <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">あなたの統計</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">24</div>
                            <div className="text-purple-200">レビューした映画</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">4.2</div>
                            <div className="text-purple-200">平均評価</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">156</div>
                            <div className="text-purple-200">総視聴時間</div>
                        </div>
                    </div>
                </section>
            </main>

            {/* フッター */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2024 MovieReview. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .line-clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>
        </div>
    );
}

export default MovieReviewTop
