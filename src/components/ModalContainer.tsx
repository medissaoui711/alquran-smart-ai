import React from 'react';
import HelpModal from './HelpModal';
import AboutModal from './AboutModal';
import AiTermsModal from './AiTermsModal';
import { OfflineInvitationModal } from './OfflineInvitationModal';
import { OfflineManagerModal } from './OfflineManagerModal';
import { useUIStore } from '../store';

/**
 * Centralized container for all application modals and side panels.
 * Listens to the UI store to determine which modal to render.
 */
export const ModalContainer: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();

  const isStandardModalOpen = activeModal === 'help' || activeModal === 'about' || activeModal === 'aiTerms';

  return (
    <>
      {isStandardModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl flex justify-center">
            {activeModal === 'help' && (
              <HelpModal 
                isOpen={true}
                onClose={closeModal}
              />
            )}

            {activeModal === 'about' && (
              <AboutModal
                isOpen={true}
                onClose={closeModal}
              />
            )}

            {activeModal === 'aiTerms' && (
              <AiTermsModal
                isOpen={true}
                onClose={closeModal}
              />
            )}
          </div>
        </div>
      )}

      <OfflineInvitationModal />
      <OfflineManagerModal />
    </>
  );
};


