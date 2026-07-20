import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Surah, SurahDetail, Bookmark } from './types';
import { fetchSurahDetails, fetchSurahList } from './services/quranService';

// --- Settings Store ---
export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  fontSize: number;
  fontType: string;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setFontType: (type: string) => void;
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
      setTheme: (theme) => set(() => {
        applyTheme(theme);
        return { theme };
      }),
      setFontSize: (size) => set({ fontSize: size }),
      setFontType: (type) => set({ fontType: type }),
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
  activeModal: 'none' | 'help' | 'about' | 'aiTerms' | 'gemini';
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  openModal: (modal: 'help' | 'about' | 'aiTerms' | 'gemini') => void;
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
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  openModal: (modal) => set({ activeModal: modal, isDrawerOpen: false }),
  closeModal: () => set({ activeModal: 'none' }),
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
        const { loadedSurahs, isLoading } = get();
        if (loadedSurahs.length === 0 || isLoading) return;

        const lastSurah = loadedSurahs[loadedSurahs.length - 1];
        if (lastSurah.number >= 114) return;

        const nextSurahNumber = lastSurah.number + 1;
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
          console.error("Failed to load next surah");
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