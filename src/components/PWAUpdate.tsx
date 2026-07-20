import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface PWAUpdateProps {
  show: boolean;
  onUpdate: () => void;
}

export const PWAUpdate: React.FC<PWAUpdateProps> = ({ show, onUpdate }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">تحديث جديد متوفر!</h3>
                <p className="text-xs text-emerald-50">نسخة أسرع وأحدث جاهزة للاستخدام</p>
              </div>
            </div>
            <button
              onClick={onUpdate}
              className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowPathIcon className="w-4 h-4" />
              تحديث الآن
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add ArrowPathIcon to Icons.tsx if not exists
