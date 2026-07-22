import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore, useQuranStore, useSettingsStore } from '../store';
import { downloadSurahForOffline, isSurahOfflineReady } from '../services/offlineService';
import { getReciterById } from '../data/reciters';

export const OfflineInvitationModal: React.FC = () => {
  const { activeModal, closeModal, pendingOfflineSurah } = useUIStore();
  const { loadedSurahs } = useQuranStore();
  const { reciterId } = useSettingsStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isAlreadyDownloaded, setIsAlreadyDownloaded] = useState(false);

  const currentSurahDetail = loadedSurahs.find(
    s => s.number === pendingOfflineSurah?.surahNumber
  ) || (loadedSurahs.length > 0 ? loadedSurahs[0] : null);

  const reciter = getReciterById(reciterId);

  useEffect(() => {
    if (currentSurahDetail) {
      isSurahOfflineReady(currentSurahDetail.number, reciterId).then(setIsAlreadyDownloaded);
    }
  }, [currentSurahDetail, reciterId]);

  if (activeModal !== 'offlinePrompt' || !pendingOfflineSurah) return null;

  const handleDownload = async () => {
    if (!currentSurahDetail) return;

    setIsDownloading(true);
    setDownloadProgress(5);
    setStatusMessage('جاري بدء التحميل...');

    try {
      await downloadSurahForOffline(currentSurahDetail, reciterId, (progress, label) => {
        setDownloadProgress(progress);
        setStatusMessage(label);
      });
      setIsAlreadyDownloaded(true);
      setTimeout(() => {
        setIsDownloading(false);
        closeModal();
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatusMessage('حدث خطأ أثناء التحميل. يرجى المحاولة لاحقاً.');
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-stone-900 border border-emerald-500/30 rounded-2xl p-6 text-stone-100 shadow-2xl overflow-hidden"
        >
          {/* Decorative Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/30">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-serif font-bold text-center text-emerald-100 mb-2">
            تحميل سورة {pendingOfflineSurah.surahName} للأوفلاين
          </h3>

          <p className="text-sm text-stone-300 text-center leading-relaxed mb-6">
            استمع واقرأ <span className="text-emerald-300 font-medium">سورة {pendingOfflineSurah.surahName}</span> بدون الحاجة لاتصال بالإنترنت، بصوت <span className="text-amber-300 font-medium">{reciter.name}</span>.
          </p>

          {/* Download Status & Progress Bar */}
          {isDownloading ? (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs text-emerald-300 font-sans">
                <span>{statusMessage}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-emerald-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ) : isAlreadyDownloaded ? (
            <div className="mb-6 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-center text-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              هذه السورة محفوطة بالفعل للعمل أوفلاين!
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!isDownloading && !isAlreadyDownloaded && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                تحميل الآن
              </button>
            )}

            <button
              onClick={closeModal}
              disabled={isDownloading}
              className={`py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl transition-all ${
                isAlreadyDownloaded ? 'w-full' : 'w-auto'
              }`}
            >
              {isAlreadyDownloaded ? 'إغلاق' : 'إلغاء'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
