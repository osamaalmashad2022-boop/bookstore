import React, { useState, useEffect } from 'react';
import { Candle } from './Candle';

export const CandleTorch: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem('maqbara_candle_ambience') === 'true';
  });

  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    localStorage.setItem('maqbara_candle_ambience', isActive ? 'true' : 'false');
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      setMousePos({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [isActive]);

  return (
    <>
      {/* Dynamic Ambient Candlelight Aura */}
      {isActive && (
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
          style={{
            background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 174, 25, 0.12) 0%, rgba(212, 175, 55, 0.05) 45%, transparent 75%)`,
          }}
        />
      )}

      {/* Floating Toggle Button (Bottom-Left Gothic Candle Switch) */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center gap-2 select-none">
        <button
          onClick={() => setIsActive(prev => !prev)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="تبديل إضاءة الشمعة المحيطية"
          className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
            isActive
              ? 'bg-amber-950/80 border-amber-400/80 text-amber-200 shadow-[0_0_20px_rgba(255,190,59,0.4)] scale-105'
              : 'bg-[#15111d]/90 border-amber-900/40 text-stone-400 hover:text-amber-300 hover:border-amber-500/50'
          }`}
        >
          {/* Artisanal Vector Candle */}
          <Candle
            size="sm"
            state={isActive ? 'lit' : 'unlit'}
            withPlate={false}
            withGlow={isActive}
            className="flex-shrink-0"
          />

          <span className="text-xs font-bold font-readex hidden sm:inline">
            {isActive ? 'شمعة المقبرة مشتعلة' : 'أشعل شمعة المقبرة'}
          </span>
        </button>

        {/* Hover Explanatory Tooltip */}
        {showTooltip && (
          <div className="hidden sm:block absolute bottom-full left-0 mb-2 w-48 p-2.5 bg-[#1b1524] border border-amber-500/40 rounded-xl text-[11px] text-amber-100 font-readex shadow-2xl animate-fade-in pointer-events-none">
            {isActive
              ? 'تتجول الآن ونور الشمعة يضيء الممرات ورفوف الكتب بين يديك ✨'
              : 'انقر لتفعيل وضع التجول على ضوء الشموع، ليتبع نور الشمعة حركتك بين الرفوف.'}
          </div>
        )}
      </div>
    </>
  );
};
