import React, { useState } from 'react';
import { Book } from '../types';
import { X, BookOpen, Clock, FileText, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onSelectBook?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
}) => {
  const { addToCart, items } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'excerpt'>('overview');
  const [added, setAdded] = useState(false);

  if (!book) return null;

  const cartItem = items.find(i => i.book.id === book.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (book.stock_quantity <= 0) return;
    addToCart(book, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ (مدخل مبسط)';
      case 'intermediate': return 'متوسط (تطبيق وفهم)';
      case 'advanced': return 'متقدم (تعمق فكري)';
      default: return 'عام';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      {/* Modal / Bottom Sheet Box */}
      <div
        className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Dismiss */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
              تفاصيل الكتاب
            </span>
            {book.stock_quantity > 0 ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                متوفر للشحن الفوري
              </span>
            ) : (
              <span className="text-xs text-rose-600 font-semibold">نفدت الكمية</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Top Info Banner */}
          <div className="flex gap-4">
            <div className="w-28 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shadow-md shrink-0 border border-stone-200/80">
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug mb-1">
                  {book.title}
                </h2>
                <p className="text-sm text-stone-600 font-medium mb-3">
                  تأليف: {book.author}
                </p>

                {/* Topics / Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {book.sub_topics.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2 border-t border-stone-100">
                <span className="text-2xl font-black text-brand-700">
                  {book.price} <span className="text-sm font-normal text-stone-500">ج.م</span>
                </span>
                {book.original_price && book.original_price > book.price && (
                  <span className="text-xs text-stone-400 line-through">
                    {book.original_price} ج.م
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Book DNA Badges Card */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <span className="text-[10px] text-stone-400 block mb-1">مستوى الصعوبة</span>
              <span className="text-xs font-bold text-stone-800 block">
                {getLevelLabel(book.reader_level)}
              </span>
            </div>
            <div className="p-2 border-x border-stone-200/80">
              <span className="text-[10px] text-stone-400 block mb-1">عدد الصفحات</span>
              <span className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                {book.page_count} صفحة
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] text-stone-400 block mb-1">وقت القراءة المقدر</span>
              <span className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                ~{book.reading_time_hours} ساعات
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Overview vs Look Inside / Excerpt) */}
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              نبذة ولماذا تقرأه
            </button>
            <button
              onClick={() => setActiveTab('excerpt')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'excerpt'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              تصفح مقتطف من الكتاب (Look Inside)
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'overview' ? (
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              {/* Why Read This Book Callout */}
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  لماذا تقرأ هذا الكتاب بالتحديد؟
                </div>
                <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed">
                  {book.why_read}
                </p>
              </div>

              {/* Physical Book Specifications */}
              <div className="text-xs text-stone-500 space-y-1 bg-white p-3 rounded-xl border border-stone-100">
                <p>📦 <strong>نوع المنتج:</strong> نسخة ورقية أصلية مجلدة بطباعة فاخرة.</p>
                <p>🚚 <strong>التوصيل:</strong> شحن سريع لجميع محافظات مصر مع الدفع عند الاستلام.</p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                <span className="text-xs font-bold text-stone-800">مقتطف من الصفحات الأولى</span>
                <span className="text-[11px] text-stone-500">نسخة معاينة</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-line leading-relaxed font-serif">
                {book.excerpt_text || 'لا يوجد مقتطف مسجل لهذا الكتاب حالياً، لكنه متوفر بنسخته الكاملة فوراً.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Fixed Action */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-stone-500 block">الإجمالي</span>
            <span className="text-lg font-bold text-stone-900">{book.price} ج.م</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity <= 0}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              book.stock_quantity <= 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 active:scale-98'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة للسلة!</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>أضف نسخة إضافية ({inCartQty} بالسلة)</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>أضف إلى سلة المشتريات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
