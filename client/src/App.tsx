import React, { useState, useEffect } from 'react';
import { Book, Category } from './types';
import { Navigation } from './components/Navigation';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { SmartAdvisor } from './components/SmartAdvisor';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CandleTorch } from './components/CandleTorch';
import { Candle } from './components/Candle';
import { Search, Truck, ShieldCheck, Flame, Lock } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'advisor' | 'admin'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = () => {
    setLoading(true);
    let url = `/api/books?`;
    if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
    if (selectedLevel !== 'all') url += `&level=${selectedLevel}`;
    if (onlyInStock) url += `&inStock=true`;
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.books) {
          setBooks(data.books);
        }
      })
      .catch(err => console.error('Fetch books error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/books/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      });
  }, []);

  useEffect(() => {
    if (currentTab === 'catalog') {
      fetchBooks();
    }
  }, [selectedCategory, selectedLevel, onlyInStock, searchQuery, currentTab]);

  // Discreet secret URL detection for store owner (#admin or ?admin)
  useEffect(() => {
    const checkAdminRoute = () => {
      const isHashAdmin = window.location.hash.toLowerCase() === '#admin';
      const isQueryAdmin = new URLSearchParams(window.location.search).has('admin');
      const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
      if (isHashAdmin || isQueryAdmin || isPathAdmin) {
        setCurrentTab('admin');
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  return (
    <div className="min-h-screen pb-20 sm:pb-10 flex flex-col justify-between bg-[#0d0b0f] text-[#ede6d6]">
      {/* Top Header & Mobile Bottom Bar Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSearch={() => {
          setCurrentTab('catalog');
          window.scrollTo({ top: 220, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'advisor' && (
          <SmartAdvisor onSelectBook={book => setSelectedBook(book)} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            onClose={() => {
              setCurrentTab('catalog');
              if (window.location.hash.toLowerCase() === '#admin') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }}
          />
        )}

        {currentTab === 'catalog' && (
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-6 text-right">
            {/* Atmospheric Gothic Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c1424] via-[#120f17] to-[#0d0b0f] text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-900/40 candle-glow">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  <span>✦</span>
                  سر برشلونا القديم منذ 1945
                </div>

                <h2 className="text-xl sm:text-3xl font-black font-readex text-amber-100 leading-tight">
                  «كل كتاب تراه هنا قد نجا من النسيان.. كل كتاب كان له صديق، وله روح.»
                </h2>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-readex">
                  اختر كتاباً تتبناه لإنقاذه من النسيان، نسخ ورقية أصلية مجلدة محفوظة بعناية، مع شحن سريع لكافة محافظات مصر والدفع نقداً عند الاستلام COD.
                </p>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setCurrentTab('advisor')}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-950/50 active:scale-98 transition-all"
                  >
                    <span>🗝️</span>
                    <span>استشر حارس المقبرة لاختيار كتابك</span>
                  </button>

                  <a
                    href="/follow/index.html"
                    className="px-4 py-3 rounded-2xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>بوابة المتابعة والـ QR (خصم 10%)</span>
                  </a>

                  <div className="flex items-center gap-3 text-stone-400 text-[11px] px-2 py-1 font-readex">
                    <span className="flex items-center gap-1 text-amber-400/90">
                      <Truck className="w-3.5 h-3.5" />
                      دفع عند الاستلام COD
                    </span>
                    <span className="flex items-center gap-1 text-amber-400/90">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      نسخ ورقية أصلية 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث بين رفوف المقبرة بالعنوان، اسم المؤلف، أو الموضوع (مثال: ظل الريح، جلسات نفسية...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-amber-900/40 bg-[#15121b] text-xs sm:text-sm text-amber-100 shadow-inner focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-stone-500"
                />
              </div>

              {/* Category Pills (Horizontal Scrolling on Mobile) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                      : 'bg-[#15121b] text-stone-300 border border-amber-900/40 hover:border-amber-700'
                  }`}
                >
                  جميع الكنوز بالمقبرة
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                        : 'bg-[#15121b] text-stone-300 border border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sub-Filters: Level & In Stock Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Level selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400 font-medium">مستوى القارئ:</span>
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'beginner', label: 'مبتدئ' },
                    { key: 'intermediate', label: 'متوسط' },
                    { key: 'advanced', label: 'متقدم' },
                  ].map(lvl => (
                    <button
                      key={lvl.key}
                      onClick={() => setSelectedLevel(lvl.key)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        selectedLevel === lvl.key
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                          : 'bg-[#181420] text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Stock Toggle */}
                <label className="flex items-center gap-1.5 text-stone-300 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={e => setOnlyInStock(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                  />
                  <span>المتوفر بالمقبرة فقط</span>
                </label>
              </div>
            </div>

            {/* Catalog Grid Header */}
            <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-amber-900/30 font-readex">
              <span>عرض <strong>{books.length}</strong> كتاب محفوظ بالمقبرة</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                شحن لجميع المحافظات خلال 48-72 ساعة
              </span>
            </div>

            {/* Books Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 py-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/5] bg-[#15121b] border border-amber-900/20 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-16 bg-[#15121b] rounded-3xl border border-amber-900/40 p-8 space-y-3">
                <div className="flex justify-center mb-1">
                  <Candle size="lg" state="lit" withPlate={true} withGlow={true} />
                </div>
                <h4 className="text-sm font-bold font-readex text-amber-200">لم يُعثر على هذا العنوان في رفوف المقبرة</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto font-readex">
                  جرّب تغيير كلمات البحث، أو استشر حارس المقبرة لترشيح كتاب بديل يلائم شغفك.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-black"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {books.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelect={b => setSelectedBook(b)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals & Slide-Overs */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      <CartDrawer />

      <CheckoutModal />

      {/* Atmospheric Sanctuary Torchlight Cursor Engine */}
      <CandleTorch />

      {/* Footer info with discreet secret lock trigger */}
      <footer className="mt-12 border-t border-amber-900/30 bg-[#120f17] py-6 text-center text-xs text-stone-400">
        <p className="font-bold font-readex text-amber-200 mb-1 flex items-center justify-center gap-1.5">
          <span>مقبرة الكتب المنسية للكتب الورقية © 2026</span>
          <button
            onClick={() => {
              setCurrentTab('admin');
              window.location.hash = 'admin';
            }}
            title="بوابة حارس المقبرة"
            className="text-stone-700 hover:text-amber-400/80 transition-colors p-1 rounded inline-flex items-center"
            aria-label="Admin"
          >
            <Lock className="w-3 h-3 opacity-30 hover:opacity-100 transition-opacity" />
          </button>
        </p>
        <p className="text-[11px] text-stone-500 font-readex">
          معمارية سحابية دائمة ومجانية بنسبة 100% للأبد • الدفع نقداً عند الاستلام COD • مستشار حارس المقبرة
        </p>
      </footer>
    </div>
  );
};

export default App;
