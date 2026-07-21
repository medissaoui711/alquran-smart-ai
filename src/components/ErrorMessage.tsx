import React from 'react';
import { useQuranStore } from '../store';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const { fetchSurahList, resumeLastRead } = useQuranStore();

  const handleRetry = async () => {
    useQuranStore.setState({ error: null, isLoading: true });
    try {
      await fetchSurahList();
      resumeLastRead();
    } catch (e) {
      console.error('Retry failed', e);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 text-center flex-col bg-stone-50 dark:bg-stone-950">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 flex flex-col items-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h3 className="text-xl font-bold font-amiri text-stone-800 dark:text-stone-100 mb-2">
          تعذر تحميل بيانات المصحف
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">
          {error}
        </p>
        <button 
          onClick={handleRetry}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  );
};
