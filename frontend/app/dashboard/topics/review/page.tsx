'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, CheckCircle2, ChevronRight, Volume2, Trophy } from 'lucide-react';
import Link from 'next/link';

interface ReviewItem {
  _id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  examples: string[];
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic');

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (topic) fetchDue();
  }, [topic]);

  const fetchDue = async () => {
    try {
      const res = await api.get(`/vocabulary/due?topic=${encodeURIComponent(topic!)}&limit=10`);
      // Trình bày lại dữ liệu nếu cần
      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = items[currentIndex];

  const handleRate = async (quality: number) => {
    try {
      await api.post(`/vocabulary/${currentItem._id}/review`, { quality });
      
      if (currentIndex < items.length - 1) {
        setShowAnswer(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  if (items.length === 0 && !finished) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel p-12 rounded-3xl">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2">Tuyệt vời!</h2>
          <p className="text-slate-500 mb-8">Bạn đã hoàn thành tất cả các từ cần ôn tập trong chủ đề <strong>{topic}</strong>.</p>
          <Link href="/dashboard/topics" className="px-8 py-3 rounded-xl bg-primary text-white font-bold inline-flex items-center gap-2">
            Quay lại chủ đề
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel p-12 rounded-3xl">
          <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2">Hoàn thành phiên ôn tập!</h2>
          <p className="text-slate-500 mb-8">Bạn vừa ôn tập xong {items.length} từ vựng thuộc chủ đề <strong>{topic}</strong>.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-primary text-white font-bold">Ôn tiếp</button>
            <Link href="/dashboard/topics" className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 font-semibold">Về danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard/topics" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft size={18} /> Thoát ôn tập
        </Link>
        <div className="text-sm font-medium text-slate-400">
          Tiến trình: <span className="text-primary">{currentIndex + 1}</span> / {items.length}
        </div>
      </div>

      <div className="mb-4 h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Card Section */}
      <div className={`min-h-[400px] glass-panel rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 relative`}>
        <div className="mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
          {topic}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          {currentItem.word}
        </h1>

        {!showAnswer ? (
          <button 
            onClick={() => setShowAnswer(true)}
            className="mt-12 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/25"
          >
            Xem đáp án
          </button>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-8"></div>
             <div className="text-2xl font-semibold text-secondary mb-4">
               {currentItem.meaning}
             </div>
             <div className="flex items-center justify-center gap-2 text-slate-500 mb-8 italic">
               /{currentItem.pronunciation}/ <Volume2 size={16} className="cursor-pointer hover:text-primary" />
             </div>
             
             {currentItem.examples && currentItem.examples.length > 0 && (
               <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm text-slate-600 dark:text-slate-400 text-left border border-slate-100 dark:border-white/5">
                  <p className="font-bold mb-2 uppercase text-[10px] tracking-wider text-slate-400">Ví dụ minh họa:</p>
                  <p className="text-base italic">"{currentItem.examples[0]}"</p>
               </div>
             )}

             <div className="mt-12 flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => handleRate(1)} 
                  className="flex-1 min-w-[100px] py-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold text-xs hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-200/50 dark:border-red-500/20"
                >
                  QUÊN HẲN
                </button>
                <button 
                  onClick={() => handleRate(3)} 
                  className="flex-1 min-w-[100px] py-3 rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 font-bold text-xs hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-all border border-yellow-200/50 dark:border-yellow-500/20"
                >
                  HƠI NHỚ
                </button>
                <button 
                  onClick={() => handleRate(5)} 
                  className="flex-1 min-w-[100px] py-3 rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 font-bold text-xs hover:bg-green-100 dark:hover:bg-green-500/20 transition-all border border-green-200/50 dark:border-green-500/20"
                >
                  NHỚ RÕ
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
