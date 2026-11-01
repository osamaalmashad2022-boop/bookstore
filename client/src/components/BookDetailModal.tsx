import React, { useState } from 'react';
import { Book } from '../types';
import { X, BookOpen, Clock, FileText, Check, Sparkles } from 'lucide-react';
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
      case 'advanced': return 'متقدم (تعمق وأصول)';
      default: return 'عام';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Modal / Bottom Sheet Box - Gothic Sanctuary */}
      <div
        className="bg-[#120f17] text-[#ede6d6] w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-900/60 candle-glow text-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Dismiss */}
        <div className="px-5 py-4 border-b border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              مخطوطة من المقبرة 📜
            </span>
            {book.stock_quantity > 0 ? (
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                متوفر بالمقبرة للشحن الفوري
              </span>
            ) : (
              <span className="text-xs text-rose-400 font-semibold">مفقود حالياً</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Top Info Banner */}
          <div className="flex gap-4">
            <div className="w-28 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-stone-900 shadow-xl shrink-0 border border-amber-900/40">
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base sm:text-xl font-bold font-readex text-amber-100 leading-snug mb-1">
                  {book.title}
                </h2>
                <p className="text-xs text-amber-400/80 font-medium mb-3">
                  تأليف: {book.author}
                </p>

                {/* Topics / Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {book.sub_topics.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 text-stone-300 border border-stone-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2 border-t border-amber-950/60">
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {book.price} <span className="text-xs font-normal text-stone-400">ج.م</span>
                </span>
                {book.original_price && book.original_price > book.price && (
                  <span className="text-xs text-stone-500 line-through">
                    {book.original_price} ج.م
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Book DNA Badges Card */}
          <div className="bg-[#181420] rounded-2xl p-3 border border-amber-900/40 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5">
              <span className="text-[10px] text-stone-400 block mb-1">مستوى الصعوبة</span>
              <span className="font-bold text-amber-200 block text-[11px]">
                {getLevelLabel(book.reader_level)}
              </span>
            </div>
            <div className="p-1.5 border-x border-amber-900/30">
              <span className="text-[10px] text-stone-400 block mb-1">عدد الصفحات</span>
              <span className="font-bold text-amber-200 flex items-center justify-center gap-1 text-[11px]">
                <BookOpen className="w-3 h-3 text-amber-400" />
                {book.page_count} ص
              </span>
            </div>
            <div className="p-1.5">
              <span className="text-[10px] text-stone-400 block mb-1">وقت القراءة المقدر</span>
              <span className="font-bold text-amber-200 flex items-center justify-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                ~{book.reading_time_hours} س
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Overview vs Look Inside / Excerpt) */}
          <div className="flex border-b border-amber-900/40">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              سر القراءة والأثر
            </button>
            <button
              onClick={() => setActiveTab('excerpt')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'excerpt'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              تصفح مقتطف من الكتاب (Look Inside)
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'overview' ? (
            <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-readex">
              {/* Why Read This Book Callout */}
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1.5 font-readex">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  لماذا تتبنى هذا الكتاب بالتحديد؟
                </div>
                <p className="text-amber-100/90 leading-relaxed">
                  {book.why_read}
                </p>
              </div>

              {/* Physical Book Specifications */}
              <div className="text-[11px] text-stone-400 space-y-1 bg-black/40 p-3 rounded-xl border border-stone-800 font-readex">
                <p>📦 <strong>نوع المنتج:</strong> نسخة ورقية أصلية مجلدة فاخرة، محفوظة بعناية.</p>
                <p>🚚 <strong>التوصيل:</strong> شحن سريع لجميع المحافظات مع الدفع نقداً عند الاستلام COD.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#181420] rounded-2xl p-4 border border-amber-900/40 space-y-3 font-readex">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                <span className="text-xs font-bold text-amber-300 font-readex">مقتطف من صفحات المخطوطة الأولى</span>
                <span className="text-[10px] text-stone-400">معاينة أصلية</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 whitespace-pre-line leading-relaxed font-readex">
                {book.excerpt_text || '«كل كتاب تراه هنا قد نجا من النسيان.. كل كتاب كان له صديق، وله روح.»'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Fixed Action */}
        <div className="p-4 border-t border-amber-900/30 bg-[#16131d] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-400 block">المبلغ المطلوب عند الاستلام</span>
            <span className="text-base font-bold text-amber-400">{book.price} ج.م</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity <= 0}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              book.stock_quantity <= 0
                ? 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                : added
                ? 'bg-amber-400 text-stone-950 font-black'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-black shadow-lg shadow-amber-950/40 active:scale-98'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة لصندوقك!</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <span>📜 أضف نسخة إضافية ({inCartQty} بالصندوق)</span>
              </>
            ) : (
              <>
                <span>📜 تبنّ هذا الكتاب وأضفه لصندوقك</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
