import React from 'react';
import { Maximize2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'horizontal' | 'badge';
  source?: 'image' | 'vector';
  className?: string;
  showSubtitle?: boolean;
  onEmblemClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = '',
  showSubtitle = true,
  onEmblemClick,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const titleSizeMap = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const Emblem = (
    <div
      onClick={(e) => {
        if (onEmblemClick) {
          e.stopPropagation();
          onEmblemClick();
        }
      }}
      role={onEmblemClick ? 'button' : undefined}
      tabIndex={onEmblemClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onEmblemClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.stopPropagation();
          onEmblemClick();
        }
      }}
      aria-label={onEmblemClick ? 'انقر لتكبير الشعار الملكي واستعراض تفاصيله' : undefined}
      title={onEmblemClick ? 'انقر لتكبير الشعار الملكي واستعراض تفاصيله' : undefined}
      className={`relative group rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-amber-500/50 bg-[#120e17] shadow-xl transition-all duration-300 ${
        onEmblemClick ? 'cursor-pointer hover:scale-105 hover:border-amber-400 active:scale-95' : ''
      } ${sizeMap[size]}`}
      style={{
        boxShadow: '0 0 16px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Background ambient candle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/70 via-transparent to-transparent pointer-events-none z-10" />

      {/* Emblem Artwork */}
      <img
        src="/logo.jpg"
        alt="شعار مقبرة الكتب المنسية"
        className="w-full h-full object-cover transform scale-105 transition-transform duration-500 group-hover:scale-115"
      />

      {/* Hover Zoom Indicator Overlay */}
      {onEmblemClick && (
        <div className="absolute inset-0 bg-amber-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
          <Maximize2 className="w-3.5 h-3.5 text-amber-200 drop-shadow" />
        </div>
      )}

      {/* Subtle Golden Ring Highlight */}
      <div className="absolute inset-0 rounded-full border border-amber-300/30 pointer-events-none z-30" />
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-b from-[#1b1524] to-[#0d0912] border border-amber-500/35 shadow-2xl relative overflow-hidden ${className}`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="mb-3.5">{Emblem}</div>
        <h1 className={`font-black font-readex text-amber-100 tracking-wide leading-tight ${titleSizeMap[size]}`}>
          مقبرة الكتب المنسية
        </h1>
        {showSubtitle && (
          <p className="text-xs text-amber-400/80 font-readex mt-1.5 max-w-xs leading-relaxed">
            ملاذ الأرواح والكتب الناجية من النسيان
          </p>
        )}
      </div>
    );
  }

  // Variant === 'horizontal'
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {Emblem}
      <div className="flex flex-col justify-center">
        <h1 className={`font-black font-readex text-amber-100 leading-tight tracking-wide flex items-center gap-2 ${titleSizeMap[size]}`}>
          <span>مقبرة الكتب المنسية</span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
        </h1>
        {showSubtitle && (
          <p className="text-[10px] sm:text-xs text-amber-500/85 font-readex font-medium">
            ملاذ الأرواح والكتب الناجية من النسيان
          </p>
        )}
      </div>
    </div>
  );
};
