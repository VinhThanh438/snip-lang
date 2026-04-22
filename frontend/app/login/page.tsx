'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.tokens.accessToken);
        router.push('/dashboard');
      } else {
        const res = await api.post('/auth/register', { email, password, displayName });
        localStorage.setItem('token', res.data.tokens.accessToken);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-primary mb-2">✦ SNIP-LANG</Link>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản mới'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tên hiển thị</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-primary text-white font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-indigo-400 font-medium"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </main>
  );
}
