import { useState, useEffect } from 'react';
import { X, Check, Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SaveVocabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vocab: any;
  onSuccess?: (word: string) => void;
}

export function SaveVocabDialog({ isOpen, onClose, vocab, onSuccess }: SaveVocabDialogProps) {
  const [existingTopics, setExistingTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
      setSelectedTopics([]);
      setNewTopic('');
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vocabulary/topics');
      if (res?.success) {
        setExistingTopics(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const addNewTopic = () => {
    const topic = newTopic.trim();
    if (topic && !existingTopics.includes(topic) && !selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
      setExistingTopics([...existingTopics, topic]);
      setNewTopic('');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/vocabulary/save', {
        word: vocab.word,
        pronunciation: vocab.pronunciation,
        partOfSpeech: vocab.partOfSpeech,
        meaning: vocab.meaning,
        examples: vocab.examples,
        topics: selectedTopics,
      });
      if (onSuccess) onSuccess(vocab.word);
      onClose();
    } catch (error) {
      console.error('Failed to save vocabulary:', error);
      alert('Đã xảy ra lỗi khi lưu từ vựng.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-primary">✦</span> Lưu từ vựng
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{vocab?.word}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{vocab?.meaning}</div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Chọn chủ đề (Topics)
            </label>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {existingTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5
                      ${selectedTopics.includes(topic)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                  >
                    {selectedTopics.includes(topic) && <Check size={14} />}
                    {topic}
                  </button>
                ))}
                {existingTopics.length === 0 && (
                  <div className="text-sm text-slate-400 italic">Chưa có chủ đề nào.</div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Thêm chủ đề mới..."
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNewTopic()}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-primary/30"
              />
              <button
                onClick={addNewTopic}
                disabled={!newTopic.trim()}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Lưu lại'}
          </button>
        </div>
      </div>
    </div>
  );
}
