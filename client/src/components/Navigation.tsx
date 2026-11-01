import React from 'react';
import { Search, QrCode, BookOpen, Compass, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavigationProps {
  currentTab: 'catalog' | 'advisor' | 'admin';
  setCurrentTab: (tab: 'catalog' | 'advisor' | 'admin') => void;
  onOpenSearch?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
}) => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <>
      {/* Top Mobile & Desktop Header - Gothic Sanctuary */}
      <header className="sticky top-0 z-40 bg-[#120f17]/95 backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Store Name */}
          <div
            onClick={() => setCurrentTab('catalog')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow-md candle-glow-sm">
              🕯️
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black font-readex text-amber-100 leading-tight">
                مقبرة الكتب المنسية
              </h1>
              <p className="text-[10px] text-amber-500/80 font-readex">
                ملاذ الأرواح والكتب الناجية من النسيان
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="بحث في الكتب"
                className="w-9 h-9 rounded-xl bg-[#1c1724] border border-amber-900/40 hover:border-amber-500/50 flex items-center justify-center text-amber-300 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Follow Hub & QR Link */}
            <a
              href="/follow/index.html"
              title="صفحة المتابعة عبر السوشيل ميديا ورمز الـ QR"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">سوشيل ميديا & QR</span>
              <span className="sm:hidden">QR</span>
            </a>

            {/* Smart Advisor Pill for Desktop / Tablet */}
            <button
              onClick={() => setCurrentTab('advisor')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'advisor'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>مستشار القراءة</span>
            </button>

            {/* Cart Button (صندوق الكتب) */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="صندوق الكتب"
              className="relative w-9 h-9 rounded-xl bg-[#1c1724] border border-amber-900/40 hover:border-amber-500/50 flex items-center justify-center text-amber-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar - Optimized for Mobile Thumb Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#120f17]/95 backdrop-blur-lg border-t border-amber-900/40 shadow-2xl px-2 py-1.5 sm:hidden">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          {/* Tab 1: Sanctuary / Catalog */}
          <button
            onClick={() => setCurrentTab('catalog')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              currentTab === 'catalog'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200 font-medium'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] font-readex">المقبرة</span>
          </button>

          {/* Tab 2: Smart Book Advisor */}
          <button
            onClick={() => setCurrentTab('advisor')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl relative transition-all ${
              currentTab === 'advisor'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200 font-medium'
            }`}
          >
            <div className="relative">
              <Compass className="w-4 h-4 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <span className="text-[11px] font-readex">المستشار</span>
          </button>

          {/* Tab 3: Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-stone-200 font-medium relative transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 mb-0.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[11px] font-readex">الصندوق</span>
          </button>
        </div>
      </nav>
    </>
  );
};
