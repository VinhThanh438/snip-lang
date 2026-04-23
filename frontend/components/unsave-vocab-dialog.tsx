import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface UnsaveVocabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  onSuccess: (word: string) => void;
}

export function UnsaveVocabDialog({ isOpen, onClose, word, onSuccess }: UnsaveVocabDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUnsave = async () => {
    try {
      setLoading(true);
      await api.delete('/vocabulary/unsave', { word });
      onSuccess(word);
      onClose();
    } catch (error) {
      console.error('Failed to unsave vocabulary:', error);
      alert('Đã xảy ra lỗi khi bỏ lưu từ vựng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Bỏ lưu từ vựng?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Bạn có chắc chắn muốn bỏ lưu từ <strong className="text-slate-900 dark:text-white">"{word}"</strong> không? Toàn bộ tiến trình học của từ này sẽ bị xóa.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleUnsave}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  );
}
