import React from 'react';
import { BookOpen, Sparkles, ShoppingBag, ShieldCheck, Search } from 'lucide-react';
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
      {/* Top Mobile & Desktop Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Store Name */}
          <div
            onClick={() => setCurrentTab('catalog')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">دار المعرفة</h1>
              <p className="text-[11px] text-stone-500">متجر الكتب الورقية ومستشارك القرائي</p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="بحث في الكتب"
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Smart Advisor Pill for Desktop / Tablet */}
            <button
              onClick={() => setCurrentTab('advisor')}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'advisor'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              مستشار الكتب الذكي
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="سلة المشتريات"
              className="relative w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar - Optimized for Mobile Thumb Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-lg px-2 py-1.5 sm:hidden">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Tab 1: Home / Catalog */}
          <button
            onClick={() => setCurrentTab('catalog')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              currentTab === 'catalog'
                ? 'text-brand-600 font-bold'
                : 'text-stone-500 hover:text-stone-800 font-medium'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">الرئيسية</span>
          </button>

          {/* Tab 2: Smart Book Advisor */}
          <button
            onClick={() => setCurrentTab('advisor')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl relative transition-all ${
              currentTab === 'advisor'
                ? 'text-brand-600 font-bold'
                : 'text-stone-500 hover:text-stone-800 font-medium'
            }`}
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="text-[11px]">المستشار</span>
          </button>

          {/* Tab 3: Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-500 hover:text-stone-800 font-medium relative transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[11px]">السلة</span>
          </button>

          {/* Tab 4: Admin */}
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              currentTab === 'admin'
                ? 'text-brand-600 font-bold'
                : 'text-stone-500 hover:text-stone-800 font-medium'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">الإدارة</span>
          </button>
        </div>
      </nav>
    </>
  );
};
