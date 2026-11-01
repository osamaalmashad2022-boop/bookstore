import React, { useState, useEffect } from 'react';
import { X, Download, Flame, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'vector'>('master');
  const [isCandleLit, setIsCandleLit] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleCandle = () => {
    setIsCandleLit(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Dark gothic atmospheric backdrop with candlelight vignette */}
      <div
        className="fixed inset-0 bg-[#070509]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(32, 22, 45, 0.75) 0%, rgba(7, 5, 9, 0.95) 100%)',
        }}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg bg-[#140f1c] border border-amber-500/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.25)] overflow-hidden z-10 flex flex-col max-h-[92vh]"
      >
        {/* Top Gold Glowing Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Modal Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-amber-900/30 bg-[#171221]/90">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse" />
            <h3 id="modal-title" className="text-base sm:text-lg font-black font-readex text-amber-100">
              الختم الملوكي لمقبرة الكتب
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="w-8 h-8 rounded-full bg-stone-900/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-500/20 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-center">
          {/* Version Switcher Tabs */}
          <div className="inline-flex items-center p-1 bg-[#0c0911] rounded-2xl border border-amber-900/40 mx-auto">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'master'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md'
                  : 'text-amber-300/80 hover:text-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>الختم الأثري (HD)</span>
            </button>
            <button
              onClick={() => setActiveTab('vector')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'vector'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md'
                  : 'text-amber-300/80 hover:text-amber-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>شعار فيكتور (SVG)</span>
            </button>
          </div>

          {/* Logo Emblem Showcase Display */}
          <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Ambient Candle Halo Effect */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
                isCandleLit
                  ? 'bg-gradient-to-t from-amber-500/20 via-orange-500/10 to-transparent blur-2xl scale-125'
                  : 'bg-transparent blur-none'
              }`}
            />

            {/* Emblem Circle Container */}
            <div
              className="relative w-full h-full rounded-full p-2 bg-gradient-to-b from-amber-300/40 via-amber-600/30 to-amber-950/60 shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all duration-500 hover:scale-105"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0d0a13] flex items-center justify-center border border-amber-400/40 relative">
                {activeTab === 'master' ? (
                  <img
                    src="/logo.jpg"
                    alt="ختم مقبرة الكتب المنسية"
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isCandleLit ? 'brightness-100 contrast-105' : 'brightness-75 contrast-90 grayscale-[30%]'
                    }`}
                  />
                ) : (
                  <img
                    src="/logo.svg"
                    alt="شعار مقبرة الكتب المنسية"
                    className={`w-full h-full object-contain p-2 filter transition-all duration-700 ${
                      isCandleLit ? 'drop-shadow-[0_0_15px_rgba(255,190,59,0.5)]' : 'opacity-60'
                    }`}
                  />
                )}

                {/* Subtle Inner Gold Edge */}
                <div className="absolute inset-0 rounded-full border border-amber-300/20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interactive Candle Micro-Action */}
          <div className="flex justify-center">
            <button
              onClick={toggleCandle}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isCandleLit
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-amber-200'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isCandleLit ? 'text-amber-400 animate-bounce' : 'text-stone-500'}`} />
              <span>{isCandleLit ? 'انقر للنفخ على شمعة المقبرة 🌬️' : 'أشعل شمعة المقبرة من جديد 🔥'}</span>
            </button>
          </div>

          {/* Brand Philosophy & Carlos Ruiz Zafón Quote */}
          <div className="bg-[#1a1424]/70 border border-amber-900/30 rounded-2xl p-4 text-right">
            <p className="text-xs sm:text-sm text-amber-100 font-readex leading-relaxed">
              «كل كتاب تراه هنا يا ولدي كان له صديق، وكل كتاب نجا من النسيان ينتظر من يحييه من جديد في مقبرة الكتب المنسية.»
            </p>
            <p className="text-[10px] text-amber-500/80 font-readex mt-2 flex items-center justify-between">
              <span>— من حكمة حارس المقبرة الخالدة</span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                كتب ورقية فقط
              </span>
            </p>
          </div>

          {/* Quick Download Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href="/logo.jpg"
              download="maqbara_books_logo_hd.jpg"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black shadow-md hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل الختم (HD)</span>
            </a>
            <a
              href="/logo.svg"
              download="maqbara_books_logo.svg"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-900/60 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل فيكتور (SVG)</span>
            </a>
          </div>

          {/* Link to Full Showcase */}
          <a
            href="/logo_showcase.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors pt-1"
          >
            <span>استعراض معرض الهوية البصرية الكامل ومقاسات الشعار</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
