import React, { useEffect, useState } from 'react';
import { SurahDetail } from '../types';
import { getSurahInsight } from '../services/geminiService';
import { XMarkIcon, SparklesIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface GeminiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  surah: SurahDetail | null;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ isOpen, onClose, surah }) => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastSurahNumber, setLastSurahNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      if (isOpen && surah && surah.number !== lastSurahNumber) {
        setLoading(true);
        setInsight("");
        const text = await getSurahInsight(surah.name, surah.englishName, surah.numberOfAyahs);
        setInsight(text);
        setLoading(false);
        setLastSurahNumber(surah.number);
      }
    };

    fetchInsight();
  }, [isOpen, surah, lastSurahNumber]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel Positioned on the LEFT (opposite to RTL sidebar) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-[450px] bg-theme-surface shadow-2xl transform transition-transform duration-300 ease-out border-r border-theme-border ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col text-right">
          {/* Header */}
          <div className="p-6 border-b border-theme-border bg-theme-surface flex justify-between items-start">
             <button onClick={onClose} className="p-2 hover:bg-theme-surface-hover rounded-full text-theme-text-muted hover:text-theme-text-primary transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-left">
              <div className="flex items-center justify-end gap-2 text-indigo-700 dark:text-indigo-400 mb-1">
                <span className="font-bold text-sm tracking-wide font-sans">المرافق الذكي</span>
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-theme-text-primary">
                {surah ? `${surah.name}` : 'اختر سورة'}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-theme-bg-secondary">
            {!surah ? (
               <div className="flex items-center justify-center h-full text-theme-text-muted font-sans">
                 الرجاء فتح سورة لعرض التفسير.
               </div>
            ) : loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-theme-surface-hover rounded w-3/4 mr-auto"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-theme-surface-hover rounded"></div>
                    <div className="h-3 bg-theme-surface-hover rounded"></div>
                    <div className="h-3 bg-theme-surface-hover rounded w-5/6"></div>
                </div>
                <div className="h-32 bg-theme-surface-hover rounded-lg"></div>
              </div>
            ) : (
              <div className="prose prose-stone dark:prose-invert prose-headings:font-serif prose-headings:text-emerald-800 dark:prose-headings:text-emerald-300 prose-p:text-stone-600 dark:prose-p:text-stone-300 prose-li:text-stone-600 dark:prose-li:text-stone-300 font-serif leading-loose" dir="rtl">
                 <ReactMarkdown>{insight}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-theme-border text-xs text-center text-theme-text-muted bg-theme-surface font-sans">
            محتوى مولد بالذكاء الاصطناعي. يرجى التحقق من المصادر.
          </div>
        </div>
      </div>
    </>
  );
};

export default GeminiPanel;