import React from 'react';
import { Book } from '../types';
import { Clock, BookText, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { addToCart, items } = useCart();
  const [added, setAdded] = React.useState(false);

  const cartItem = items.find(i => i.book.id === book.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.stock_quantity <= 0) return;
    addToCart(book, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return 'عام';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(book)}
      className="group relative bg-white rounded-2xl border border-stone-200/80 hover:border-brand-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Top Cover Image Area */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={book.cover_image}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {book.stock_quantity <= 0 ? (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-800/85 text-white backdrop-blur-sm">
              نفدت الكمية
            </span>
          ) : book.stock_quantity <= 3 ? (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-sm animate-pulse">
              متبقي {book.stock_quantity} فقط
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-sm">
              متوفر بالمخزن
            </span>
          )}
        </div>

        {/* Bestseller Badge */}
        {book.is_bestseller === 1 && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              الأكثر مبيعاً ⭐
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Level Badges */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${getLevelColor(book.reader_level)}`}>
              {getLevelLabel(book.reader_level)}
            </span>
            {book.category_name && (
              <span className="text-[10px] text-stone-500 font-medium">
                {book.category_name}
              </span>
            )}
          </div>

          {/* Book Title */}
          <h3 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-500 line-clamp-1 mb-2 font-medium">
            {book.author}
          </p>

          {/* DNA Stats: Pages & Reading Time */}
          <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2.5">
            <div className="flex items-center gap-1">
              <BookText className="w-3.5 h-3.5 text-stone-400" />
              <span>{book.page_count} صفحة</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>~{book.reading_time_hours} س قراءة</span>
            </div>
          </div>

          {/* Why Read This Book (Concise Callout) */}
          <p className="text-[11px] text-stone-600 line-clamp-2 bg-stone-50 rounded-lg p-2 border border-stone-100/80 mb-3">
            💡 {book.why_read}
          </p>
        </div>

        {/* Price & Action Area */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-stone-900">
                {book.price} <span className="text-xs font-normal text-stone-500">ج.م</span>
              </span>
              {book.original_price && book.original_price > book.price && (
                <span className="text-xs text-stone-400 line-through">
                  {book.original_price} ج.م
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity <= 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              book.stock_quantity <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white shadow-sm scale-95'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>أُضيف</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-200" />
                <span>({inCartQty}) أضف</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>أضف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
