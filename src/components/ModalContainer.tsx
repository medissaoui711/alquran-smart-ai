import React from 'react';
import GeminiPanel from './GeminiPanel';
import HelpModal from './HelpModal';
import AboutModal from './AboutModal';
import AiTermsModal from './AiTermsModal';
import { useQuranStore, useUIStore } from '../store';

/**
 * Centralized container for all application modals and side panels.
 * Listens to the UI store to determine which modal to render.
 */
export const ModalContainer: React.FC = () => {
  const { loadedSurahs } = useQuranStore();
  const { activeModal, closeModal } = useUIStore();

  if (activeModal === 'none' || activeModal === 'gemini') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <HelpModal 
        isOpen={activeModal === 'help'}
        onClose={closeModal}
      />

      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={closeModal}
      />

      <AiTermsModal
        isOpen={activeModal === 'aiTerms'}
        onClose={closeModal}
      />
    </div>
  );
};
