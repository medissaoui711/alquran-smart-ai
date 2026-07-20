import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import MushafView from './components/MushafView';
import GeminiPanel from './components/GeminiPanel';
import HelpModal from './components/HelpModal';
import AboutModal from './components/AboutModal';
import AiTermsModal from './components/AiTermsModal';
import { useQuranStore, useSettingsStore, useUIStore } from './store';
import { XMarkIcon } from './components/Icons';
import ModalContainer from './components/ModalContainer';
import { usePWA } from './hooks/usePWA';
import { PWAUpdate } from './components/PWAUpdate';

function App() {
  // Access Stores
  const { fetchSurahList, loadedSurahs, error, selectedSurah } = useQuranStore();
  const { isDarkMode } = useSettingsStore();
  const { isMobile, setIsMobile, activeModal, closeModal, isSidebarCollapsed, isDrawerOpen, setDrawerOpen } = useUIStore();

  // PWA Updates
  const { showUpdate, updateApp } = usePWA();

  // Initialize Data
  useEffect(() => {
    fetchSurahList();
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Handle Dark Mode Class (Backup sync)
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="flex h-[100dvh] bg-theme-bg-primary font-sans overflow-hidden transition-colors duration-300 pt-safe pb-safe pl-safe pr-safe" dir="rtl">
      
      {/* Sidebar - Adaptive Desktop/Tablet */}
      {!isMobile && (
        <aside className={`
          ${isSidebarCollapsed ? 'w-20' : 'w-72 lg:w-80'} 
          h-full transition-all duration-300 ease-in-out border-l border-theme-border z-30 flex-shrink-0
        `}>
           <Sidebar />
        </aside>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-theme-surface z-[70] shadow-2xl border-l border-theme-border overflow-hidden"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`
        flex-1 flex flex-col h-full relative overflow-hidden bg-theme-bg-secondary
        ${isMobile && !selectedSurah ? 'hidden' : 'flex'}
      `}>
        {error ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center flex-col max-w-lg mx-auto">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                   <XMarkIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ ما</h2>
                <p className="text-theme-text-secondary mb-8">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                    إعادة تحميل التطبيق
                </button>
            </div>
        ) : (
            <MushafView />
        )}
      </main>

      {/* Shared Modals */}
      <ModalContainer />

      <GeminiPanel 
        isOpen={activeModal === 'gemini'} 
        onClose={closeModal} 
        surah={loadedSurahs.length > 0 ? loadedSurahs[0] : null} 
      />

      <PWAUpdate show={showUpdate} onUpdate={updateApp} />
    </div>
  );
}

export default App;