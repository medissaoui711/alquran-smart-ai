import { useEffect } from 'react';
import MushafView from './components/MushafView';
import { ModalContainer } from './components/ModalContainer';
import { MainLayout } from './layouts/MainLayout';
import { useQuranStore } from './store';
import { useTheme } from './hooks/useTheme';
import { useResponsive } from './hooks/useResponsive';

/**
 * Root Application Component.
 * Orchestrates global logic and high-level composition.
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
        <div className="flex-1 flex items-center justify-center p-8 text-center flex-col">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <MushafView />
      )}

      {/* Global Overlays */}
      <ModalContainer />
    </MainLayout>
  );
}

export default App;
