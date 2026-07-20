import React from 'react';
import { XMarkIcon, SparklesIcon, ShieldCheckIcon } from './Icons';

interface AiTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiTermsModal: React.FC<AiTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const terms = [
    {
      title: "أداة مساعدة للاستئناس",
      content: "خدمة التفسير والتدبر المقدمة في هذا التطبيق تعتمد على نماذج الذكاء الاصطناعي (Google Gemini). هي أداة تهدف للمساعدة في فهم المعاني العامة والاستئناس بها، ولا تعتبر بديلاً عن التفاسير المعتمدة أو الرجوع للعلماء الراسخين."
    },
    {
      title: "احتمالية الخطأ",
      content: "الذكاء الاصطناعي قد يخطئ في توليد النصوص أو فهم السياق القرآني الدقيق. رغم الجهود المبذولة لضبط التوجيهات (Prompts)، يجب دائماً التعامل بحذر مع المخرجات ومقارنتها بالمصادر الموثوقة."
    },
    {
      title: "المرجعية الشرعية",
      content: "هذا التطبيق لا يقدم فتاوى شرعية ولا أحكاماً فقهية ملزمة. في المسائل الحلال والحرام والقضايا الشائكة، يجب الرجوع حصراً لدار الإفتاء أو العلماء الثقات في بلدك."
    },
    {
      title: "الخصوصية والبيانات",
      content: "عند استخدام ميزة التفسير، يتم إرسال نص الآية والسورة إلى خوادم Google لمعالجتها. لا يتم تخزين أي بيانات شخصية أو سجلات بحث دائمة من قبلنا."
    }
  ];

  return (
    <div className="relative bg-theme-surface w-full max-w-xl rounded-2xl shadow-2xl border border-theme-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-50 to-white dark:from-stone-800 dark:to-stone-900 px-6 py-4 border-b border-theme-border flex justify-between items-center">
            <h2 className="text-xl font-bold font-serif text-amber-700 dark:text-amber-500 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6" />
                شروط استخدام الذكاء الاصطناعي
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-theme-surface-hover rounded-full transition-colors text-stone-500">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl mb-6 flex gap-3 items-start">
                <SparklesIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    هذه الميزة تجريبية وتستخدم تقنيات التوليد اللغوي الحديثة. يرجى قراءة البنود التالية بعناية قبل الاعتماد على المعلومات المقدمة.
                </p>
            </div>

            <div className="space-y-6">
                {terms.map((term, idx) => (
                    <div key={idx} className="relative pr-4 border-r-2 border-theme-border">
                        <h3 className="font-bold text-theme-text-primary mb-2 text-base">{term.title}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-loose text-justify">
                            {term.content}
                        </p>
                        {/* Decorative dot */}
                        <div className="absolute -right-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-surface border-t border-theme-border text-center">
            <button 
                onClick={onClose}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold rounded-lg transition-colors text-sm shadow-lg"
            >
                قرأت وفهمت الشروط
            </button>
        </div>
      </div>
  );
};

export default AiTermsModal;