import React from 'react';
import { XMarkIcon, SparklesIcon, BookIcon, InfoIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="relative bg-theme-surface w-full max-w-lg rounded-2xl shadow-2xl border border-theme-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-50 to-white dark:from-stone-800 dark:to-stone-900 px-6 py-4 border-b border-theme-border flex justify-between items-center">
            <h2 className="text-xl font-bold font-serif text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                <InfoIcon className="w-5 h-5" />
                عن التطبيق
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-theme-surface-hover rounded-full transition-colors text-stone-500">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
            {/* Logo / Icon Area */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 rotate-3">
                <BookIcon className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold font-amiri text-theme-text-primary mb-2">المصحف الاحترافي</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 font-bold tracking-widest uppercase">الإصدار 1.0.0</p>

            <div className="text-theme-text-primary space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                    تطبيق ويب حديث يهدف لتيسير تلاوة وتدبر القرآن الكريم بتجربة مستخدم عصرية تحاكي المصحف الورقي، مع الحفاظ على الهوية البصرية الإسلامية الأصيلة.
                </p>
                
                <div className="py-4 border-y border-theme-border my-6 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-theme-bg-secondary">
                        <SparklesIcon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <span className="block font-bold text-theme-text-primary text-xs">ذكاء اصطناعي</span>
                        <span className="text-[10px] text-stone-500">Gemini Pro</span>
                    </div>
                    <div className="p-3 rounded-lg bg-theme-bg-secondary">
                        <BookIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <span className="block font-bold text-theme-text-primary text-xs">تصميم أصيل</span>
                        <span className="text-[10px] text-stone-500">UI/UX حديث</span>
                    </div>
                </div>

                <p className="text-xs text-stone-400">
                    تم تطوير هذا المشروع باستخدام أحدث تقنيات الويب (React 19, TailwindCSS) لضمان الأداء العالي والتوافق مع جميع الأجهزة.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-surface border-t border-theme-border text-center">
            <p className="text-xs text-theme-text-muted mb-3">
                صدقة جارية • نسألكم الدعاء
            </p>
            <button 
                onClick={onClose}
                className="w-full py-2.5 bg-theme-surface border border-theme-border hover:bg-stone-50 dark:hover:bg-stone-700 text-theme-text-primary font-bold rounded-lg transition-colors text-sm"
            >
                إغلاق
            </button>
        </div>
      </div>
  );
};

export default AboutModal;