import React from 'react';
import { XMarkIcon, BookIcon, SparklesIcon, PlayIcon, SwatchIcon, ArrowRightIcon } from './Icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <BookIcon className="w-6 h-6 text-emerald-500" />,
      title: "وضع القراءة التفاعلي",
      desc: "استمتع بتجربة قراءة تحاكي المصحف الورقي. على الكمبيوتر تظهر صفحتان متقابلتان، وعلى الهاتف صفحة واحدة. يمكنك التنقل عبر الأسهم أو سحب الشاشة (Swipe) يميناً ويساراً."
    },
    {
      icon: <PlayIcon className="w-6 h-6 text-emerald-500" />,
      title: "المشغل الصوتي الذكي",
      desc: "اضغط على أي آية لبدء التلاوة. يدعم المشغل الانتقال التلقائي السلس بين الآيات والصفحات، مع شريط تحكم عائم يظهر في الأسفل."
    },
    {
      icon: <SparklesIcon className="w-6 h-6 text-indigo-500" />,
      title: "المرافق الذكي (Gemini)",
      desc: "اضغط على زر 'تفسير' في الأعلى أو رقم الآية للحصول على شرح فوري، ملخصات للسور، وتدبرات روحانية مدعومة بالذكاء الاصطناعي."
    },
    {
      icon: <SwatchIcon className="w-6 h-6 text-amber-500" />,
      title: "تخصيص كامل",
      desc: "تحكم في حجم الخط ونوعه (الأميري، حفص، لطيف) من قائمة الإعدادات، وبدل بين الوضع الليلي والنهاري لراحة عينيك."
    }
  ];

  return (
    <div className="relative bg-theme-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-theme-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-50 to-white dark:from-stone-800 dark:to-stone-900 px-6 py-4 border-b border-theme-border flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold font-serif text-emerald-800 dark:text-emerald-300">دليل الاستخدام</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">تعرف على مميزات المصحف الاحترافي</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-theme-surface-hover rounded-full transition-colors text-stone-500">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-theme-bg-secondary border border-theme-border hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center shadow-sm">
                            {feature.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-theme-text-primary mb-1 font-serif">{feature.title}</h3>
                            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gesture Tip */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                    <ArrowRightIcon className="w-5 h-5" />
                </div>
                <div className="text-sm text-stone-700 dark:text-stone-300">
                    <span className="font-bold block text-indigo-700 dark:text-indigo-400 mb-1">تلميح للتنقل السريع:</span>
                    استخدم إيماءات السحب (Swipe) على الهواتف أو مفاتيح الأسهم (اليمين واليسار) في لوحة المفاتيح للتنقل بين الصفحات.
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-surface border-t border-theme-border text-center">
            <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-105"
            >
                ابدأ القراءة
            </button>
        </div>
      </div>
  );
};

export default HelpModal;