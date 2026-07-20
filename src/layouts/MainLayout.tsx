import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/Sidebar';
import { useQuranStore, useUIStore } from '../store';
import { Bars3Icon, XMarkIcon } from '../components/Icons';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Primary layout component that defines the application structure.
 * Orchestrates Desktop (Rail/Sidebar) and Mobile (TopBar/Drawer) experiences.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { selectedSurah, clearReader } = useQuranStore();
  const { isMobile, isDrawerOpen, setDrawerOpen } = useUIStore();

  return (
    <div className="flex h-[100dvh] bg-theme-bg-primary text-theme-text-primary font-sans overflow-hidden transition-colors duration-300" dir="rtl">
      
      {/* Desktop Sidebar (Permanent) */}
      {!isMobile && (
        <aside className="h-full flex-shrink-0 z-40 bg-theme-surface shadow-2xl relative">
          <Sidebar />
        </aside>
      )}

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobile && isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] pt-safe-top"
            />
            {/* Drawer Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-theme-surface z-[70] shadow-2xl pt-safe-top pb-safe-bottom"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-theme-border flex items-center justify-between">
                  <h2 className="text-xl font-bold font-serif">القائمة</h2>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-theme-surface-hover rounded-full">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                   <Sidebar />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-theme-bg-secondary pt-safe-top pb-safe-bottom">
        
        {/* Mobile Top Bar */}
        {isMobile && (
          <header className="h-16 flex items-center justify-between px-4 bg-theme-surface border-b border-theme-border flex-shrink-0 z-30">
            <div className="w-10" />
            <h1 className="text-lg font-bold font-serif text-theme-accent">القرآن الكريم</h1>
            {selectedSurah ? (
               <button 
                onClick={clearReader}
                className="text-sm font-bold text-theme-text-muted hover:text-theme-text-primary px-3 py-1"
               >
                 رجوع
               </button>
            ) : <div className="w-10" />}
          </header>
        )}

        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
