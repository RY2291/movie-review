'use client';

import { Film } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();

    await fetch('http://localhost:8080/sanctum/csrf-cookie', {
      credentials: 'include'
    });

    const xsrfToken = Cookies.get('XSRF-TOKEN');

    const response = await fetch('http://localhost:8080/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': xsrfToken
      },
      credentials: 'include'
    });

    if (response.ok) {
      // await router.push('/')
      // ルートページでログアウトするとログアウトしたことがわからないので、直接遷移
      window.location.href = '/';
    } else {
      console.error('Logout failed', response.status);
    }
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-8 h-8" />
            <h1 className="text-2xl font-bold">MovieReview</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-200 transition-colors">ホーム</Link>

            {user ? (
              // ログイン済み 
              <>
                <Link href="#" className="hover:text-blue-200 transition-colors">マイページ</Link>
                <button onClick={handleLogout} className="hover:text-blue-200 transition-colors">ログアウト</button>
              </>
            ) : (
              // 未ログイン
              <>
                <Link href="/login" className="hover:text-blue-200 transition-colors">ログイン</Link>
                <Link href="/register" className="hover:text-blue-200 transition-colors">ユーザ登録</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header >
  )

}

export default Header