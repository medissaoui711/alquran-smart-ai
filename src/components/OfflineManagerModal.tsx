import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore, useQuranStore, useSettingsStore } from '../store';
import { getOfflineSurahNumbers, deleteOfflineSurah, downloadSurahForOffline } from '../services/offlineService';
import { RECITERS, getReciterById } from '../data/reciters';
import { fetchSurahDetails } from '../services/quranService';

export const OfflineManagerModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const { surahs } = useQuranStore();
  const { reciterId, setReciterId } = useSettingsStore();

  const [downloadedSurahIds, setDownloadedSurahIds] = useState<number[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const currentReciter = getReciterById(reciterId);

  const refreshDownloadedList = async () => {
    const ids = await getOfflineSurahNumbers();
    setDownloadedSurahIds(ids);
  };

  useEffect(() => {
    if (activeModal === 'offlineManager') {
      refreshDownloadedList();
    }
  }, [activeModal]);

  if (activeModal !== 'offlineManager') return null;

  const handleDownloadSingle = async (surahNumber: number) => {
    setDownloadingId(surahNumber);
    setProgress(10);
    setProgressMsg('جاري جلب بيانات السورة...');

    try {
      const detail = await fetchSurahDetails(surahNumber);
      if (detail) {
        await downloadSurahForOffline(detail, reciterId, (p, msg) => {
          setProgress(p);
          setProgressMsg(msg);
        });
        await refreshDownloadedList();
      }
    } catch (err) {
      console.error(err);
      setProgressMsg('حدث خطأ أثناء التحميل.');
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1000);
    }
  };

  const handleDeleteSingle = async (surahNumber: number) => {
    await deleteOfflineSurah(surahNumber, reciterId);
    await refreshDownloadedList();
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchTerm) || 
    s.number.toString().includes(searchTerm)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-stone-900 border border-emerald-500/30 rounded-2xl p-6 text-stone-100 shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-100 font-serif">إدارة القارئ والتخزين للأوفلاين</h3>
                <p className="text-xs text-stone-400">تنزيل السور والتلاوات للاستماع والقراءة بدون إنترنت</p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Reciter Selector Section */}
          <div className="py-4 border-b border-stone-800">
            <label className="block text-xs font-medium text-emerald-300 mb-2">اختر المقرئ المفضل للتلاوة الصوتية:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RECITERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReciterId(r.id)}
                  className={`p-2.5 rounded-xl text-right text-xs transition-all border ${
                    reciterId === r.id
                      ? 'bg-emerald-900/60 border-emerald-500 text-emerald-100 font-bold shadow-md shadow-emerald-950'
                      : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span>{r.name}</span>
                    {r.id === 'alaa_aql' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">مميز</span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate">{r.subtext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Download Overview */}
          <div className="py-3 flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="ابحث عن سورة لتنزيلها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-stone-100 outline-none"
            />
            <div className="text-xs text-emerald-300 font-sans">
              المحفوظة: <span className="font-bold text-amber-300">{downloadedSurahIds.length}</span> من 114 سورة
            </div>
          </div>

          {/* Surah Download List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredSurahs.map((surah) => {
              const isDownloaded = downloadedSurahIds.includes(surah.number);
              const isCurrentDownloading = downloadingId === surah.number;

              return (
                <div
                  key={surah.number}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 text-xs text-emerald-400 font-bold flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-100 font-serif">سورة {surah.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        {surah.numberOfAyahs} آية • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </p>
                    </div>
                  </div>

                  {isCurrentDownloading ? (
                    <div className="text-left max-w-[140px]">
                      <span className="text-[11px] text-emerald-300 block truncate">{progressMsg}</span>
                      <div className="w-24 h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : isDownloaded ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        محفوظة أوفلاين
                      </span>
                      <button
                        onClick={() => handleDeleteSingle(surah.number)}
                        title="حذف من الأوفلاين"
                        className="p-1.5 hover:bg-red-950/50 hover:text-red-400 text-stone-500 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadSingle(surah.number)}
                      className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      تحميل أوفلاين
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
