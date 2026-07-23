import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Surah, SurahDetail, Bookmark } from './types';
import { fetchSurahDetails, fetchSurahList } from './services/quranService';

import { DEFAULT_RECITER_ID } from './data/reciters';

// --- Settings Store ---
export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  fontSize: number;
  fontType: string;
  reciterId: string;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setFontType: (type: string) => void;
  setReciterId: (reciterId: string) => void;
}

const applyTheme = (theme: ThemeMode) => {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 26,
      fontType: 'Amiri',
      reciterId: DEFAULT_RECITER_ID,
      setTheme: (theme) => set(() => {
        applyTheme(theme);
        return { theme };
      }),
      setFontSize: (size) => set({ fontSize: size }),
      setFontType: (type) => set({ fontType: type }),
      setReciterId: (id) => set({ reciterId: id }),
    }),
    {
      name: 'quran_settings',
      onRehydrateStorage: () => (state) => {
          if (state?.theme) applyTheme(state.theme);
      }
    }
  )
);

// --- UI Store ---
interface UIState {
  isSidebarCollapsed: boolean;
  isDrawerOpen: boolean;
  activeModal: 'none' | 'help' | 'about' | 'aiTerms' | 'gemini' | 'offlineManager' | 'offlinePrompt';
  pendingOfflineSurah: { surahNumber: number; surahName: string } | null;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  openModal: (modal: 'help' | 'about' | 'aiTerms' | 'gemini' | 'offlineManager' | 'offlinePrompt') => void;
  openOfflinePrompt: (surahNumber: number, surahName: string) => void;
  closeModal: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  setIsMobile: (isMobile: boolean) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isDrawerOpen: false,
  activeModal: 'none',
  pendingOfflineSurah: null,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  openModal: (modal) => set({ activeModal: modal, isDrawerOpen: false }),
  openOfflinePrompt: (surahNumber, surahName) => set({ 
    activeModal: 'offlinePrompt', 
    pendingOfflineSurah: { surahNumber, surahName }, 
    isDrawerOpen: false 
  }),
  closeModal: () => set({ activeModal: 'none', pendingOfflineSurah: null }),
  isMobile: window.innerWidth < 640,
  isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
  isDesktop: window.innerWidth >= 1024,
  setIsMobile: (isMobile) => {
    const width = window.innerWidth;
    set({ 
      isMobile: width < 640, 
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024
    });
  },
  showSplash: true,
  setShowSplash: (show) => set({ showSplash: show }),
}));

// --- Quran Data Store ---
interface QuranState {
  surahs: Surah[];
  loadedSurahs: SurahDetail[];
  selectedSurah: Surah | null;
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  initialPageToLoad: number | null;
  activeAyah: string | null; // format: "surahNumber:ayahNumber"
  
  // Actions
  fetchSurahList: () => Promise<void>;
  loadSingleSurah: (surah: Surah, startPage?: number | null) => Promise<void>;
  loadNextSurah: () => Promise<void>;
  loadPrevSurah: () => Promise<void>;
  toggleBookmark: (surahNumber: number) => void;
  setActiveAyah: (ayahKey: string | null) => void;
  resumeLastRead: () => void;
  clearReader: () => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      surahs: [],
      loadedSurahs: [],
      selectedSurah: null,
      bookmarks: [],
      isLoading: false,
      error: null,
      initialPageToLoad: null,
      activeAyah: null,

      fetchSurahList: async () => {
        try {
          const data = await fetchSurahList();
          set({ surahs: data, error: null });
        } catch (err) {
          set({ error: "تعذر تحميل قائمة السور. يرجى التحقق من الاتصال." });
        }
      },

      loadSingleSurah: async (surah, startPage = null) => {
        set({ isLoading: true, selectedSurah: surah, error: null, loadedSurahs: [], initialPageToLoad: startPage });
        localStorage.setItem('quran_last_read', surah.number.toString());

        try {
          const detail = await fetchSurahDetails(surah.number);
          if (detail) {
            set({ loadedSurahs: [detail] });
          }
        } catch (error) {
          set({ error: "حدث خطأ أثناء تحميل السورة." });
        } finally {
          set({ isLoading: false });
        }
      },

      loadNextSurah: async () => {
        const { loadedSurahs, selectedSurah } = get();
        let lastSurahNumber;
        if (loadedSurahs.length > 0) {
            lastSurahNumber = loadedSurahs[loadedSurahs.length - 1].number;
        } else if (selectedSurah) {
            lastSurahNumber = selectedSurah.number;
        } else {
            return;
        }

        if (lastSurahNumber >= 114) return;

        const nextSurahNumber = lastSurahNumber + 1;
        if (loadedSurahs.some(s => s.number === nextSurahNumber)) return;

        try {
          const detail = await fetchSurahDetails(nextSurahNumber);
          if (detail) {
            set((state) => {
              if (state.loadedSurahs.some(s => s.number === detail.number)) {
                return state;
              }
              return { loadedSurahs: [...state.loadedSurahs, detail] };
            });
          }
        } catch (error) {
          console.error("Failed to load next surah", error);
        }
      },

      loadPrevSurah: async () => {
        const { loadedSurahs, selectedSurah } = get();
        let firstSurahNumber;
        if (loadedSurahs.length > 0) {
            firstSurahNumber = loadedSurahs[0].number;
        } else if (selectedSurah) {
            firstSurahNumber = selectedSurah.number;
        } else {
            return;
        }

        if (firstSurahNumber <= 1) return;

        const prevSurahNumber = firstSurahNumber - 1;
        if (loadedSurahs.some(s => s.number === prevSurahNumber)) return;

        try {
          const detail = await fetchSurahDetails(prevSurahNumber);
          if (detail) {
            set((state) => {
              if (state.loadedSurahs.some(s => s.number === detail.number)) {
                return state;
              }
              return { loadedSurahs: [detail, ...state.loadedSurahs] };
            });
          }
        } catch (error) {
          console.error("Failed to load previous surah", error);
        }
      },

      toggleBookmark: (surahNumber) => {
        set((state) => {
          const exists = state.bookmarks.some(b => b.surahNumber === surahNumber);
          let newBookmarks;
          if (exists) {
            newBookmarks = state.bookmarks.filter(b => b.surahNumber !== surahNumber);
          } else {
            newBookmarks = [...state.bookmarks, { surahNumber, addedAt: Date.now() }];
          }
          return { bookmarks: newBookmarks };
        });
      },

      setActiveAyah: (ayahKey) => set({ activeAyah: ayahKey }),

      resumeLastRead: () => {
        const { surahs } = get();
        if (surahs.length === 0) return;

        const lastReadId = localStorage.getItem('quran_last_read');
        const lastReadPage = localStorage.getItem('quran_last_page');
        
        let targetSurah: Surah | undefined;
        if (lastReadId) {
          targetSurah = surahs.find(s => s.number === parseInt(lastReadId));
        }
        if (!targetSurah) {
          targetSurah = surahs.find(s => s.number === 1);
        }

        if (targetSurah) {
          get().loadSingleSurah(targetSurah, lastReadPage ? parseInt(lastReadPage) : null);
        }
      },

      clearReader: () => {
        set({ selectedSurah: null, loadedSurahs: [] });
      }
    }),
    {
      name: 'quran_data_store',
      partialize: (state) => ({ bookmarks: state.bookmarks }),
    }
  )
);
// --- PWA Store ---
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  installPrompt: BeforeInstallPromptEvent | null;
  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  isInstallable: boolean;
}

export const usePWAStore = create<PWAState>((set) => ({
  installPrompt: null,
  setInstallPrompt: (prompt) => set({ installPrompt: prompt, isInstallable: !!prompt }),
  isInstallable: false,
}));
