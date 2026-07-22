import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinished?: () => void;
  minDuration?: number; // Minimum display time in ms (e.g. 1500ms)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinished,
  minDuration = 1800 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinished) {
        setTimeout(onFinished, 600); // Allow exit animation to complete
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinished]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-950 text-stone-100 select-none overflow-hidden"
        >
          {/* Ambient Glowing Background Stars & Light Orbs */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-950/60 via-stone-950 to-stone-950 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1.2 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {/* Main Elegant SVG Islamic Geometric Star & Book Emblem */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-32 h-32 md:w-40 md:h-40 mb-6 flex items-center justify-center"
            >
              {/* Pulsing Backlight Ring */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-600/30 to-amber-400/30 blur-xl"
              />

              {/* Vector SVG Emblem */}
              <svg 
                className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Rotating Octagram (Rub el Hizb style) */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="origin-center"
                >
                  <rect x="35" y="35" width="130" height="130" rx="12" stroke="url(#goldGradient)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
                  <rect x="35" y="35" width="130" height="130" rx="12" transform="rotate(45 100 100)" stroke="url(#goldGradient)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
                </motion.g>

                {/* Inner Solid Geometric Star */}
                <motion.g 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <path 
                    d="M100 20 L118 48 L150 50 L135 78 L150 106 L118 108 L100 136 L82 108 L50 106 L65 78 L50 50 L82 48 Z" 
                    fill="url(#emeraldGradient)" 
                    stroke="url(#goldGradient)" 
                    strokeWidth="2" 
                    className="opacity-20"
                  />
                  <polygon points="100,25 120,55 155,55 130,85 140,120 100,100 60,120 70,85 45,55 80,55" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" opacity="0.8" />
                </motion.g>

                {/* Quran Book Icon Centerpiece */}
                <g transform="translate(58, 62) scale(0.84)">
                  {/* Left Page */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    d="M10 20 C25 12, 45 12, 50 22 L50 72 C45 62, 25 62, 10 70 Z" 
                    fill="url(#pageGradient)" 
                    stroke="#fef08a" 
                    strokeWidth="1.5"
                  />
                  {/* Right Page */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    d="M90 20 C75 12, 55 12, 50 22 L50 72 C55 62, 75 62, 90 70 Z" 
                    fill="url(#pageGradient)" 
                    stroke="#fef08a" 
                    strokeWidth="1.5"
                  />
                  {/* Quran Text Lines (Decorative Vector Stems) */}
                  <line x1="20" y1="32" x2="40" y2="30" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1="18" y1="42" x2="42" y2="40" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1="22" y1="52" x2="38" y2="50" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

                  <line x1="60" y1="30" x2="80" y2="32" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1="58" y1="40" x2="82" y2="42" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1="62" y1="50" x2="78" y2="52" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

                  {/* Golden Bookmark Ribbon */}
                  <path d="M50 22 L50 82 L44 76 L38 82 L38 24" fill="#fbbf24" opacity="0.9" />
                </g>

                {/* SVG Gradients */}
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                  <linearGradient id="pageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#064e3b" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Typography */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-300 to-amber-100 tracking-wide mb-2"
            >
              المصحف الشريف
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-xs md:text-sm font-sans text-emerald-200/80 tracking-widest uppercase mb-8"
            >
              تلاوة • تدبر • هداية
            </motion.p>

            {/* Fast Elegant SVG Loader Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 140 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="relative h-1 bg-stone-800/80 rounded-full overflow-hidden shadow-inner"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-300 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(252,211,77,0.8)]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
