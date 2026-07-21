import React from 'react';
import { SwatchIcon, MinusIcon, PlusIcon, QuestionMarkIcon, MailIcon, ShieldCheckIcon, InfoIcon } from '../Icons';

interface SidebarMenuDropdownProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  fontType: string;
  setFontType: (type: string) => void;
  openModal: (modal: string) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const SidebarMenuDropdown: React.FC<SidebarMenuDropdownProps> = ({
  fontSize,
  setFontSize,
  fontType,
  setFontType,
  openModal,
  setIsMenuOpen,
}) => {
  return (
    <div className="absolute left-0 top-full mt-2 w-64 bg-theme-surface rounded-xl shadow-2xl border border-theme-border overflow-hidden z-50 origin-top-left animate-in fade-in zoom-in-95 duration-100">
      <div className="p-4 border-b border-theme-border">
        <h3 className="text-xs font-bold text-theme-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <SwatchIcon className="w-4 h-4" />
          إعدادات القراءة
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-theme-text-secondary">حجم الخط</span>
          <div className="flex items-center gap-2 bg-theme-bg-primary rounded-lg p-1 border border-theme-border">
            <button onClick={() => setFontSize(Math.max(20, fontSize - 2))} className="p-1.5 hover:bg-theme-surface-hover rounded text-theme-text-muted hover:text-theme-text-primary transition-colors"><MinusIcon className="w-4 h-4" /></button>
            <span className="w-8 text-center text-sm font-bold text-theme-accent">{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(44, fontSize + 2))} className="p-1.5 hover:bg-theme-surface-hover rounded text-theme-text-muted hover:text-theme-text-primary transition-colors"><PlusIcon className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-theme-text-secondary block">نوع الخط</span>
          <div className="grid grid-cols-1 gap-2">
            {[{ id: 'Amiri', label: 'الخط الأميري' }, { id: 'Scheherazade New', label: 'حفص (تقليدي)' }, { id: 'Lateef', label: 'خط لطيف' }].map((font) => (
              <button
                key={font.id}
                onClick={() => setFontType(font.id)}
                className={`px-3 py-2 rounded-lg text-right text-sm transition-all border ${fontType === font.id ? 'bg-emerald-100 dark:bg-emerald-900/30 border-theme-accent text-theme-accent' : 'bg-theme-bg-primary border-theme-border text-theme-text-secondary hover:border-theme-text-muted'}`}
                style={{ fontFamily: font.id }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <button onClick={() => { openModal('help'); setIsMenuOpen(false); }} className="w-full text-right px-4 py-3 hover:bg-theme-surface-hover flex items-center gap-3 text-sm text-theme-text-secondary transition-colors border-b border-theme-border"><QuestionMarkIcon className="w-4 h-4 text-theme-accent" /><span>طريقة الاستخدام</span></button>
      <a href="mailto:medissa711@gmail.com?subject=التبليغ عن خطأ في التطبيق" className="w-full text-right px-4 py-3 hover:bg-theme-surface-hover flex items-center gap-3 text-sm text-theme-text-secondary transition-colors border-b border-theme-border" onClick={() => setIsMenuOpen(false)}><MailIcon className="w-4 h-4 text-theme-accent" /><span>التبليغ عن خطأ</span></a>
      <button onClick={() => { openModal('aiTerms'); setIsMenuOpen(false); }} className="w-full text-right px-4 py-3 hover:bg-theme-surface-hover flex items-center gap-3 text-sm text-theme-text-secondary transition-colors border-b border-theme-border"><ShieldCheckIcon className="w-4 h-4 text-amber-500" /><span>شروط الذكاء الاصطناعي</span></button>
      <button onClick={() => { openModal('about'); setIsMenuOpen(false); }} className="w-full text-right px-4 py-3 hover:bg-theme-surface-hover flex items-center gap-3 text-sm text-theme-text-secondary transition-colors"><InfoIcon className="w-4 h-4 text-theme-text-muted" /><span>عن التطبيق</span></button>
    </div>
  );
};

export default SidebarMenuDropdown;
