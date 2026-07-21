import { useEffect } from 'react';
import MushafView from './components/MushafView';
import { ModalContainer } from './components/ModalContainer';
import { MainLayout } from './layouts/MainLayout';
import { ErrorMessage } from './components/ErrorMessage';
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
        <ErrorMessage error={error} />
      ) : (
        <MushafView />
      )}

      {/* Global Overlays */}
      <ModalContainer />
    </MainLayout>
  );
}

export default App;
