'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, Clock, BookOpen, Layers, X, Search } from 'lucide-react';

interface VocabProgress {
  _id: string;
  word: string;
  status: string;
  isKnown: boolean;
  nextReviewAt: string;
  intervalDays: number;
  topics?: string[];
}

import { useSearchParams } from 'next/navigation';

export default function VocabularyPage() {
  const searchParams = useSearchParams();
  const topicFilter = searchParams.get('topic');
  
  const [vocab, setVocab] = useState<VocabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVocab();
  }, [topicFilter]);

  const fetchVocab = async () => {
    try {
      const url = topicFilter 
        ? `/vocabulary?limit=100&topic=${encodeURIComponent(topicFilter)}` 
        : '/vocabulary?limit=100';
      const res = await api.get(url);
      setVocab(res.data.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkKnown = async (id: string, current: boolean) => {
    try {
      await api.patch(`/vocabulary/${id}/known`, { isKnown: !current });
      setVocab(prev => prev.map(v => v._id === id ? { ...v, isKnown: !current } : v));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsave = async (word: string) => {
    if (!confirm(`Bạn có chắc chắn muốn bỏ lưu từ "${word}"?`)) return;
    try {
      await api.delete('/vocabulary/unsave', { word });
      setVocab(prev => prev.filter(v => v.word !== word));
    } catch (error) {
      console.error('Lỗi khi bỏ lưu từ vựng:', error);
    }
  };

  const filteredVocab = vocab.filter(v => v.word.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <BookOpen className="text-primary" /> Từ vựng của bạn
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Quản lý danh sách từ vựng và tự động lên lịch ôn tập thông minh (Spaced Repetition).
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm từ vựng..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="grid gap-4">
        {filteredVocab.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center">
            <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Không tìm thấy từ vựng</h3>
            <p className="text-slate-500 dark:text-slate-400">Bạn chưa lưu từ vựng nào hoặc không có kết quả phù hợp với tìm kiếm.</p>
          </div>
        ) : (
          filteredVocab.map(v => (
            <div key={v._id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 relative group transition-all hover:shadow-lg hover:border-primary/20">
              <button
                onClick={() => handleUnsave(v.word)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Bỏ lưu từ vựng"
              >
                <X size={18} />
              </button>

              <div className="md:w-1/3 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{v.word}</h3>
                  {v.isKnown ? (
                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Đã biết
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide">
                      {v.status}
                    </span>
                  )}
                </div>
                
                {v.topics && v.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {v.topics.map(topic => (
                      <span key={topic} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Layers size={10} /> {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <Clock size={16} className={v.isKnown ? 'text-slate-400' : 'text-orange-500'} />
                      <span>
                        Ôn tập: {v.isKnown ? <span className="italic">Không yêu cầu</span> : <strong className="text-slate-900 dark:text-white font-medium">{new Date(v.nextReviewAt).toLocaleDateString('vi-VN')}</strong>}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleMarkKnown(v._id, v.isKnown)}
                    className={`text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      v.isKnown 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    {v.isKnown ? 'Đánh dấu cần ôn tập' : 'Đánh dấu đã biết'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
