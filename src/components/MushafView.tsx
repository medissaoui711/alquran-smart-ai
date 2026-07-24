import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ayah } from '../types';
import { 
    PlayIcon, PauseIcon, SparklesIcon, SunIcon, MoonIcon, 
    ArrowRightIcon, BookmarkIcon, BookmarkSolidIcon, XMarkIcon,
    CopyIcon, ShareIcon, QuestionMarkIcon
} from './Icons';
import { getAyahExplanation } from '../services/geminiService';
import { ClassicSurahHeader, ClassicAyahMarker, ClassicBismillah } from './MushafOrnaments';
import { useQuranStore, useSettingsStore, useUIStore } from '../store';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { getReciterById, RECITERS } from '../data/reciters';
import { isSurahOfflineReady } from '../services/offlineService';

// Helper interface
interface FlatAyah extends Ayah {
  surahName: string;
  surahNumber: number;
  isFirstAyahOfSurah: boolean;
  surahRevelation: string;
}

// Clean Arabic text helper & Tajweed duration weighting (accounts for Shaddah, Madd, Tanween)
const getTajweedWeight = (text: string): number => {
  if (!text) return 0;
  
  // Base clean character length (without diacritics)
  const cleanLen = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '').length;
  
  // Tajweed Extensions:
  // Shaddah (ّ)
  const shaddahCount = (text.match(/\u0651/g) || []).length;
  // Madd marks (ٰ, آ, ~, \u0670, \u0653)
  const maddCount = (text.match(/[\u0670\u0653آٰ~]/g) || []).length;
  // Tanween (\u064B, \u064C, \u064D)
  const tanweenCount = (text.match(/[\u064B\u064C\u064D]/g) || []).length;

  const weightedLetters = cleanLen + (shaddahCount * 0.8) + (maddCount * 1.4) + (tanweenCount * 0.5);
  
  // Minimal breath pause (Waqf) between verses (~3.5 character units)
  const VERSE_PAUSE_WEIGHT = 3.5;

  return weightedLetters + VERSE_PAUSE_WEIGHT;
};

interface AyahTimingItem {
  ayahNum: number;
  page: number;
  startTime: number;
  endTime: number;
}

// Computes precise relative timing boundaries for every verse in a full-surah audio stream
const getSurahAyahTimingMap = (surahObj: any, duration: number): AyahTimingItem[] => {
  if (!surahObj || !surahObj.ayahs || surahObj.ayahs.length === 0 || !duration || duration <= 0) {
    return [];
  }

  const surahNum = surahObj.number;
  // Surah 1 (Al-Fatiha) includes Bismillah as Ayah 1; Surah 9 (At-Tawbah) has no Bismillah
  const hasBismillah = surahNum !== 1 && surahNum !== 9;

  // Bismillah weight (~18 weight units = ~2.2 seconds)
  const BISMILLAH_WEIGHT = hasBismillah ? 18 : 0;

  const ayahWeights = surahObj.ayahs.map((a: any) => getTajweedWeight(a.text));
  const totalAyahWeight = ayahWeights.reduce((sum: number, w: number) => sum + w, 0);
  const totalWeight = BISMILLAH_WEIGHT + totalAyahWeight;

  if (totalWeight <= 0) return [];

  let cumulativeWeight = BISMILLAH_WEIGHT;
  const map: AyahTimingItem[] = [];

  for (let i = 0; i < surahObj.ayahs.length; i++) {
    const ayah = surahObj.ayahs[i];
    const startTime = (cumulativeWeight / totalWeight) * duration;
    cumulativeWeight += ayahWeights[i];
    const endTime = i === surahObj.ayahs.length - 1 ? duration : (cumulativeWeight / totalWeight) * duration;

    map.push({
      ayahNum: ayah.numberInSurah,
      page: ayah.page,
      startTime,
      endTime
    });
  }

  return map;
};

const AyahPopover = ({ 
    ayah, 
    onClose, 
    onPlay, 
    onBookmark, 
    onTafsir,
    isBookmarked,
    position 
}: { 
    ayah: FlatAyah; 
    onClose: () => void; 
    onPlay: () => void; 
    onBookmark: () => void;
    onTafsir: () => void;
    isBookmarked: boolean;
    position: { x: number, y: number } 
}) => {
    const handleCopy = () => {
        const shareText = `﴿ ${ayah.text} ﴾\n[${ayah.surahName}: ${ayah.numberInSurah}]\n\nتمت المشاركة من تطبيق مصحف برو\n${window.location.href}`;
        navigator.clipboard.writeText(shareText);
        onClose();
    };

    const handleShare = async () => {
        const shareText = `﴿ ${ayah.text} ﴾\n[${ayah.surahName}: ${ayah.numberInSurah}]`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `آية من ${ayah.surahName}`,
                    text: shareText,
                    url: window.location.href
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            handleCopy();
        }
        onClose();
    };

    const isSmallMobile = window.innerWidth < 480;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`
                fixed z-[100] bg-theme-surface/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-2
                ${isSmallMobile ? 'inset-x-4 bottom-24 w-auto rounded-3xl' : 'w-64 rounded-2xl'}
            `}
            style={!isSmallMobile ? { 
                left: Math.min(position.x - 128, window.innerWidth - 280),
                top: Math.max(80, position.y - 120)
            } : {}}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={`flex ${isSmallMobile ? 'flex-row overflow-x-auto scrollbar-hide py-2 px-1' : 'flex-col'} gap-1`}>
                <button 
                    onClick={() => { onPlay(); onClose(); }}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/10 text-theme-text-primary rounded-xl transition-all group ${isSmallMobile ? 'flex-shrink-0 flex-col' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <PlayIcon className="w-4 h-4 ml-0.5" />
                    </div>
                    <span className={`font-bold ${isSmallMobile ? 'text-[10px]' : 'text-sm'}`}>استماع</span>
                </button>

                <button 
                    onClick={() => { onTafsir(); onClose(); }}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/10 text-theme-text-primary rounded-xl transition-all group ${isSmallMobile ? 'flex-shrink-0 flex-col' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <SparklesIcon className="w-4 h-4" />
                    </div>
                    <span className={`font-bold ${isSmallMobile ? 'text-[10px]' : 'text-sm'}`}>تفسير</span>
                </button>

                <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/10 text-theme-text-primary rounded-xl transition-all group ${isSmallMobile ? 'flex-shrink-0 flex-col' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <CopyIcon className="w-4 h-4" />
                    </div>
                    <span className={`font-bold ${isSmallMobile ? 'text-[10px]' : 'text-sm'}`}>نسخ</span>
                </button>

                <button 
                    onClick={handleShare}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/10 text-theme-text-primary rounded-xl transition-all group ${isSmallMobile ? 'flex-shrink-0 flex-col' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ShareIcon className="w-4 h-4" />
                    </div>
                    <span className={`font-bold ${isSmallMobile ? 'text-[10px]' : 'text-sm'}`}>مشاركة</span>
                </button>

                <button 
                    onClick={() => { onBookmark(); onClose(); }}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/10 text-theme-text-primary rounded-xl transition-all group ${isSmallMobile ? 'flex-shrink-0 flex-col' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                    </div>
                    <span className={`font-bold ${isSmallMobile ? 'text-[10px]' : 'text-sm'}`}>{isBookmarked ? 'إلغاء' : 'حفظ'}</span>
                </button>
            </div>
            
            {/* Pointer Arrow (Desktop Only) */}
            {!isSmallMobile && (
                <div className="absolute left-1/2 -bottom-2 -ml-2 w-4 h-4 bg-theme-surface border-r border-b border-emerald-500/20 rotate-45" />
            )}
        </motion.div>
    );
};

const AyahHighlightSpan: React.FC<{
    isPlaying: boolean;
    isActive: boolean;
    displayText: string;
    onClick: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}> = ({ isPlaying, isActive, displayText, onClick, onMouseEnter, onMouseLeave }) => {
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isPlaying && spanRef.current) {
            spanRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }, [isPlaying]);

    return (
        <motion.span 
            ref={spanRef}
            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
            className={`
                cursor-pointer transition-all duration-300 decoration-clone px-1.5 py-0.5 rounded-lg leading-[2.8] inline
                ${isPlaying ? 'bg-emerald-500/25 text-emerald-950 dark:bg-emerald-800/80 dark:text-emerald-50 shadow-[0_0_18px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/70 dark:ring-emerald-400 font-bold' : ''}
                ${isActive ? 'bg-emerald-500/30 text-emerald-950 dark:bg-emerald-800/70 dark:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-600/60 dark:ring-emerald-400/80 font-bold' : ''}
            `}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            title="خيارات الآية"
        >
            {displayText}
        </motion.span>
    );
};

const QuranPage = React.memo(({ 
    pageNumber, 
    ayahs, 
    playingAyahKey, 
    activeAyahKey, 
    onAyahClick, 
    onAyahTafsir,
    setHoveredAyah,
    isLeftPage,
    isSingleView,
    fontSize,
    fontType
}: { 
    pageNumber: number;
    ayahs: FlatAyah[];
    playingAyahKey: string | null;
    activeAyahKey: string | null;
    onAyahClick: (e: React.MouseEvent, ayah: FlatAyah) => void;
    onAyahTafsir: (e: React.MouseEvent, surahName: string, ayah: FlatAyah) => void;
    setHoveredAyah: (id: number | null) => void;
    isLeftPage: boolean;
    isSingleView: boolean;
    fontSize: number;
    fontType: string;
}) => {
    const pageContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top whenever pageNumber changes
    useEffect(() => {
        if (pageContainerRef.current) {
            pageContainerRef.current.scrollTop = 0;
        }
    }, [pageNumber]);

    // Dynamic text sizing based on device width using clamps and viewport units
    const textStyle = {
        fontFamily: fontType,
        fontSize: `${isSingleView ? fontSize * 0.85 : fontSize}px`,
        lineHeight: '2.5',
    };

    return (
        <div className={`
            flex-1 bg-theme-surface h-full flex flex-col relative
            ${!isSingleView && isLeftPage ? 'rounded-l-2xl border-l border-theme-border/40' : ''}
            ${!isSingleView && !isLeftPage ? 'rounded-r-2xl border-r border-theme-border/40' : ''}
            ${isSingleView ? 'rounded-xl border border-theme-border shadow-sm' : ''}
            transition-colors duration-300 overflow-hidden select-none
        `}>
            {/* Page Header - Refined */}
            <div className="h-8 md:h-12 flex justify-between items-center px-4 md:px-6 text-[10px] md:text-xs text-theme-text-muted font-sans border-b border-theme-border/30 bg-theme-bg-secondary/30 backdrop-blur-sm">
                <span className="opacity-70">{ayahs[0]?.surahName}</span>
                <span className="font-bold text-theme-text-primary bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full shadow-sm">{pageNumber}</span>
                <span className="opacity-70">الجزء {ayahs[0]?.juz}</span>
            </div>

            {/* Page Content - Improved Typography and Spacing */}
            <div 
                ref={pageContainerRef}
                className="flex-1 overflow-y-auto px-4 md:px-12 pt-4 md:pt-8 pb-12 md:pb-8 scrollbar-hide md:scrollbar-thin scrollbar-thumb-emerald-500/20 overscroll-contain relative"
            >
                {/* Subtle Paper Texture */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                <div 
                    className="relative z-10 text-justify text-theme-text-primary transition-all duration-300 pb-2" 
                    dir="rtl"
                    style={textStyle}
                >
                    {ayahs.map((ayah) => {
                        const uniqueKey = `${ayah.surahNumber}:${ayah.numberInSurah}`;
                        const isPlaying = playingAyahKey === uniqueKey;
                        const isActive = activeAyahKey === uniqueKey;
                        const isBismillah = ayah.numberInSurah === 1 && ayah.surahNumber !== 1 && ayah.surahNumber !== 9;
                        const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
                        
                        let displayText = ayah.text;
                        if (isBismillah) {
                            displayText = displayText.replace(bismillahText, '').trim();
                        }

                        return (
                            <React.Fragment key={uniqueKey}>
                                {ayah.isFirstAyahOfSurah && (
                                    <div className="w-full select-none mb-4">
                                        <ClassicSurahHeader title={ayah.surahName} />
                                        {ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && (
                                            <ClassicBismillah />
                                        )}
                                    </div>
                                )}

                                <AyahHighlightSpan 
                                    isPlaying={isPlaying}
                                    isActive={isActive}
                                    displayText={displayText}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAyahClick(e, ayah);
                                    }}
                                    onMouseEnter={() => setHoveredAyah(ayah.number)}
                                    onMouseLeave={() => setHoveredAyah(null)}
                                />
                                <ClassicAyahMarker 
                                    number={ayah.numberInSurah} 
                                    onClick={(e) => onAyahTafsir(e, ayah.surahName, ayah)}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {!isSingleView && (
                 <div className={`absolute top-0 bottom-0 w-12 pointer-events-none z-10
                    ${isLeftPage ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'}
                    from-stone-400/15 to-transparent dark:from-black/50 dark:to-transparent
                 `}></div>
            )}
        </div>
    );
});

const MushafView: React.FC = () => {
  // Use Stores
  const { 
    loadedSurahs, 
    surahs: surahsList, 
    loadNextSurah, 
    loadPrevSurah,
    initialPageToLoad, 
    toggleBookmark, 
    bookmarks,
    activeAyah,
    setActiveAyah 
  } = useQuranStore();
  const [isSwipingSurah, setIsSwipingSurah] = useState(false);
  const { fontSize, fontType, theme, setTheme, reciterId, setReciterId } = useSettingsStore();
  const { isMobile, isTablet, isDesktop, openModal, openOfflinePrompt, showSplash, setShowSplash, setDrawerOpen } = useUIStore();
  const isOffline = useOfflineStatus();

  const activeReciter = getReciterById(reciterId);

  const isBookmarked = loadedSurahs.length > 0 && bookmarks.some(b => b.surahNumber === loadedSurahs[0].number);

  // Data Transformation
  const pages = useMemo(() => {
    const map = new Map<number, FlatAyah[]>();
    const seenAyahsOnPage = new Map<number, Set<string>>();

    loadedSurahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            const pageNum = ayah.page;
            if (!map.has(pageNum)) {
                map.set(pageNum, []);
                seenAyahsOnPage.set(pageNum, new Set<string>());
            }
            
            const ayahKey = `${surah.number}:${ayah.numberInSurah}`;
            if (!seenAyahsOnPage.get(pageNum)!.has(ayahKey)) {
                seenAyahsOnPage.get(pageNum)!.add(ayahKey);
                map.get(pageNum)!.push({
                    ...ayah,
                    surahName: surah.name,
                    surahNumber: surah.number,
                    isFirstAyahOfSurah: ayah.numberInSurah === 1,
                    surahRevelation: surah.revelationType
                });
            }
        });
    });
    return new Map<number, FlatAyah[]>([...map.entries()].sort((a, b) => a[0] - b[0]));
  }, [loadedSurahs]);

  // Refs to avoid stale closures in audio callbacks
  const surahsRef = useRef(loadedSurahs);
  surahsRef.current = loadedSurahs;
  
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const pageNumbers = Array.from(pages.keys()) as number[];

  // Initialize Page State
  const [currentRightPage, setCurrentRightPage] = useState<number>(() => {
     if (initialPageToLoad && pages.has(initialPageToLoad)) return initialPageToLoad;
     if (pageNumbers.length > 0) return pageNumbers[0];
     return 1;
  });

  // Effect: Reset or jump to specific page when `initialPageToLoad` changes or `pages` load
  useEffect(() => {
    if (initialPageToLoad && pages.has(initialPageToLoad)) {
        setCurrentRightPage(initialPageToLoad);
        useQuranStore.setState({ initialPageToLoad: null });
    } else if (pageNumbers.length > 0 && !pages.has(currentRightPage)) {
        setCurrentRightPage(pageNumbers[0]);
    }
  }, [initialPageToLoad, pages, pageNumbers, currentRightPage]);

  // Effect: Persist exact reading position
  useEffect(() => {
      if (currentRightPage) {
          localStorage.setItem('quran_last_page', currentRightPage.toString());
      }
  }, [currentRightPage]);

  // Audio State & Refs
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [playingState, setPlayingState] = useState<{ surah: number, ayah: number } | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCurrentSurahOffline, setIsCurrentSurahOffline] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null); // For pre-fetching
  const playAyahRef = useRef<(s: number, a: number) => void>(() => {});
  const audioContextRef = useRef<AudioContext | null>(null); // For Safari Unlock

  // Check offline readiness for current surah
  useEffect(() => {
    if (loadedSurahs.length > 0) {
      isSurahOfflineReady(loadedSurahs[0].number, reciterId).then(setIsCurrentSurahOffline);
    }
  }, [loadedSurahs, reciterId]);

  // Interaction State
  const [popoverContent, setPopoverContent] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number} | null>(null);
  const [ayahMenuPosition, setAyahMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [selectedAyahForMenu, setSelectedAyahForMenu] = useState<FlatAyah | null>(null);
  
  // Minimum Splash Duration
  useEffect(() => {
    if (showSplash) {
        // If data is already here, we can hide it faster
        const delay = surahsList.length > 0 ? 1500 : 3000;
        const timer = setTimeout(() => {
            if (surahsList.length > 0) {
                setShowSplash(false);
            }
        }, delay);
        return () => clearTimeout(timer);
    }
  }, [surahsList.length, showSplash, setShowSplash]);

  // If surahs finally load after the minimum time, hide splash
  useEffect(() => {
    if (surahsList.length > 0 && showSplash) {
        const timer = setTimeout(() => setShowSplash(false), 500); 
        return () => clearTimeout(timer);
    }
  }, [surahsList.length, showSplash, setShowSplash]);
  
  // Persistence: Save current page to localStorage
  useEffect(() => {
    if (loadedSurahs.length > 0) {
        // Find the surah that corresponds to the current page
        // We look for any ayah on the current page to identify the surah
        const surahOnPage = loadedSurahs.find(s => s.ayahs.some(a => a.page === currentRightPage));
        if (surahOnPage) {
            localStorage.setItem('lastRead', JSON.stringify({
                surah: surahOnPage.number,
                page: currentRightPage
            }));
        }
    }
  }, [currentRightPage, loadedSurahs]);

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress for the progress bar
  useEffect(() => {
    const handleScroll = () => {
        // Since pages are in a flex container, we can track the current page vs total pages
        const progress = ((currentRightPage) / Math.max(...pageNumbers)) * 100;
        setScrollProgress(progress);
    };
    handleScroll();
  }, [currentRightPage, pageNumbers]);

  // Safari Audio Unlock Logic
  const unlockAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  }, []);

  // One-time listener for first interaction
  useEffect(() => {
      const handleFirstInteraction = () => {
          unlockAudioContext();
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('click', handleFirstInteraction);
      return () => {
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('click', handleFirstInteraction);
      };
  }, [unlockAudioContext]);


  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRightPage]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') handlePrevPage();
          if (e.key === 'ArrowLeft') handleNextPage();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRightPage, isMobile, pageNumbers]);

  const handleNextPage = async () => {
      const step = isMobile ? 1 : 2;
      const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;
      const nextPage = currentRightPage + step;

      if (nextPage > maxPage) {
          const lastSurah = loadedSurahs[loadedSurahs.length - 1] || useQuranStore.getState().selectedSurah;
          if (lastSurah && lastSurah.number < 114) {
              setIsSwipingSurah(true);
              useQuranStore.setState({ initialPageToLoad: nextPage });
              await loadNextSurah();
              setIsSwipingSurah(false);
              setCurrentRightPage(nextPage);
          }
      } else {
          setCurrentRightPage(nextPage);
      }
  };

  const handlePrevPage = async () => {
      const step = isMobile ? 1 : 2;
      const minPage = pageNumbers.length > 0 ? Math.min(...pageNumbers) : 1;
      const prevPage = currentRightPage - step;

      if (prevPage < minPage) {
          const firstSurah = loadedSurahs[0] || useQuranStore.getState().selectedSurah;
          if (firstSurah && firstSurah.number > 1) {
              setIsSwipingSurah(true);
              useQuranStore.setState({ initialPageToLoad: prevPage });
              await loadPrevSurah();
              setIsSwipingSurah(false);
              setCurrentRightPage(prevPage);
          } else if (firstSurah && firstSurah.number === 1 && currentRightPage === 1) {
              // At Al-Fatihah (Page 1), fallback to next page/surah so swipe always responds
              await handleNextPage();
          }
      } else if (prevPage >= 1) {
          setCurrentRightPage(prevPage);
      }
  };

  // --- Mouse / Touch Handlers ---
  const minSwipeDistance = 35; // Responsive threshold for gesture

  const onDragStart = (clientX: number) => {
      setTouchEnd(null);
      setTouchStart(clientX);
      unlockAudioContext();
  };

  const onDragMove = (clientX: number) => {
      if (touchStart !== null) {
          setTouchEnd(clientX);
      }
  };

  const onDragEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;  // Dragging finger Left (<--)
      const isRightSwipe = distance < -minSwipeDistance; // Dragging finger Right (-->)

      // Arabic book direction:
      // Pulling from left to right (--> Right Swipe) goes to the NEXT page.
      // Pulling from right to left (<-- Left Swipe) goes to the PREVIOUS page.
      if (isRightSwipe) {
          handleNextPage();
      } else if (isLeftSwipe) {
          handlePrevPage();
      }
      
      setTouchStart(null);
      setTouchEnd(null);
  };

  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => onDragMove(e.targetTouches[0].clientX);
  const onTouchEnd = onDragEnd;

  const onMouseDown = (e: React.MouseEvent) => onDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => onDragMove(e.clientX);
  const onMouseUp = onDragEnd;
  const onMouseLeave = () => {
      if (touchStart !== null) {
          onDragEnd();
      }
  };

  const preloadNextAyah = useCallback((surahNum: number, ayahNum: number) => {
      const reciter = getReciterById(useSettingsStore.getState().reciterId);
      if (reciter.type !== 'ayah') {
          nextAudioRef.current = null;
          return;
      }

      const currentSurah = surahsRef.current.find(s => s.number === surahNum);
      if (!currentSurah) return;

      let nextSurahNum = surahNum;
      let nextAyahNum = ayahNum + 1;

      // Check if we need to move to next Surah
      if (nextAyahNum > currentSurah.numberOfAyahs) {
          nextSurahNum = surahNum + 1;
          nextAyahNum = 1;
      }

      let nextAudioUrl = '';
      if (reciter.getAyahAudioUrl) {
          nextAudioUrl = reciter.getAyahAudioUrl(nextSurahNum, nextAyahNum);
      }

      if (nextAudioUrl) {
          const audio = new Audio(nextAudioUrl);
          audio.preload = 'auto';
          nextAudioRef.current = audio;
      } else {
          nextAudioRef.current = null;
      }
  }, []);

  const playAyah = useCallback((surahNum: number, ayahNum: number) => {
      unlockAudioContext();

      // Find Ayah Data in current pages
      let targetAyah: FlatAyah | undefined;
      let foundPage = -1;

      for (const [pNum, pAyahs] of pagesRef.current.entries()) {
          const found = pAyahs.find(a => a.surahNumber === surahNum && a.numberInSurah === ayahNum);
          if (found) {
              targetAyah = found;
              foundPage = pNum;
              break;
          }
      }

      if (!targetAyah) {
          const maxLoadedSurah = Math.max(...surahsRef.current.map(s => s.number));
          if (surahNum > maxLoadedSurah) {
             loadNextSurah();
          }
          setIsPlaying(false);
          return;
      }

      // Handle Page Flipping
      if (foundPage > 0) {
        setCurrentRightPage(curr => {
          if (!isMobile) {
              const neededRightPage = foundPage % 2 !== 0 ? foundPage : foundPage - 1;
              return curr !== neededRightPage ? neededRightPage : curr;
          } else {
               return curr !== foundPage ? foundPage : curr;
          }
        });
      }

      const reciter = getReciterById(reciterId);

      // Fast seek if surah-based audio is already loaded and playing the same surah
      if (reciter.type === 'surah' && currentAudioRef.current && playingState?.surah === surahNum && currentAudioRef.current.duration > 0) {
          const surahObj = surahsRef.current.find(s => s.number === surahNum);
          if (surahObj) {
              const timingMap = getSurahAyahTimingMap(surahObj, currentAudioRef.current.duration);
              const targetTiming = timingMap.find(m => m.ayahNum === ayahNum);
              if (targetTiming) {
                  currentAudioRef.current.currentTime = targetTiming.startTime;
                  setAudioCurrentTime(targetTiming.startTime);
                  setPlayingState({ surah: surahNum, ayah: ayahNum });
                  if (currentAudioRef.current.paused) {
                      currentAudioRef.current.play().catch(() => {});
                      setIsPlaying(true);
                  }
                  return;
              }
          }
      }

      // Stop previous audio safely if switching surah or audio stream
      if (currentAudioRef.current) {
          const prevAudio = currentAudioRef.current;
          prevAudio.onended = null;
          prevAudio.onerror = null;
          prevAudio.ontimeupdate = null;
          prevAudio.onloadedmetadata = null;
          try {
              prevAudio.pause();
          } catch (e) {
              // ignore pause errors on interrupted audio
          }
      }

      // Determine Audio URL based on selected reciter
      let audioUrl = '';
      if (reciter.type === 'surah' && reciter.getSurahAudioUrl) {
          audioUrl = reciter.getSurahAudioUrl(surahNum);
      } else if (reciter.type === 'ayah' && reciter.getAyahAudioUrl) {
          audioUrl = reciter.getAyahAudioUrl(surahNum, ayahNum);
      } else {
          audioUrl = targetAyah.audio;
      }

      let audio: HTMLAudioElement;
      if (nextAudioRef.current && nextAudioRef.current.src === audioUrl) {
          audio = nextAudioRef.current;
          nextAudioRef.current = null;
      } else {
          audio = new Audio(audioUrl);
          audio.preload = 'auto';
      }

      audio.playbackRate = playbackRate;
      currentAudioRef.current = audio;
      setPlayingState({ surah: surahNum, ayah: ayahNum });
      setIsPlaying(true);

      audio.ontimeupdate = () => {
          setAudioCurrentTime(audio.currentTime);

          if (reciter.type === 'surah' && audio.duration > 0) {
              const surahObj = surahsRef.current.find(s => s.number === surahNum);
              if (surahObj) {
                  const timingMap = getSurahAyahTimingMap(surahObj, audio.duration);
                  if (timingMap.length > 0) {
                      // 1.4s advance sync lead ensures the highlight transitions to the next verse BEFORE or EXACTLY as the qari begins pronouncing it, completely eliminating lag
                      const SYNC_LEAD = 1.4;
                      const checkTime = audio.currentTime + SYNC_LEAD;

                      let matchedItem = timingMap.find(item => checkTime >= item.startTime && checkTime < item.endTime);
                      if (!matchedItem && checkTime >= timingMap[timingMap.length - 1].endTime) {
                          matchedItem = timingMap[timingMap.length - 1];
                      }
                      if (!matchedItem && checkTime < timingMap[0].startTime) {
                          matchedItem = timingMap[0];
                      }

                      if (matchedItem) {
                          const matchedAyah = matchedItem.ayahNum;
                          const matchedPage = matchedItem.page;

                          setPlayingState(prev => {
                              if (!prev || prev.surah !== surahNum || prev.ayah !== matchedAyah) {
                                  if (matchedPage > 0) {
                                      setCurrentRightPage(curr => {
                                          if (!isMobile) {
                                              const needed = matchedPage % 2 !== 0 ? matchedPage : matchedPage - 1;
                                              return curr !== needed ? needed : curr;
                                          } else {
                                              return curr !== matchedPage ? matchedPage : curr;
                                          }
                                      });
                                  }
                                  return { surah: surahNum, ayah: matchedAyah };
                              }
                              return prev;
                          });
                      }
                  }
              }
          }
      };

      audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration || 0);

          if (reciter.type === 'surah' && audio.duration > 0 && ayahNum > 1) {
              const surahObj = surahsRef.current.find(s => s.number === surahNum);
              if (surahObj) {
                  const timingMap = getSurahAyahTimingMap(surahObj, audio.duration);
                  const targetTiming = timingMap.find(m => m.ayahNum === ayahNum);
                  if (targetTiming) {
                      audio.currentTime = targetTiming.startTime;
                      setAudioCurrentTime(targetTiming.startTime);
                  }
              }
          }

          audio.play().catch(e => {
              console.warn("Audio play error:", e);
              setIsPlaying(false);
          });
      };

      // Preload next audio if ayah-by-ayah mode
      if (reciter.type === 'ayah') {
          preloadNextAyah(surahNum, ayahNum);
      }

      audio.onended = () => {
          const surahInfo = surahsRef.current.find(s => s.number === surahNum);
          if (reciter.type === 'ayah' && surahInfo) {
            if (ayahNum < surahInfo.numberOfAyahs) {
                playAyahRef.current(surahNum, ayahNum + 1);
            } else {
                playAyahRef.current(surahNum + 1, 1);
            }
          } else if (reciter.type === 'surah') {
            playAyahRef.current(surahNum + 1, 1);
          } else {
            setIsPlaying(false);
          }
      };

      audio.onerror = (e) => {
          console.warn("Audio playback issue for URL:", audioUrl, e);
          setIsPlaying(false);

          // Fallback to default ayah audio if custom reciter failed
          if (targetAyah && targetAyah.audio && targetAyah.audio !== audioUrl) {
              const fallbackAudio = new Audio(targetAyah.audio);
              fallbackAudio.playbackRate = playbackRate;
              currentAudioRef.current = fallbackAudio;
              fallbackAudio.ontimeupdate = () => setAudioCurrentTime(fallbackAudio.currentTime);
              fallbackAudio.onloadedmetadata = () => setAudioDuration(fallbackAudio.duration || 0);
              fallbackAudio.onended = () => setIsPlaying(false);
              fallbackAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              return;
          }

          if (isOffline) {
              const surahInfo = surahsRef.current.find(s => s.number === surahNum);
              if (surahInfo) {
                  openOfflinePrompt(surahInfo.number, surahInfo.name);
              }
          }
      };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => {
              if (e.name !== 'AbortError') {
                  console.warn("Play prevented or interrupted:", e);
              }
              setIsPlaying(false);
          });
      }

  }, [isMobile, reciterId, playbackRate, isOffline, openOfflinePrompt, loadNextSurah, preloadNextAyah, unlockAudioContext]); 

  // Keep ref updated
  useEffect(() => {
      playAyahRef.current = playAyah;
  }, [playAyah]);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
        const audio = currentAudioRef.current;
        audio.onended = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
        audio.onloadedmetadata = null;
        try {
            audio.pause();
        } catch (e) {
            // ignore
        }
        audio.currentTime = 0;
        currentAudioRef.current = null;
    }
    setIsPlaying(false);
    setIsPlayerMinimized(false);
    setPlayingState(null);
  }, []);

  const togglePlay = useCallback(() => {
    unlockAudioContext();
    if (isPlaying) {
      if (currentAudioRef.current) {
          try {
              currentAudioRef.current.pause();
          } catch (e) {
              // ignore
          }
      }
      setIsPlaying(false);
    } else {
      if (currentAudioRef.current) {
          const promise = currentAudioRef.current.play();
          if (promise !== undefined) {
              promise.catch((e) => {
                  if (e.name !== 'AbortError') {
                      console.warn("Play error:", e);
                  }
                  setIsPlaying(false);
              });
          }
          setIsPlaying(true);
      } else if (playingState) {
          playAyah(playingState.surah, playingState.ayah);
      } else {
          // Start from first ayah of current visible page
          const pageAyahs = pages.get(currentRightPage);
          if (pageAyahs && pageAyahs.length > 0) {
              const startAyah = pageAyahs[0];
              playAyah(startAyah.surahNumber, startAyah.numberInSurah);
          }
      }
    }
  }, [isPlaying, playingState, playAyah, pages, currentRightPage, unlockAudioContext]);

  // Clean up on unmount
  useEffect(() => {
      return () => {
          if (currentAudioRef.current) currentAudioRef.current.pause();
      };
  }, []);

  const handleAyahTafsir = useCallback(async (e: React.MouseEvent, surahName: string, ayah: FlatAyah) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPosition({ x: rect.left + window.scrollX, y: rect.top + window.scrollY - 10 });
    setPopoverContent(null);
    const explanation = await getAyahExplanation(surahName, ayah.numberInSurah, ayah.text);
    setPopoverContent(explanation);
  }, []);

  const handleAyahClick = useCallback((e: React.MouseEvent, ayah: FlatAyah) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const key = `${ayah.surahNumber}:${ayah.numberInSurah}`;
    
    if (activeAyah === key) {
        setActiveAyah(null);
        setSelectedAyahForMenu(null);
    } else {
        setActiveAyah(key);
        setSelectedAyahForMenu(ayah);
        setAyahMenuPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setPopoverContent(null);
  }, [activeAyah, setActiveAyah]);

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setAudioCurrentTime(time);
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = time;
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (currentAudioRef.current) {
      currentAudioRef.current.playbackRate = nextSpeed;
    }
  };

  const rightPageData = pages.get(currentRightPage);
  const leftPageNum = currentRightPage + 1;
  const leftPageData = pages.get(leftPageNum);

  // Preload next surah if the left page is missing in two-page mode (e.g., Al-Fatihah)
  useEffect(() => {
      if (!isMobile && rightPageData && !leftPageData && leftPageNum <= 604 && !isSwipingSurah) {
          const lastSurah = loadedSurahs[loadedSurahs.length - 1] || useQuranStore.getState().selectedSurah;
          if (lastSurah && lastSurah.number < 114) {
              loadNextSurah();
          }
      }
  }, [isMobile, rightPageData, leftPageData, leftPageNum, isSwipingSurah, loadedSurahs, loadNextSurah]);

  return (
    <AnimatePresence mode="wait">
      {showSplash || surahsList.length === 0 ? (
        <motion.div 
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6 md:p-12 text-center overflow-hidden"
        >
          {/* Ambient background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 max-w-sm w-full flex flex-col items-center"
          >
            {/* Minimalist Vector Islamic Emblem */}
            <div className="relative mb-8 flex items-center justify-center">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.04, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-950 p-1 shadow-2xl shadow-emerald-900/30 ring-1 ring-emerald-500/30 flex items-center justify-center relative"
                >
                    <div className="w-full h-full rounded-[22px] bg-stone-900/90 backdrop-blur-md flex items-center justify-center border border-emerald-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-300 via-emerald-500 to-transparent" />
                        <svg className="w-14 h-14 md:w-18 md:h-18 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            <path d="M12 6v8" stroke="#fef08a" strokeWidth="1.5" />
                            <path d="M9 9h6" stroke="#fef08a" strokeWidth="1.5" />
                        </svg>
                    </div>
                </motion.div>
                
                {/* Decorative soft glow */}
                <div className="absolute -inset-6 bg-emerald-500/15 blur-3xl rounded-full -z-10 animate-pulse" />
            </div>

            <h2 className="text-3xl md:text-4xl font-amiri font-bold text-emerald-900 dark:text-emerald-100 mb-4 tracking-wide">المصحف الشريف</h2>
            
            <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                    ))}
                </div>
                <p className="text-emerald-800/60 dark:text-emerald-200/40 font-sans text-sm font-medium tracking-[0.2em] uppercase">
                    {surahsList.length > 0 ? 'استعد للبدء' : 'جاري تحميل المصحف'}
                </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          key="main-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 h-full flex flex-col bg-theme-bg-secondary relative overflow-hidden transition-colors duration-500 select-none" 
          onClick={() => {
              setPopoverContent(null);
              setSelectedAyahForMenu(null);
              setActiveAyah(null);
          }}
        >
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>وضع الأوفلاين (بدون إنترنت) • يتوفر التصفح والاستماع من الذاكرة المحلية</span>
          </div>
          <button 
            onClick={() => openModal('offlineManager')}
            className="px-2.5 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg hover:bg-amber-400 transition-colors"
          >
            إدارة التنزيلات
          </button>
        </div>
      )}

      {/* Modern Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50 pointer-events-none overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Header (Desktop Only) with Glassmorphism */}
      {!isMobile && (
        <div className="h-14 md:h-16 flex-shrink-0 bg-theme-surface/80 backdrop-blur-md border-b border-theme-border px-3 md:px-6 flex justify-between items-center shadow-sm z-30">
           <div className="flex items-center gap-2 md:gap-3">
               <h1 className="text-lg md:text-xl font-bold font-amiri text-theme-text-primary tracking-tight">المصحف الشريف</h1>
               {/* Reciter selector pill */}
               <div className="relative group">
                 <select 
                   value={reciterId}
                   onChange={(e) => setReciterId(e.target.value)}
                   className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer hover:bg-emerald-500/20 transition-colors"
                 >
                   {RECITERS.map(r => (
                     <option key={r.id} value={r.id} className="bg-stone-900 text-white">
                       القارئ: {r.name} {r.isDefault ? '⭐' : ''}
                     </option>
                   ))}
                 </select>
               </div>
           </div>
           <div className="flex items-center gap-1 md:gap-2">
               <button 
                 onClick={() => openModal('offlineManager')}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold hover:bg-amber-500/20 transition-colors"
                 title="إدارة تحميلات الأوفلاين"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 <span>تحميلات أوفلاين</span>
               </button>
               <button onClick={() => toggleBookmark(loadedSurahs[0]?.number || 1)} className={`p-2 rounded-full hover:bg-theme-surface-hover active:scale-90 transition-all ${isBookmarked ? 'text-emerald-500' : 'text-stone-400'}`}>
                   {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5"/> : <BookmarkIcon className="w-5 h-5"/>}
               </button>
               <button onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')} className="p-2 rounded-full hover:bg-theme-surface-hover active:scale-90 transition-all text-stone-500" title={`المظهر: ${theme === 'dark' ? 'داكن' : theme === 'light' ? 'فاتح' : 'نظام'}`}>
                   {theme === 'dark' ? <MoonIcon className="w-5 h-5"/> : theme === 'light' ? <SunIcon className="w-5 h-5"/> : <div className="w-5 h-5 border-2 border-current rounded-full opacity-70"></div>}
               </button>
               <button onClick={() => openModal('gemini')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95 transition-all">
                   <SparklesIcon className="w-4 h-4" />
                   <span className="hidden md:inline">تفسير بالذكاء الاصطناعي</span>
               </button>
           </div>
        </div>
      )}

      {/* Book Container with Immersive Gradient Background */}
      <div 
        className="flex-1 relative flex items-center justify-center p-2 sm:p-4 md:p-8 xl:p-12 overflow-hidden touch-pan-x bg-gradient-to-b from-theme-bg-secondary via-theme-bg-primary/50 to-theme-bg-secondary"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onDragStart={(e) => e.preventDefault()}
      >
          {/* Subtle Islamic Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

          {/* Invisible Desktop Click Navigation Zones */}
          {!isMobile && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-[10%] xl:w-[15%] z-20 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group flex items-center justify-center" onClick={handleNextPage}>
                    <ArrowRightIcon className="w-8 h-8 text-emerald-500 opacity-0 group-hover:opacity-40 -rotate-180 transition-all" />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[10%] xl:w-[15%] z-20 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group flex items-center justify-center" onClick={handlePrevPage}>
                    <ArrowRightIcon className="w-8 h-8 text-emerald-500 opacity-0 group-hover:opacity-40 transition-all" />
                </div>
              </>
          )}

          {/* Book Wrapper with Realistic Depth */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`
                relative w-full h-full max-w-full md:max-w-6xl xl:max-w-7xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-lg md:rounded-2xl flex overflow-hidden
                border-2 sm:border-4 md:border-[10px] border-stone-800 dark:border-[#1a1816]
                bg-stone-800 dark:bg-[#1a1816] ring-1 ring-white/10
            `}
          >
              {isSwipingSurah && (
                  <div className="absolute inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center transition-all animate-in fade-in duration-200">
                      <div className="bg-theme-surface/95 border border-emerald-500/30 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">جاري تحميل السورة...</span>
                      </div>
                  </div>
              )}

              {loadedSurahs.length === 0 ? (
                  <div className="flex-1 bg-theme-surface flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-theme-text-muted animate-pulse">جاري تحميل الآيات...</p>
                      </div>
                  </div>
              ) : (
                  <>
                    {/* Right Page (Single Page on Mobile) */}
                    <div className={`relative h-full ${isMobile ? 'w-full' : 'w-1/2'} z-10 bg-theme-surface`}>
                        {rightPageData ? (
                            <QuranPage 
                                pageNumber={currentRightPage}
                                ayahs={rightPageData}
                                playingAyahKey={playingState ? `${playingState.surah}:${playingState.ayah}` : null}
                                activeAyahKey={activeAyah}
                                onAyahClick={handleAyahClick}
                                onAyahTafsir={handleAyahTafsir}
                                setHoveredAyah={() => {}} 
                                isLeftPage={false}
                                isSingleView={isMobile}
                                fontSize={fontSize}
                                fontType={fontType}
                            />
                        ) : (
                            <div className="h-full bg-theme-surface flex items-center justify-center">
                                <div className="text-theme-text-muted">نهاية المصحف</div>
                            </div>
                        )}
                    </div>

                    {/* Spine (Desktop Only) */}
                    {/* Left Page (Desktop Only) */}
                    {!isMobile && (
                        <div className="relative h-full w-1/2 z-10 bg-theme-surface">
                            {leftPageData ? (
                                <QuranPage 
                                    pageNumber={leftPageNum}
                                    ayahs={leftPageData}
                                    playingAyahKey={playingState ? `${playingState.surah}:${playingState.ayah}` : null}
                                    activeAyahKey={activeAyah}
                                    onAyahClick={handleAyahClick}
                                    onAyahTafsir={handleAyahTafsir}
                                    setHoveredAyah={() => {}} 
                                    isLeftPage={true}
                                    isSingleView={false}
                                    fontSize={fontSize}
                                    fontType={fontType}
                                />
                            ) : (
                                <div className="h-full bg-theme-surface rounded-l-2xl flex items-center justify-center">
                                    {/* Empty or Loading next */}
                                </div>
                            )}
                        </div>
                    )}
                  </>
              )}
          </motion.div>
      </div>

      {/* Mobile Bottom Navigation Rail */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-theme-surface/95 backdrop-blur-xl border-t border-theme-border flex items-center justify-around z-[60] px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => setDrawerOpen(true)}
                className="flex flex-col items-center gap-1 text-theme-text-secondary hover:text-theme-accent transition-colors"
            >
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                    <div className="w-full h-0.5 bg-current rounded-full" />
                    <div className="w-2/3 h-0.5 bg-current rounded-full" />
                    <div className="w-full h-0.5 bg-current rounded-full" />
                </div>
                <span className="text-[10px] font-bold">القائمة</span>
            </button>

            <button 
                onClick={togglePlay}
                className={`flex flex-col items-center gap-1 transition-colors ${isPlaying ? 'text-theme-accent' : 'text-theme-text-secondary'}`}
            >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                <span className="text-[10px] font-bold">تلاوة</span>
            </button>

            <button 
                onClick={() => openModal('gemini')}
                className="w-12 h-12 -mt-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-90 transition-all border-4 border-theme-bg-secondary"
            >
                <SparklesIcon className="w-6 h-6" />
            </button>

            <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex flex-col items-center gap-1 text-theme-text-secondary transition-colors"
            >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                <span className="text-[10px] font-bold">المظهر</span>
            </button>

            <button 
                onClick={() => openModal('help')}
                className="flex flex-col items-center gap-1 text-theme-text-secondary transition-colors"
            >
                <QuestionMarkIcon className="w-6 h-6" />
                <span className="text-[10px] font-bold">مساعدة</span>
            </button>
        </div>
      )}

      {/* Sticky Player (Desktop & Mobile when playing) */}
      {(isPlaying || currentAudioRef.current) && playingState && (
        !isPlayerMinimized ? (
          <div className="fixed bottom-16 md:bottom-6 left-1/2 transform -translate-x-1/2 bg-theme-surface/95 backdrop-blur-xl rounded-2xl md:rounded-full px-4 md:px-6 py-2.5 md:py-3 shadow-2xl border border-theme-border flex flex-col md:flex-row items-center gap-2 md:gap-5 z-50 max-w-[95vw] md:max-w-3xl w-full md:w-auto animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center justify-between w-full md:w-auto gap-3">
                 {/* Minimize Bar Button (Audio continues playing) */}
                 <button 
                    onClick={() => setIsPlayerMinimized(true)}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-all active:scale-90"
                    title="تصغير شريط المشغل (استمرار الاستماع)"
                 >
                    <XMarkIcon className="w-5 h-5" />
                 </button>

                 {/* Full Stop Button */}
                 <button 
                    onClick={stopAudio}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 rounded-full transition-all active:scale-90"
                    title="إيقاف التلاوة نهائياً"
                 >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                 </button>

                 <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 hidden md:block"></div>

                 {/* Previous Track */}
                 <button 
                    onClick={() => {
                        if (playingState.ayah > 1) {
                            playAyah(playingState.surah, playingState.ayah - 1);
                        } else if (playingState.surah > 1) {
                             playAyah(playingState.surah - 1, 1);
                        }
                    }} 
                    className="hover:text-emerald-500 rotate-180 transition-colors"
                    title="الآية السابقة"
                 >
                     <ArrowRightIcon className="w-5 h-5" />
                 </button>
                 
                 <button onClick={togglePlay} className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all">
                     {isPlaying ? <PauseIcon className="w-5 h-5 md:w-6 md:h-6"/> : <PlayIcon className="w-5 h-5 md:w-6 md:h-6 ml-0.5"/>}
                 </button>

                 {/* Next Track */}
                 <button 
                     onClick={() => {
                          const surahInfo = surahsRef.current.find(s => s.number === playingState.surah);
                          if (surahInfo && playingState.ayah < surahInfo.numberOfAyahs) {
                              playAyah(playingState.surah, playingState.ayah + 1);
                          } else {
                              playAyah(playingState.surah + 1, 1);
                          }
                     }}
                     className="hover:text-emerald-500 transition-colors"
                     title="الآية التالية"
                  >
                      <ArrowRightIcon className="w-5 h-5" />
                 </button>

                 {/* Speed Toggle */}
                 <button 
                   onClick={handleSpeedToggle}
                   className="px-2 py-1 text-xs font-bold bg-theme-bg-primary border border-theme-border rounded-lg text-theme-accent hover:border-emerald-500 transition-colors"
                   title="سرعة التشغيل"
                 >
                   {playbackRate}x
                 </button>
               </div>

               {/* Track Info & Time Slider */}
               <div className="flex-1 flex flex-col md:flex-row items-center gap-2 w-full">
                 <div className="text-xs text-center md:text-right cursor-default select-none flex-shrink-0">
                     <div className="font-bold text-theme-text-primary flex items-center gap-1.5 justify-center md:justify-start">
                         <span>سورة {surahsRef.current.find(s => s.number === playingState.surah)?.name}</span>
                         <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans">
                           {activeReciter.name}
                         </span>
                     </div>
                 </div>

                 {/* Seek Bar */}
                 {audioDuration > 0 && (
                   <div className="flex items-center gap-2 w-full font-mono text-[10px] text-theme-text-muted dir-ltr">
                     <span>{formatAudioTime(audioCurrentTime)}</span>
                     <input 
                       type="range" 
                       min={0} 
                       max={audioDuration || 100} 
                       value={audioCurrentTime} 
                       onChange={handleSeek}
                       className="flex-1 accent-emerald-500 h-1.5 bg-theme-border rounded-lg cursor-pointer"
                     />
                     <span>{formatAudioTime(audioDuration)}</span>
                   </div>
                 )}
               </div>

               {/* Download Surah for Offline */}
               <button 
                 onClick={() => {
                   const surahInfo = surahsRef.current.find(s => s.number === playingState.surah);
                   if (surahInfo) {
                     openOfflinePrompt(surahInfo.number, surahInfo.name);
                   }
                 }}
                 className={`p-2 rounded-full border transition-all text-xs font-bold flex items-center gap-1 ${isCurrentSurahOffline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'}`}
                 title={isCurrentSurahOffline ? 'هذه السورة محملة للأوفلاين' : 'تحميل السورة للاستماع أوفلاين'}
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 <span className="hidden lg:inline">{isCurrentSurahOffline ? 'محملة' : 'تحميل أوفلاين'}</span>
               </button>
          </div>
        ) : (
          /* Minimized Floating Audio Pill */
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-theme-surface/95 backdrop-blur-xl border border-emerald-500/40 rounded-full shadow-2xl px-3 py-2 flex items-center gap-3 animate-in zoom-in-95 duration-200">
             <div 
               onClick={() => setIsPlayerMinimized(false)}
               className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
               title="انقر لتوسيع شريط المشغل"
             >
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                   {isPlaying ? (
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                     </span>
                   ) : (
                     <PlayIcon className="w-4 h-4" />
                   )}
                </div>
                <div className="text-xs font-bold text-theme-text-primary pr-1">
                   <span>سورة {surahsRef.current.find(s => s.number === playingState.surah)?.name}</span>
                   <span className="text-[10px] text-theme-text-secondary block font-mono">الآية {playingState.ayah}</span>
                </div>
             </div>

             <div className="w-px h-5 bg-stone-300 dark:bg-stone-700"></div>

             {/* Play/Pause Button */}
             <button 
               onClick={togglePlay} 
               className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-emerald-600 dark:text-emerald-400 rounded-full transition-all"
               title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
             >
               {isPlaying ? <PauseIcon className="w-4 h-4"/> : <PlayIcon className="w-4 h-4"/>}
             </button>

             {/* Expand Button */}
             <button 
               onClick={() => setIsPlayerMinimized(false)}
               className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-emerald-600 rounded-full transition-all"
               title="توسيع المشغل"
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
               </svg>
             </button>

             {/* Stop Button */}
             <button 
               onClick={stopAudio}
               className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 rounded-full transition-all"
               title="إيقاف التلاوة نهائياً"
             >
               <XMarkIcon className="w-4 h-4" />
             </button>
          </div>
        )
      )}

      {/* Modern Popover with Glassmorphism */}
      <AnimatePresence>
        {selectedAyahForMenu && ayahMenuPosition && (
            <AyahPopover 
                ayah={selectedAyahForMenu}
                position={ayahMenuPosition}
                isBookmarked={bookmarks.some(b => b.surahNumber === selectedAyahForMenu.surahNumber)}
                onClose={() => {
                    setSelectedAyahForMenu(null);
                    setActiveAyah(null);
                }}
                onPlay={() => playAyah(selectedAyahForMenu.surahNumber, selectedAyahForMenu.numberInSurah)}
                onBookmark={() => toggleBookmark(selectedAyahForMenu.surahNumber)}
                onTafsir={() => {
                    const event = {
                        stopPropagation: () => {},
                        currentTarget: { getBoundingClientRect: () => ({ left: ayahMenuPosition.x, top: ayahMenuPosition.y, width: 0, height: 0 }) }
                    } as any;
                    handleAyahTafsir(event, selectedAyahForMenu.surahName, selectedAyahForMenu);
                }}
            />
        )}

        {popoverContent && popoverPosition && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed inset-x-4 bottom-8 md:inset-auto md:right-8 md:bottom-8 md:w-96 z-[100]"
            style={{ 
                left: isMobile ? '1rem' : Math.min(popoverPosition.x - 150, window.innerWidth - 340), 
                top: isMobile ? 'auto' : Math.max(20, popoverPosition.y - 300),
                right: isMobile ? '1rem' : 'auto',
                position: 'fixed'
            }}
          >
            <div 
              className="bg-theme-surface/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-theme-border flex items-center justify-between bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-theme-text-primary">تفسير الآية</h4>
                        </div>
                    </div>
                    <button onClick={() => setPopoverContent(null)} className="p-1.5 hover:bg-theme-surface-hover rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-theme-text-muted" />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-theme-border">
                    <div className="text-right leading-relaxed text-theme-text-secondary font-sans text-sm md:text-base">
                        {popoverContent}
                    </div>
                </div>
                <div className="p-4 bg-theme-bg-primary/50 border-t border-theme-border flex justify-end">
                    <button className="text-[10px] md:text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest flex items-center gap-1">
                        <span>مشاركة الفائدة</span>
                        <ArrowRightIcon className="w-3 h-3 rotate-180" />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MushafView;
