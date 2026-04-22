'use client';

import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cài đặt</h1>
        <p className="text-slate-500 dark:text-slate-400">Tùy chỉnh giao diện và các thiết lập tài khoản của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings Section */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Giao diện
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Chế độ Sáng / Tối</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thay đổi màu sắc của ứng dụng để bảo vệ mắt của bạn.</p>
            </div>
            
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mounted && theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Sun size={16} />
                Sáng
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mounted && theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Moon size={16} />
                Tối
              </button>
            </div>
          </div>
        </section>

        {/* Extensions Settings Section (Placeholder) */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Chrome Extension
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Quản lý các thiết lập dành cho Extension SNIP-LANG trên trình duyệt của bạn.
          </p>
          <div className="text-sm bg-primary/10 text-primary p-4 rounded-xl border border-primary/20">
            Các cấu hình extension (Tự động dịch, Popup...) hiện được quản lý trực tiếp ngay trên giao diện của Extension. Bạn hãy nhấn vào icon SNIP-LANG trên trình duyệt để thay đổi nhé!
          </div>
        </section>
      </div>
    </div>
  );
}
