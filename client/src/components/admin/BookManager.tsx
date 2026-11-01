import React, { useState, useEffect } from 'react';
import { Book, Category } from '../../types';
import { Plus, Search, Trash2, Edit, Sparkles, Loader2, BookOpen, Image as ImageIcon, Check, X } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

export const BookManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('5');
  const [categoryId, setCategoryId] = useState('');
  const [subTopics, setSubTopics] = useState('');
  const [readerLevel, setReaderLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [pageCount, setPageCount] = useState('200');
  const [whyRead, setWhyRead] = useState('');
  const [excerptText, setExcerptText] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Auto-Fill State
  const [autoFillQuery, setAutoFillQuery] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillResults, setAutoFillResults] = useState<any[]>([]);

  const fetchBooks = () => {
    setLoading(true);
    adminFetch('/api/admin/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBooks(data.books);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
    fetch('/api/books/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) setCategoryId(data.categories[0].id);
        }
      });
  }, []);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setPrice('');
    setOriginalPrice('');
    setStockQuantity('5');
    setSubTopics('');
    setReaderLevel('beginner');
    setPageCount('200');
    setWhyRead('');
    setExcerptText('');
    setCoverImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80');
    setIsBestseller(false);
    setIsFeatured(false);
    setAutoFillQuery('');
    setAutoFillResults([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(String(book.price));
    setOriginalPrice(book.original_price ? String(book.original_price) : '');
    setStockQuantity(String(book.stock_quantity));
    setCategoryId(book.category_id);
    setSubTopics(book.sub_topics || '');
    setReaderLevel(book.reader_level);
    setPageCount(String(book.page_count));
    setWhyRead(book.why_read);
    setExcerptText(book.excerpt_text || '');
    setCoverImage(book.cover_image);
    setIsBestseller(book.is_bestseller === 1);
    setIsFeatured(book.is_featured === 1);
    setAutoFillResults([]);
    setIsModalOpen(true);
  };

  const handleAutoFill = async () => {
    if (!autoFillQuery.trim()) return;
    setAutoFillLoading(true);
    try {
      const res = await adminFetch(`/api/admin/google-books?q=${encodeURIComponent(autoFillQuery)}`);
      const data = await res.json();
      if (data.success && data.results) {
        setAutoFillResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoFillLoading(false);
    }
  };

  const applyAutoFillItem = (item: any) => {
    setTitle(item.title || title);
    setAuthor(item.author || author);
    if (item.pageCount) setPageCount(String(item.pageCount));
    if (item.coverImage) setCoverImage(item.coverImage);
    if (item.description) {
      setWhyRead(item.description.slice(0, 180) + '...');
      setExcerptText(item.description);
    }
    setAutoFillResults([]);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      author,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      stock_quantity: parseInt(stockQuantity) || 0,
      category_id: categoryId,
      sub_topics: subTopics,
      reader_level: readerLevel,
      page_count: parseInt(pageCount) || 200,
      reading_time_hours: (parseInt(pageCount) || 200) / 50,
      why_read: whyRead || 'مخطوطة قيمة تثري الفكر والوعي.',
      excerpt_text: excerptText,
      cover_image: coverImage,
      is_bestseller: isBestseller,
      is_featured: isFeatured,
    };

    try {
      const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books';
      const method = editingBook ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchBooks();
      }
    } catch (err) {
      console.error('Save book error:', err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب من سجلات المقبرة؟')) return;
    try {
      const res = await adminFetch(`/api/admin/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 text-right">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#15121b] p-4 rounded-2xl border border-amber-900/40">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="بحث في كتب المقبرة بالاسم أو المؤلف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كتاب جديد (مع الملء التلقائي)</span>
        </button>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-xs">جاري تحميل كتب المقبرة...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              className="bg-[#15121b] p-3.5 rounded-2xl border border-amber-900/30 flex gap-3.5 items-center justify-between"
            >
              <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-amber-900/40">
                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 text-right">
                <h4 className="text-xs sm:text-sm font-bold font-readex text-amber-100 truncate">{book.title}</h4>
                <p className="text-[10px] text-stone-400 truncate mb-1">{book.author}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-amber-400 font-readex">{book.price} ج.م</span>
                  <span className="text-stone-600">•</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${
                    book.stock_quantity > 3
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                      : book.stock_quantity > 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  }`}>
                    المخزون: {book.stock_quantity}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(book)}
                  className="p-2 text-stone-400 hover:text-amber-400 rounded-lg hover:bg-[#1e1927] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-[#1e1927] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Book Modal - Gothic Sanctuary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative my-6 w-full max-w-4xl bg-[#14101a] text-[#ede6d6] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-amber-500/40 candle-glow text-right overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#1a1424] border-b border-amber-900/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-readex text-amber-100">
                    {editingBook ? `تعديل بيانات: ${editingBook.title}` : 'تسجيل كتاب جديد في مقبرة الكتب'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {editingBook ? 'تحديث الأسعار والمخزون والتفاصيل' : 'أدخل بيانات المخطوطة ليتم إدراجها فوراً في المتجر السحابي'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-900/90 text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center border border-stone-800 transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* 1-Click Smart Auto-Fill helper */}
              {!editingBook && (
                <div className="bg-gradient-to-r from-amber-950/40 via-[#1e1728] to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-inner space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-readex">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>ميزة الملء الذكي التلقائي (Google Books):</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 hidden sm:inline">جلب الغلاف والعنوان والتفاصيل بضغطة واحدة</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اكتب اسم الكتاب أو الـ ISBN (مثال: ظل الريح، جلسات نفسية)..."
                      value={autoFillQuery}
                      onChange={e => setAutoFillQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAutoFill())}
                      className="flex-1 px-4 py-2 rounded-xl border border-amber-900/60 text-xs sm:text-sm bg-[#120e18] text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={autoFillLoading || !autoFillQuery.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-50 text-stone-950 text-xs sm:text-sm font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/50"
                    >
                      {autoFillLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>جلب البيانات</span>
                    </button>
                  </div>

                  {/* Auto fill suggestions */}
                  {autoFillResults.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {autoFillResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => applyAutoFillItem(item)}
                          className="bg-[#120e18] p-2.5 rounded-xl border border-amber-900/50 flex items-center gap-3 cursor-pointer hover:bg-amber-950/50 hover:border-amber-500/50 transition-all"
                        >
                          <img src={item.coverImage} className="w-10 h-14 object-cover rounded-lg shrink-0 border border-amber-900/40" />
                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-xs sm:text-sm font-bold text-amber-100 truncate font-readex">{item.title}</h5>
                            <span className="text-[11px] text-stone-400 truncate block mt-0.5">{item.author}</span>
                          </div>
                          <span className="text-[11px] px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            اختيار
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form id="book-manager-form" onSubmit={handleSaveBook} className="space-y-5">
                {/* Section 1: Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>1. معلومات المخطوطة الأساسية</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">عنوان الكتاب *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: ظل الريح"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">اسم المؤلف *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: كارلوس زافون"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Stock */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>2. الأسعار والكمية</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs font-bold text-amber-300 block mb-1.5 font-readex">سعر البيع (ج.م) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="260"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500/50 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-readex font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5 font-readex">السعر الأصلي قبل الخصم (ج.م)</label>
                      <input
                        type="number"
                        placeholder="300 (اختياري)"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-readex"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">الكمية المتوفرة بالمخزون *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="5"
                        value={stockQuantity}
                        onChange={e => setStockQuantity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-readex font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Category & Reading Level */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>3. التصنيف والمستوى القرائي</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">التصنيف الرئيسي *</label>
                      <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#14101a]">{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">المستوى القرائي *</label>
                      <select
                        value={readerLevel}
                        onChange={e => setReaderLevel(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                      >
                        <option value="beginner" className="bg-[#14101a]">مبتدئ (مدخل مبسط وشيق)</option>
                        <option value="intermediate" className="bg-[#14101a]">متوسط (تطبيق وفهم أعمق)</option>
                        <option value="advanced" className="bg-[#14101a]">متقدم (تعمق وأصول فكرية)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Cover Image & Pages */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>4. غلاف المخطوطة وعدد الصفحات</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">رابط صورة الغلاف (URL)</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={coverImage}
                          onChange={e => setCoverImage(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">عدد الصفحات التقريبي</label>
                        <input
                          type="number"
                          placeholder="200"
                          value={pageCount}
                          onChange={e => setPageCount(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-readex"
                        />
                      </div>
                    </div>

                    {/* Live Cover Preview */}
                    <div className="sm:col-span-4 flex items-center justify-center bg-[#1a1523] border border-amber-900/40 rounded-2xl p-3 min-h-[120px]">
                      {coverImage ? (
                        <div className="text-center space-y-1">
                          <img
                            src={coverImage}
                            alt="معاينة الغلاف"
                            className="w-16 h-22 object-cover rounded-lg shadow-md mx-auto border border-amber-500/40"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="text-[10px] text-stone-400 block font-readex">معاينة الغلاف</span>
                        </div>
                      ) : (
                        <div className="text-center text-stone-500 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto opacity-40" />
                          <span className="text-[10px] block font-readex">لا يوجد غلاف محدد</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: Recommendation & Excerpt */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>5. المحتوى والمستشار الذكي</span>
                  </h4>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">
                      المواضيع الفرعية والكلمات الدلالية (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فهم الذات, التفكير الزائد, الصحة النفسية"
                      value={subTopics}
                      onChange={e => setSubTopics(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">
                      "لماذا تقرأ هذا الكتاب؟" (تستخدمها خوارزمية المستشار الذكي) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="جملة موجزة تشرح الفائدة المباشرة والعميقة من قراءة الكتاب..."
                      value={whyRead}
                      onChange={e => setWhyRead(e.target.value)}
                      className="w-full p-3 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none text-amber-100 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">
                      مقتطف أو فهرس المحتويات (Look Inside)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="مقتطف من الصفحات الأولى أو نبذة من مقدمة الكتاب..."
                      value={excerptText}
                      onChange={e => setExcerptText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none text-amber-100 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Section 6: Promo Badges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>6. تمييز الكتاب في واجهة المتجر</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isBestseller
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-[#1a1523] border-amber-900/30 text-stone-300 hover:border-amber-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isBestseller}
                        onChange={e => setIsBestseller(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                      />
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold block font-readex">تمييز كـ الأكثر مبيعاً ✦</span>
                        <span className="text-[10px] text-stone-400 block">يظهر عليه شريط ذهبي مميز في الكتالوج</span>
                      </div>
                    </label>

                    <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isFeatured
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-[#1a1523] border-amber-900/30 text-stone-300 hover:border-amber-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={e => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                      />
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold block font-readex">إظهار في البانر الرئيسي للمقبرة</span>
                        <span className="text-[10px] text-stone-400 block">عرض الكتاب في الواجهة الرئيسية للموقع</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Fixed Footer */}
            <div className="px-6 py-4 bg-[#1a1424] border-t border-amber-900/40 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-stone-800 hover:bg-stone-900 text-xs sm:text-sm text-stone-300 font-bold transition-colors font-readex"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="book-manager-form"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-950/50 active:scale-98 transition-all font-readex flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingBook ? 'تحديث بيانات الكتاب' : 'حفظ الكتاب في المقبرة'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
