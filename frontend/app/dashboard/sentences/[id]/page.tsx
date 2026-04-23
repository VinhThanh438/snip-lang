"use client";

import { SaveVocabDialog } from "@/components/save-vocab-dialog";
import { UnsaveVocabDialog } from "@/components/unsave-vocab-dialog";
import { api } from "@/lib/api";
import { ArrowLeft, BookmarkCheck, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SentenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVocab, setSelectedVocab] = useState<any>(null);
  const [vocabToUnsave, setVocabToUnsave] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/sentences/${id}`);
        setData(res.data);

        if (res.data?.analysis?.vocabulary) {
          const words = res.data.analysis.vocabulary.map((v: any) => v.word);
          const checkRes = await api.post("/vocabulary/check-saved", { words });
          if (checkRes?.success) {
            setSavedWords(
              checkRes.data.map((item: any) => item.word.toLowerCase()),
            );
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  if (!data?.sentence)
    return (
      <div className="p-8 text-center text-slate-400">
        Không tìm thấy câu này.
      </div>
    );

  const { sentence, analysis } = data;

  const handleSaveSuccess = (word: string) => {
    setSavedWords((prev) => [...prev, word.toLowerCase()]);
  };

  const handleUnsaveSuccess = (word: string) => {
    setSavedWords((prev) => prev.filter((w) => w !== word.toLowerCase()));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại
      </Link>

      {/* Hero Section */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        <h2 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white mb-6 leading-relaxed">
          "{sentence.text}"
        </h2>

        {analysis ? (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-indigo-900 dark:text-indigo-100 font-medium text-lg">
            {analysis.translation}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 flex items-center gap-3">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
            AI đang phân tích câu này... Vui lòng quay lại sau ít phút.
          </div>
        )}
      </div>

      {analysis && (
        <div className="space-y-8">
          {/* Grammar */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-primary">✦</span> Cấu trúc ngữ pháp
            </h2>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-4 mb-4">
                <div className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 mr-2">Cấu trúc:</span>{" "}
                  {analysis.grammar.structure}
                </div>
                <div className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 mr-2">Thì:</span>{" "}
                  {analysis.grammar.tense}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                {analysis.grammar.explanation}
              </p>

              <div className="space-y-3">
                {analysis.grammar.highlights.map((hl: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                  >
                    <div className="sm:w-1/4">
                      <span className="font-semibold text-primary">
                        {hl.text}
                      </span>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                        {hl.role}
                      </div>
                    </div>
                    <div className="sm:w-3/4 text-sm text-slate-600 dark:text-slate-400">
                      {hl.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Vocabulary */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-secondary">✦</span> Từ vựng quan trọng
            </h2>
            <div className="grid gap-4">
              {analysis.vocabulary.map((v: any, idx: number) => {
                const isSaved = savedWords.includes(v.word.toLowerCase());
                return (
                  <div
                    key={idx}
                    className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 relative group"
                  >
                    <button
                      onClick={() =>
                        isSaved ? setVocabToUnsave(v.word) : setSelectedVocab(v)
                      }
                      className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                        isSaved
                          ? "text-primary opacity-100"
                          : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10"
                      }`}
                      title={isSaved ? "Bỏ lưu từ vựng" : "Lưu từ vựng"}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={24} />
                      ) : (
                        <BookmarkPlus size={24} />
                      )}
                    </button>
                    <div className="md:w-1/3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-8">
                          {v.word}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {v.partOfSpeech}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-mono text-sm mb-3 flex items-center gap-2">
                        /{v.pronunciation}/
                      </div>
                      <div className="text-secondary font-medium">
                        {v.meaning}
                      </div>
                    </div>

                    <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                      <div className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wider">
                        Ví dụ
                      </div>
                      <ul className="space-y-2">
                        {v.examples.map((ex: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 dark:text-slate-300 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-slate-300 dark:before:bg-white/20 before:rounded-full"
                          >
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Context & Similar */}
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                Ngữ cảnh sử dụng
              </h2>
              <div className="glass-panel p-6 rounded-2xl text-slate-700 dark:text-slate-300 leading-relaxed h-full">
                {analysis.context}
              </div>
            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                Câu tương tự
              </h2>
              <div className="glass-panel p-6 rounded-2xl h-full">
                <ul className="space-y-4">
                  {analysis.similarSentences.map((sim: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 dark:text-slate-300 pb-4 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0"
                    >
                      {sim}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}

      <SaveVocabDialog
        isOpen={!!selectedVocab}
        onClose={() => setSelectedVocab(null)}
        vocab={selectedVocab}
        onSuccess={handleSaveSuccess}
      />

      <UnsaveVocabDialog
        isOpen={!!vocabToUnsave}
        onClose={() => setVocabToUnsave(null)}
        word={vocabToUnsave || ""}
        onSuccess={handleUnsaveSuccess}
      />
    </div>
  );
}
