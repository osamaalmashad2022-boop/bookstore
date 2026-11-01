import React, { useState, useEffect } from 'react';
import { Book, Category } from './types';
import { Navigation } from './components/Navigation';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { SmartAdvisor } from './components/SmartAdvisor';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sparkles, Search, BookOpen, Truck, ShieldCheck, Flame } from 'lucide-react';

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

  return (
    <div className="min-h-screen pb-20 sm:pb-10 flex flex-col justify-between">
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
          <AdminDashboard />
        )}

        {currentTab === 'catalog' && (
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-6">
            {/* Hero Banner with Smart Advisor Callout */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-brand-950 text-white p-6 sm:p-10 shadow-lg">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold border border-brand-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  مستشار القراءة الذكي متوفر الآن
                </div>

                <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                  الكتب الورقية التي تغير طريقة تفكيرك.. تصلك حتى باب بيتك
                </h2>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  نسخ ورقية أصلية مجلدة مختارة بعناية في علم النفس والفلسفة وتطوير الذات، مع خدمة الدفع عند الاستلام والشحن لكافة محافظات مصر.
                </p>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setCurrentTab('advisor')}
                    className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-600/30 active:scale-98 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>جرّب مستشار الكتب الذكي 🧠</span>
                  </button>

                  <div className="flex items-center gap-3 text-stone-300 text-[11px] px-2 py-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-400" />
                      دفع عند الاستلام COD
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                      نسخ ورقية 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky/Smooth Search and Filter Controls */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث بالعنوان، اسم المؤلف، أو الموضوع (مثال: جلسات نفسية، العادات...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-stone-200/90 text-xs sm:text-sm bg-white shadow-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                />
              </div>

              {/* Category Pills (Horizontal Scrolling on Mobile) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  جميع الكتب
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
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
                  <span className="text-stone-400 font-medium">المستوى:</span>
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
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Stock Toggle */}
                <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={e => setOnlyInStock(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>المتوفر بالمخزن فقط</span>
                </label>
              </div>
            </div>

            {/* Catalog Grid Header */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
              <span>عرض <strong>{books.length}</strong> كتاب متوفر</span>
              <span className="flex items-center gap-1 text-brand-700 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                شحن لجميع المحافظات خلال 48-72 ساعة
              </span>
            </div>

            {/* Books Grid (2 cols mobile, 3-4 desktop) */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 py-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/5] bg-stone-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">لا توجد كتب تطابق هذا البحث</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  جرّب تغيير التصنيف أو كلمات البحث، أو استخدم مستشار الكتب لمساعدتك في العثور على بديل.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
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

      {/* Footer info */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 hidden sm:block">
        <p className="font-semibold text-stone-700 mb-1">مقبرة الكتب المنسية للكتب الورقية © 2026</p>
        <p className="text-[11px] text-stone-400">
          معمارية سحابية دائمة ومجانية بنسبة 100% للأبد • الدفع نقداً عند الاستلام COD • مستشار الكتب الذكي
        </p>
      </footer>
    </div>
  );
};

export default App;
