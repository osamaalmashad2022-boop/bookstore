import React, { useState, useEffect } from 'react';
import { Book, Category } from '../../types';
import { Plus, Search, Trash2, Edit, Sparkles, Loader2 } from 'lucide-react';
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

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120f17] text-[#ede6d6] w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-900/60 candle-glow text-right">
            {/* Header */}
            <div className="px-5 py-4 border-b border-amber-900/30 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold font-readex text-amber-100">
                {editingBook ? `تعديل كتاب: ${editingBook.title}` : 'تسجيل كتاب جديد في مقبرة الكتب'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* 1-Click Smart Auto-Fill helper */}
              {!editingBook && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-readex">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>ميزة الملء الذكي التلقائي (Google Books API):</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اكتب اسم الكتاب أو الـ ISBN لجلب بياناته وغلافه فوراً..."
                      value={autoFillQuery}
                      onChange={e => setAutoFillQuery(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-amber-900/60 text-xs bg-[#181420] text-amber-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={autoFillLoading}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      {autoFillLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'جلب البيانات'}
                    </button>
                  </div>

                  {/* Auto fill suggestions */}
                  {autoFillResults.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                      {autoFillResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => applyAutoFillItem(item)}
                          className="bg-[#181420] p-2 rounded-xl border border-amber-900/40 flex items-center gap-2 cursor-pointer hover:bg-amber-950/40 transition-colors"
                        >
                          <img src={item.coverImage} className="w-8 h-10 object-cover rounded shrink-0" />
                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-xs font-bold text-amber-100 truncate font-readex">{item.title}</h5>
                            <span className="text-[10px] text-stone-400 truncate block">{item.author}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                            اختيار
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSaveBook} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">عنوان الكتاب *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">المؤلف *</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">السعر (ج.م) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100 font-readex"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">السعر الأصلي</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100 font-readex"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">الكمية المتوفرة *</label>
                    <input
                      type="number"
                      required
                      value={stockQuantity}
                      onChange={e => setStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100 font-readex"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">التصنيف الرئيسي *</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs text-amber-100 focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#120f17]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">المستوى القرائي *</label>
                    <select
                      value={readerLevel}
                      onChange={e => setReaderLevel(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="beginner" className="bg-[#120f17]">مبتدئ (مدخل مبسط)</option>
                      <option value="intermediate" className="bg-[#120f17]">متوسط (فهم وتطبيق)</option>
                      <option value="advanced" className="bg-[#120f17]">متقدم (تعمق وأصول)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                    المواضيع الفرعية (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فهم الذات, التفكير الزائد, الصحة النفسية"
                    value={subTopics}
                    onChange={e => setSubTopics(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                    "لماذا تقرأ هذا الكتاب؟" (تستخدمها خوارزمية المستشار الذكي) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="جملة موجزة تشرح الفائدة المباشرة من قراءة الكتاب..."
                    value={whyRead}
                    onChange={e => setWhyRead(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 resize-none text-amber-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">عدد الصفحات</label>
                    <input
                      type="number"
                      value={pageCount}
                      onChange={e => setPageCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100 font-readex"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">رابط صورة الغلاف</label>
                    <input
                      type="url"
                      value={coverImage}
                      onChange={e => setCoverImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 text-amber-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                    مقتطف أو فهرس المحتويات (Look Inside)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="مقتطف من الصفحات الأولى..."
                    value={excerptText}
                    onChange={e => setExcerptText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-xs focus:outline-none focus:border-amber-500 resize-none text-amber-100"
                  />
                </div>

                <div className="flex items-center gap-4 py-2 text-xs">
                  <label className="flex items-center gap-1.5 text-stone-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={e => setIsBestseller(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                    />
                    <span>تمييز كـ الأكثر مبيعاً ✦</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-stone-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={e => setIsFeatured(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                    />
                    <span>إظهار في البانر الرئيسي للمقبرة</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-amber-900/30 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-800 text-xs text-stone-400 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md"
                  >
                    حفظ الكتاب
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
