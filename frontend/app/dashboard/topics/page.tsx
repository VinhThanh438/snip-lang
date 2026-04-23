'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Layers, PlayCircle, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TopicStats {
  topic: string;
  totalCount: number;
  dueCount: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/vocabulary/topics/stats');
      setTopics(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Layers className="text-primary" /> Học theo chủ đề
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Ôn tập từ vựng tập trung theo từng lĩnh vực bạn quan tâm.
            </p>
          </div>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center">
          <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Chưa có chủ đề nào</h3>
          <p className="text-slate-500 dark:text-slate-400">Hãy bắt đầu lưu từ vựng từ Extension để hệ thống tự động phân loại chủ đề nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <div key={t.topic} className="glass-panel p-6 rounded-2xl group transition-all hover:shadow-xl hover:border-primary/30 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Layers size={24} />
                </div>
                {t.dueCount > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                    {t.dueCount} từ cần ôn
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 capitalize">
                {t.topic}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {t.totalCount} từ vựng đã lưu
              </p>

              <div className="mt-auto flex gap-3">
                <Link 
                  href={`/dashboard/topics/review?topic=${encodeURIComponent(t.topic)}`}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                    t.dueCount > 0 
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' 
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed dark:bg-white/5'
                  }`}
                  onClick={(e) => t.dueCount === 0 && e.preventDefault()}
                >
                  <PlayCircle size={18} /> Ôn tập ngay
                </Link>
                <Link 
                  href={`/dashboard/vocabulary?topic=${encodeURIComponent(t.topic)}`}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  title="Xem danh sách từ"
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
