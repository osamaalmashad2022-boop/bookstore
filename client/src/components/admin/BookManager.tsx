import React, { useState, useEffect, useRef } from 'react';
import { Book, Category } from '../../types';
import { Plus, Search, Trash2, Edit, Sparkles, Loader2, BookOpen, Image as ImageIcon, Check, X, CheckCircle2, AlertCircle, Upload, RotateCcw, Link as LinkIcon } from 'lucide-react';
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

  // Cover Image Customization & Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [apiCoverImage, setApiCoverImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Auto-Fill State
  const [autoFillQuery, setAutoFillQuery] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillResults, setAutoFillResults] = useState<any[]>([]);
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);
  const [autoFillSource, setAutoFillSource] = useState<string | null>(null);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);

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
    setApiCoverImage(null);
    setUploadError(null);
    setShowUrlInput(false);
    setIsDragging(false);
    setIsBestseller(false);
    setIsFeatured(false);
    setAutoFillQuery('');
    setAutoFillResults([]);
    setAutoFillNotice(null);
    setAutoFillSuccess(false);
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
    setApiCoverImage(null);
    setUploadError(null);
    setShowUrlInput(false);
    setIsDragging(false);
    setIsBestseller(book.is_bestseller === 1);
    setIsFeatured(book.is_featured === 1);
    setAutoFillQuery(book.title);
    setAutoFillResults([]);
    setAutoFillNotice(null);
    setAutoFillSuccess(false);
    setIsModalOpen(true);
  };

  const handleAutoFill = async (overrideQuery?: string) => {
    const q = (typeof overrideQuery === 'string' ? overrideQuery : autoFillQuery).trim();
    if (!q) return;
    setAutoFillLoading(true);
    setAutoFillNotice(null);
    try {
      const res = await adminFetch(`/api/admin/google-books?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setAutoFillResults(data.results);
        setAutoFillSource(data.source || 'google-books');
        if (data.message) {
          setAutoFillNotice(data.message);
        }
      } else {
        setAutoFillResults([]);
        setAutoFillNotice(data.message || 'لم يتم العثور على نتائج. تأكد من كتابة الاسم بدقة أو جرب البحث برقم ISBN الدولي.');
      }
    } catch (e) {
      console.error(e);
      setAutoFillNotice('تعذر الاتصال بخدمة الكتب. تحقق من اتصال الإنترنت.');
    } finally {
      setAutoFillLoading(false);
    }
  };

  const applyAutoFillItem = (item: any) => {
    setTitle(item.title || title);
    setAuthor(item.author || author);
    if (item.pageCount) setPageCount(String(item.pageCount));
    if (item.coverImage) {
      setCoverImage(item.coverImage);
      setApiCoverImage(item.coverImage);
    }
    if (item.description) {
      const cleanDesc = item.description.trim();
      setWhyRead(cleanDesc.slice(0, 180) + (cleanDesc.length > 180 ? '...' : ''));
      setExcerptText(cleanDesc);
    }
    setAutoFillResults([]);
    setAutoFillNotice(null);
    setAutoFillSuccess(true);
    setUploadError(null);
    setTimeout(() => setAutoFillSuccess(false), 4000);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميجابايت');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setCoverImage(readerEvent.target?.result as string);
            setIsProcessingImage(false);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to lightweight high quality JPEG data URL (~40-80KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCoverImage(compressedDataUrl);
        } catch (err) {
          console.error('Image processing error:', err);
          setCoverImage(readerEvent.target?.result as string);
        } finally {
          setIsProcessingImage(false);
        }
      };

      img.onerror = () => {
        setIsProcessingImage(false);
        setUploadError('تعذر قراءة ملف الصورة. تأكد من أن الملف سليم.');
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessingImage(false);
      setUploadError('فشلت قراءة الصورة من جهازك.');
    };

    reader.readAsDataURL(file);
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
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140" viewBox="0 0 100 140"><rect width="100%" height="100%" fill="%231c1917"/><text x="50%" y="50%" text-anchor="middle" fill="%23d97706" font-size="14">📖</text></svg>';
                  }}
                />
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
              {/* 1-Click Smart Auto-Fill helper (Google Books & Open Library) */}
              <div className="bg-gradient-to-r from-amber-950/40 via-[#1e1728] to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-readex">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>
                      {editingBook ? 'تحديث وتعبئة البيانات تلقائياً:' : 'ميزة الملء الذكي التلقائي للكتب:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 hidden sm:inline">جلب الغلاف والعنوان والتفاصيل بضغطة واحدة</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسم الكتاب أو الـ ISBN (مثال: ظل الريح، جلسات نفسية، 9789778240580)..."
                    value={autoFillQuery}
                    onChange={e => setAutoFillQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAutoFill())}
                    className="flex-1 px-4 py-2 rounded-xl border border-amber-900/60 text-xs sm:text-sm bg-[#120e18] text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFill()}
                    disabled={autoFillLoading || !autoFillQuery.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-50 text-stone-950 text-xs sm:text-sm font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/50"
                  >
                    {autoFillLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{autoFillLoading ? 'جارٍ البحث...' : 'جلب البيانات'}</span>
                  </button>
                </div>

                {/* Auto-Fill Success Alert */}
                {autoFillSuccess && (
                  <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-readex">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تم تطبيق بيانات الكتاب وتعبئة الحقول بنجاح! يمكنك الآن مراجعتها وتعديلها.</span>
                  </div>
                )}

                {/* Auto-Fill Notice or Help */}
                {autoFillNotice && (
                  <div className="bg-amber-950/60 border border-amber-600/40 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2 animate-fade-in font-readex">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{autoFillNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoFillNotice(null)}
                      className="text-stone-400 hover:text-stone-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Auto fill suggestions */}
                {autoFillResults.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                      <span>
                        النتائج المطابقة ({autoFillResults.length})
                        {autoFillSource && (
                          <span className="ms-1.5 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px] font-mono">
                            {autoFillSource === 'arabic-archive' ? 'الأرشيف العربي' : autoFillSource === 'open-library' ? 'Open Library' : 'Google Books'}
                          </span>
                        )}
                        {' '}- اضغط لتطبيق البيانات:
                      </span>
                      <button
                        type="button"
                        onClick={() => setAutoFillResults([])}
                        className="text-stone-500 hover:text-stone-300 flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" />
                        مسح
                      </button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {autoFillResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => applyAutoFillItem(item)}
                          className="bg-[#120e18] p-3 rounded-xl border border-amber-900/50 flex items-center gap-3 cursor-pointer hover:bg-amber-950/50 hover:border-amber-500/50 transition-all group"
                        >
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-11 h-16 object-cover rounded-lg shrink-0 border border-amber-900/40 shadow-sm"
                            onError={e => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-amber-100 truncate font-readex group-hover:text-amber-300">
                                {item.title}
                              </h5>
                              {item.source && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono shrink-0">
                                  {item.source === 'arabic-archive' ? 'الأرشيف العربي' : item.source === 'open-library' ? 'Open Library' : 'Google Books'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 truncate block mt-0.5">المؤلف: {item.author}</span>
                            <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-1">
                              {item.pageCount ? <span>{item.pageCount} صفحة</span> : null}
                              {item.publishedDate ? <span>سنة النشر: {item.publishedDate.slice(0, 4)}</span> : null}
                              {item.isbn ? <span className="font-mono">ISBN: {item.isbn}</span> : null}
                            </div>
                          </div>
                          <span className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0 flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                            اختيار وتطبيق
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form id="book-manager-form" onSubmit={handleSaveBook} className="space-y-5">
                {/* Section 1: Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 font-readex border-b border-amber-900/20 pb-1">
                    <span>1. معلومات المخطوطة الأساسية</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-amber-200 block font-readex">عنوان الكتاب *</label>
                        {title.trim().length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setAutoFillQuery(title);
                              handleAutoFill(title);
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                            title="بحث عن تفاصيل هذا العنوان في Google Books"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>جلب تلقائي بالاسم</span>
                          </button>
                        )}
                      </div>
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

                  {/* API Cover Hint */}
                  {apiCoverImage && coverImage === apiCoverImage && (
                    <div className="bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-xl flex items-start gap-2 text-xs text-amber-200/90">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>تم جلب هذه الصورة تلقائياً من خدمة الكتب. إذا كانت الصورة غير مناسبة أو منخفضة الجودة، يمكنك استبدالها برفع صورة واضحة من جهازك الآن.</span>
                      </div>
                    </div>
                  )}

                  {/* Upload & Dropzone Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 transition-all text-right ${
                      isDragging 
                        ? 'border-amber-400 bg-amber-500/10 scale-[1.01]' 
                        : 'border-amber-900/40 bg-[#16121f] hover:border-amber-500/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                          {isProcessingImage ? (
                            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-amber-100 font-readex">
                            رفع غلاف من جهازك (كمبيوتر / هاتف)
                          </div>
                          <p className="text-[11px] text-stone-400 font-readex">
                            اسحب الصورة وأفلتها هنا أو انقر للاختيار (PNG, JPG, WebP)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingImage}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{coverImage?.startsWith('data:image/') ? 'تغيير الصورة المرفوعة' : 'اختر صورة من جهازك'}</span>
                        </button>

                        {apiCoverImage && coverImage !== apiCoverImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImage(apiCoverImage);
                              setUploadError(null);
                            }}
                            className="px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-900/40 font-bold text-xs flex items-center gap-1 transition-colors"
                            title="استعادة صورة API المقترحة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">استعادة صورة الـ API</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <div className="mt-3 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Secondary URL toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 transition-colors font-readex"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{showUrlInput ? 'إخفاء حقل رابط الصورة (URL)' : 'أو إدخال رابط صورة يدوي (URL)...'}</span>
                    </button>

                    {coverImage && coverImage !== 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80');
                        }}
                        className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        استخدام الغلاف الافتراضي
                      </button>
                    )}
                  </div>

                  {showUrlInput && (
                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">رابط صورة الغلاف (URL)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={coverImage.startsWith('data:image/') ? '' : coverImage}
                        onChange={e => {
                          setCoverImage(e.target.value);
                          setUploadError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {/* Pages Count and Live Cover Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                    <div className="sm:col-span-8">
                      <label className="text-xs font-bold text-amber-200 block mb-1.5 font-readex">عدد الصفحات التقريبي *</label>
                      <input
                        type="number"
                        placeholder="200"
                        value={pageCount}
                        onChange={e => setPageCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#1a1523] text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-amber-100 font-readex"
                      />
                      <p className="text-[10px] text-stone-500 mt-1 font-readex">
                        يُستخدم لحساب ساعات القراءة التقريبية لزوار المتجر
                      </p>
                    </div>

                    {/* Live Cover Preview */}
                    <div className="sm:col-span-4 flex items-center justify-center bg-[#1a1523] border border-amber-900/40 rounded-2xl p-3 min-h-[130px]">
                      {coverImage ? (
                        <div className="text-center space-y-2">
                          <div className="relative inline-block">
                            <img
                              src={coverImage}
                              alt="معاينة الغلاف"
                              className="w-16 h-24 object-cover rounded-lg shadow-md mx-auto border border-amber-500/40"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute -bottom-1.5 -left-1.5 p-1 rounded-full bg-amber-500 text-stone-950 shadow hover:bg-amber-400 transition-colors"
                              title="تغيير الصورة"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div>
                            {coverImage.startsWith('data:image/') ? (
                              <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-readex">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                صورة من جهازك
                              </span>
                            ) : apiCoverImage && coverImage === apiCoverImage ? (
                              <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-readex">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                تلقائية من الـ API
                              </span>
                            ) : (
                              <span className="text-[9px] bg-stone-800 text-stone-300 border border-stone-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-readex">
                                رابط إنترنت
                              </span>
                            )}
                          </div>
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
