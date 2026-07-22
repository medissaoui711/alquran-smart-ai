import React from 'react';

/**
 * Classic Surah Header Ornament with a luminous soft green theme.
 */
export const ClassicSurahHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="w-full my-8 select-none flex justify-center">
      <div className="relative w-full max-w-[500px] h-16 flex items-center justify-center">
        {/* The Luminous Green Frame SVG */}
        <svg viewBox="0 0 400 60" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
          {/* Main Background - Soft Mint/White */}
          <rect x="5" y="5" width="390" height="50" rx="4" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" className="dark:fill-stone-900/80" />
          
          {/* Ornamental Borders */}
          <rect x="8" y="8" width="384" height="44" rx="2" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 1" opacity="0.4" />
          
          {/* Side Circles - Luminous Style */}
          <circle cx="30" cy="30" r="12" fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
          
          <circle cx="370" cy="30" r="12" fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="370" cy="30" r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />

          {/* Central Pill for Title */}
          <rect x="120" y="12" width="160" height="36" rx="18" fill="white" stroke="#10b981" strokeWidth="1.5" className="dark:fill-stone-800" />
        </svg>

        {/* Surah Title */}
        <h2 className="relative z-10 text-2xl md:text-3xl font-amiri text-emerald-900 dark:text-emerald-100 mt-1">
          {title}
        </h2>
      </div>
    </div>
  );
};

/**
 * Classic Ayah Marker with luminous green style.
 */
export const ClassicAyahMarker: React.FC<{ number: number; onClick?: (e: React.MouseEvent) => void }> = ({ number, onClick }) => {
  return (
    <span 
      onClick={onClick}
      className="inline-flex items-center justify-center mx-1 select-none align-middle cursor-help hover:scale-110 transition-transform relative group"
      style={{ verticalAlign: 'middle', top: '-2px' }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" className="text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.3)]">
        {/* Outer Decorative Shape */}
        <path 
          d="M18 2C19.5 8 24 8 30 9.5C24 11 24 15.5 22.5 21.5C21 15.5 16.5 15.5 10.5 14C16.5 12.5 16.5 8 18 2Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
          transform="rotate(45 18 18)"
          opacity="0.3"
        />
        {/* Main Circles */}
        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        
        {/* Ayah Number */}
        <text 
          x="18" 
          y="23" 
          textAnchor="middle" 
          fontSize="11" 
          fontWeight="bold" 
          fill="currentColor"
          className="font-sans dark:fill-emerald-300"
        >
          {number.toLocaleString('ar-EG')}
        </text>
      </svg>
    </span>
  );
};

/**
 * Traditional Bismillah with soft emerald styling.
 */
export const ClassicBismillah: React.FC = () => {
  return (
    <div className="w-full text-center py-6 select-none">
      <div className="text-3xl md:text-4xl font-scheherazade text-emerald-900/80 dark:text-emerald-100/80 tracking-wider">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </div>
    </div>
  );
};
