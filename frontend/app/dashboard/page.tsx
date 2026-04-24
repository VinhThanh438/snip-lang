'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bookmark } from 'lucide-react';

interface Sentence {
  _id: string;
  text: string;
  sourceDomain: string;
  analysisStatus: string;
  isFavorited: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      const res = await api.get('/sentences');
      setSentences(res.data.sentences);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bookmark size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Câu đã lưu</h1>
            <p className="text-slate-600 dark:text-slate-400">Danh sách các câu tiếng Anh bạn đã bôi đen từ Extension.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {sentences.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border-dashed">
            <p className="text-slate-500 dark:text-slate-400">Chưa có câu nào. Hãy cài Extension và bắt đầu lưu nhé!</p>
          </div>
        ) : (
          sentences.map(s => (
            <Link href={`/dashboard/sentences/${s._id}`} key={s._id}>
              <div className="glass-panel p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors">
                    {s.text}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(s.analysisStatus)}`}>
                    {s.analysisStatus === 'completed' ? 'Đã phân tích' : s.analysisStatus}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {s.sourceDomain && (
                    <span className="flex items-center gap-1">
                      🌐 {s.sourceDomain}
                    </span>
                  )}
                  <span>
                    ⏱ {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
