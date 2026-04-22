'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface VocabProgress {
  _id: string;
  word: string;
  status: string;
  isKnown: boolean;
  nextReviewAt: string;
  intervalDays: number;
}

export default function VocabularyPage() {
  const [vocab, setVocab] = useState<VocabProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocab();
  }, []);

  const fetchVocab = async () => {
    try {
      const res = await api.get('/vocabulary?limit=50');
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

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Từ vựng của bạn</h1>
          <p className="text-slate-400">Quản lý từ vựng và tiến độ học tập (Spaced Repetition).</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Từ vựng</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Ôn tập tiếp theo</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {vocab.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Chưa có từ vựng nào.</td>
              </tr>
            ) : (
              vocab.map(v => (
                <tr key={v._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white text-base">
                    {v.word}
                  </td>
                  <td className="px-6 py-4">
                    {v.isKnown ? (
                      <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs">Đã biết</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs">{v.status}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {v.isKnown ? '-' : new Date(v.nextReviewAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleMarkKnown(v._id, v.isKnown)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        v.isKnown 
                          ? 'border-white/10 text-slate-400 hover:bg-white/10' 
                          : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {v.isKnown ? 'Bỏ đánh dấu' : 'Đánh dấu đã biết'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
