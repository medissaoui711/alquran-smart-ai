import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookIcon, 
  SearchIcon, 
  DotsVerticalIcon, 
  XMarkIcon, 
  InfoIcon, 
  BookmarkSolidIcon, 
  PlusIcon, 
  MinusIcon, 
  SwatchIcon, 
  QuestionMarkIcon, 
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon
} from './Icons';
import { useQuranStore, useSettingsStore, useUIStore } from '../store';

const Sidebar: React.FC = () => {
  // Use Stores
  const { surahs, bookmarks, selectedSurah, loadSingleSurah, resumeLastRead } = useQuranStore();
  const { fontSize, setFontSize, fontType, setFontType } = useSettingsStore();
  const { isMobile, isSidebarCollapsed, setSidebarCollapsed, setDrawerOpen, openModal, setShowSplash } = useUIStore();

  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const juzStartSurah: Record<number, number> = {
    1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 11, 13: 12, 14: 15, 15: 17, 16: 18, 17: 21, 18: 23, 19: 25, 20: 27,
    21: 29, 22: 33, 23: 36, 24: 39, 25: 41, 26: 46, 27: 51, 28: 58, 29: 67, 30: 78
  };

  const filteredSurahs = useMemo(() => {
    if (activeTab === 'bookmarks') {
        const bookmarkedIds = new Set(bookmarks.map(b => b.surahNumber));
        return surahs.filter(s => bookmarkedIds.has(s.number));
    }
    if (searchQuery.trim() === '') return surahs;
    return surahs.filter(s => 
        s.name.includes(searchQuery) || 
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery, activeTab, bookmarks]);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleJuzClick = (juzNumber: number) => {
    const surahNumber = juzStartSurah[juzNumber];
    const surah = surahs.find(s => s.number === surahNumber);
    if (surah) {
        loadSingleSurah(surah);
        setShowSplash(false);
        if (isMobile) {
            setDrawerOpen(false);
        } else {
            setSidebarCollapsed(true);
        }
    }
  };

  const sidebarVariants = {
    expanded: { width: isMobile ? '100%' : 280 },
    collapsed: { width: 76 }
  };

  return (
    <motion.div 
      initial={false}
      animate={isSidebarCollapsed && !isMobile ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="relative h-full bg-theme-surface flex flex-col text-theme-text-primary font-sans border-l border-theme-border z-30 shadow-2xl transition-colors duration-300"
    >
      {/* Mobile Header (Close Button) */}
      {isMobile && (
        <div className="h-16 flex items-center justify-between px-6 border-b border-theme-border bg-theme-bg-primary/50">
          <h2 className="text-xl font-bold font-serif text-theme-text-primary">القائمة</h2>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 hover:bg-theme-surface-hover rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Collapse Toggle Button (Desktop Only) */}
      {!isMobile && (
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -left-4 top-20 w-8 h-8 bg-theme-surface border border-theme-border rounded-full shadow-lg flex items-center justify-center z-50 text-theme-text-secondary hover:text-theme-accent transition-all hover:scale-110 active:scale-95"
        >
          {isSidebarCollapsed ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
        </button>
      )}

      {/* Header */}
      <div className={`h-16 flex items-center ${isSidebarCollapsed && !isMobile ? 'justify-center' : 'justify-between'} px-4 bg-theme-surface relative z-20 flex-shrink-0`}>
        {isSearchOpen && (!isSidebarCollapsed || isMobile) ? (
            <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-200">
                <SearchIcon className="w-5 h-5 text-theme-accent" />
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="ابحث..."
                    className="flex-1 bg-transparent border-none outline-none text-theme-text-primary placeholder-theme-text-muted font-sans text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchClose} className="p-1 hover:bg-theme-surface-hover rounded-full">
                    <XMarkIcon className="w-5 h-5 text-theme-text-muted" />
                </button>
            </div>
        ) : (
            <>
                <AnimatePresence mode="wait">
                  {(!isSidebarCollapsed || isMobile) ? (
                    <motion.h2 
                      key="full-logo"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-xl font-bold font-serif text-theme-text-primary tracking-wide whitespace-nowrap overflow-hidden"
                    >
                      القرآن الكريم
                    </motion.h2>
                  ) : (
                    <motion.div 
                      key="compact-logo"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-2xl font-bold text-theme-accent"
                    >
                      ق
                    </motion.div>
                  )}
                </AnimatePresence>

                {(!isSidebarCollapsed || isMobile) && (
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                      <button 
                          onClick={() => {
                              resumeLastRead();
                              setShowSplash(false);
                              if (isMobile) {
                                  setDrawerOpen(false);
                              } else {
                                  setSidebarCollapsed(true);
                              }
                          }}
                          className="p-2 hover:bg-theme-surface-hover active:scale-95 rounded-full transition-all text-emerald-600 dark:text-emerald-400"
                          title="أكمل القراءة"
                      >
                          <BookIcon className="w-6 h-6" />
                      </button>
                      <button 
                          onClick={() => {
                              setIsSearchOpen(true);
                              setActiveTab('surahs');
                          }}
                          className="p-2 hover:bg-theme-surface-hover active:scale-95 rounded-full transition-all"
                          title="بحث"
                      >
                          <SearchIcon className="w-6 h-6" />
                      </button>
                      <div className="relative" ref={menuRef}>
                          <button 
                              onClick={() => setIsMenuOpen(!isMenuOpen)}
                              className="p-2 hover:bg-theme-surface-hover rounded-full transition-colors"
                              title="خيارات"
                          >
                              <DotsVerticalIcon className="w-6 h-6" />
                          </button>
                          
                          {/* Dropdown Menu & Settings */}
                          {isMenuOpen && (
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
                          )}
                      </div>
                  </div>
                )}
            </>
        )}
      </div>

      {/* Tabs / Icons Rail */}
      <div className={`flex ${isSidebarCollapsed && !isMobile ? 'flex-col items-center py-4' : 'items-center'} bg-theme-surface border-b border-theme-border flex-shrink-0`}>
        {[
          { id: 'surahs', label: 'السور', icon: BookIcon },
          { id: 'juz', label: 'الأجزاء', icon: SearchIcon },
          { id: 'bookmarks', label: 'الإشارات', icon: BookmarkSolidIcon }
        ].map((tab) => (
          <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                ${isSidebarCollapsed && !isMobile ? 'w-full py-4' : 'flex-1 py-3'}
                flex flex-col items-center justify-center text-sm font-bold uppercase tracking-wider relative transition-all duration-300
                ${activeTab === tab.id ? 'text-theme-accent' : 'text-theme-text-muted hover:text-theme-text-primary'}
              `}
              title={tab.label}
          >
              <tab.icon className={`w-6 h-6 ${isSidebarCollapsed && !isMobile ? '' : 'mb-1 md:hidden'}`} />
              {(!isSidebarCollapsed || isMobile) && <span className="text-[10px] md:text-xs">{tab.label}</span>}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className={isSidebarCollapsed && !isMobile ? "absolute left-0 top-1/4 bottom-1/4 w-1 bg-theme-accent rounded-r-full" : "absolute bottom-0 left-0 right-0 h-0.5 bg-theme-accent"} 
                />
              )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto bg-theme-surface scrollbar-thin scrollbar-thumb-theme-border ${isSidebarCollapsed && !isMobile ? 'overflow-hidden' : ''}`}>
        {!isSidebarCollapsed || isMobile ? (
          activeTab === 'juz' ? (
              <div className="p-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                      <button
                          key={juz}
                          onClick={() => handleJuzClick(juz)}
                          className="w-full flex items-center justify-between p-4 mb-2 bg-theme-bg-primary hover:bg-theme-surface-hover rounded-lg border border-theme-border transition-all text-right group"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-theme-accent flex items-center justify-center font-bold font-serif text-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                                  {juz}
                              </div>
                              <div>
                                  <span className="block text-theme-text-primary font-bold">الجزء {juz}</span>
                                  <span className="text-xs text-theme-text-muted">بداية من {surahs.find(s => s.number === juzStartSurah[juz])?.name}</span>
                              </div>
                          </div>
                      </button>
                  ))}
              </div>
          ) : (
              <>
                  {activeTab === 'bookmarks' && filteredSurahs.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 text-theme-text-muted text-center p-8">
                          <BookmarkSolidIcon className="w-12 h-12 mb-4 opacity-20" />
                          <p>لا توجد سور محفوظة حالياً</p>
                      </div>
                  )}

                  {filteredSurahs.map((surah, index) => (
                      <div key={surah.number}>
                          {activeTab === 'surahs' && index % 20 === 0 && index !== 0 && !searchQuery && (
                               <div className="bg-theme-bg-primary px-4 py-2 text-theme-text-muted text-xs font-bold uppercase tracking-widest border-y border-theme-border">
                                  مجموعة {Math.floor(index / 20) + 1}
                              </div>
                          )}
                          <button
                              onClick={() => {
                                  loadSingleSurah(surah);
                                  setShowSplash(false);
                                  if (isMobile) {
                                      setDrawerOpen(false);
                                  } else {
                                      setSidebarCollapsed(true);
                                  }
                              }}
                              className={`w-full text-right p-4 flex items-center gap-4 transition-colors duration-200 border-b border-theme-border
                                  ${selectedSurah?.number === surah.number ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-theme-surface-hover'}
                              `}
                          >
                              <div className="text-lg font-sans text-theme-text-muted font-medium w-8 text-center">
                                  {surah.number}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-baseline mb-1">
                                      <span className={`text-lg font-bold font-serif ${selectedSurah?.number === surah.number ? 'text-theme-accent' : 'text-theme-text-primary'}`}>
                                          {surah.name.replace('سُورَةُ ', '')}
                                      </span>
                                      <span className={`text-sm ${selectedSurah?.number === surah.number ? 'text-theme-accent' : 'text-theme-text-secondary'}`}>
                                          {surah.englishName}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-theme-text-muted font-sans">
                                      <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</span>
                                  </div>
                              </div>
                          </button>
                      </div>
                  ))}
              </>
          )
        ) : (
          /* Mini Rail Content (Active items indicator or simple list) */
          <div className="flex flex-col items-center py-4 gap-4">
             {activeTab === 'bookmarks' && bookmarks.slice(0, 5).map(b => (
               <button key={b.surahNumber} onClick={() => loadSingleSurah(surahs.find(s => s.number === b.surahNumber)!)} className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-theme-accent flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform">
                 {b.surahNumber}
               </button>
             ))}
             {activeTab === 'surahs' && selectedSurah && (
               <div className="w-10 h-10 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                 {selectedSurah.number}
               </div>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;