import { useEffect } from 'react';
import { useUIStore } from '../store';

/**
 * Hook to handle responsive viewport detection.
 * Synchronizes the global UI store with the window width.
 */
export const useResponsive = () => {
  const { setIsMobile } = useUIStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);
};
