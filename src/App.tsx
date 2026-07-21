import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import MushafView from './components/MushafView';
import GeminiPanel from './components/GeminiPanel';
import HelpModal from './components/HelpModal';
import AboutModal from './components/AboutModal';
import AiTermsModal from './components/AiTermsModal';
import { useQuranStore, useSettingsStore, useUIStore } from './store';
import { BookmarkIcon } from './components/Icons';
import { ModalContainer } from './components/ModalContainer';
import { usePWA } from './hooks/usePWA';
import { PWAUpdate } from './components/PWAUpdate';
import { MainLayout } from './layouts/MainLayout';
import { ErrorMessage } from './components/ErrorMessage';
import { useTheme } from './hooks/useTheme';
import { useResponsive } from './hooks/useResponsive';

/**
 * المكون الرئيسي للتطبيق.
 * ينظم المنطق العام والتركيب عالي المستوى.
 */
function App() {
  const { fetchSurahList, error } = useQuranStore();

  // Initialize Logical Hooks
  useTheme();
  useResponsive();

  // Initialize Global Data
  useEffect(() => {
    fetchSurahList().then(() => {
      // After fetching list, resume last read or start with Al-Fatihah
      useQuranStore.getState().resumeLastRead();
    });
  }, [fetchSurahList]);

  return (
    <MainLayout>
      {error ? (
        <ErrorMessage error={error} />
      ) : (
        <MushafView />
      )}
      
      {/* Global Overlays */}
      <GeminiPanel />
      <HelpModal />
      <AboutModal />
      <AiTermsModal />
      <ModalContainer />
      <PWAUpdate />
    </MainLayout>
  );
}

export default App;
