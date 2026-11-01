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
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return 'عام';
    }
  };

  return (
    <div
      onClick={() => onSelect(book)}
      className="group relative bg-[#15121b] rounded-2xl border border-amber-900/40 hover:border-amber-500/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer text-right"
    >
      {/* Top Cover Image Area */}
      <div className="relative aspect-[3/4] bg-stone-900 overflow-hidden">
        <img
          src={book.cover_image}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
        />

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {book.stock_quantity <= 0 ? (
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-black/85 text-stone-400 border border-stone-800 backdrop-blur-sm">
              مفقود حالياً
            </span>
          ) : book.stock_quantity <= 3 ? (
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-sm animate-pulse">
              متبقي {book.stock_quantity} فقط بالمقبرة
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
              متوفر بالمقبرة
            </span>
          )}
        </div>

        {/* Bestseller Badge */}
        {book.is_bestseller === 1 && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/90 text-stone-950 shadow-xs">
              الأكثر قراءة ✦
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#15121b] to-[#120f17]">
        <div>
          {/* Category & Level Badges */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-readex">
              {getLevelLabel(book.reader_level)}
            </span>
            {book.category_name && (
              <span className="text-stone-400 font-medium">
                {book.category_name}
              </span>
            )}
          </div>

          {/* Book Title */}
          <h3 className="text-xs sm:text-sm font-bold font-amiri text-amber-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-[11px] text-stone-400 line-clamp-1 mb-2 font-medium">
            {book.author}
          </p>

          {/* DNA Stats: Pages & Reading Time */}
          <div className="flex items-center gap-3 text-[10px] text-stone-500 mb-2">
            <div className="flex items-center gap-1">
              <BookText className="w-3 h-3 text-amber-500/70" />
              <span>{book.page_count} صفحة</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500/70" />
              <span>~{book.reading_time_hours} س</span>
            </div>
          </div>

          {/* Why Read This Book (Concise Gothic Callout) */}
          <p className="text-[10px] text-amber-200/80 line-clamp-2 bg-black/40 rounded-lg p-2 border border-amber-900/30 mb-2.5 font-amiri leading-relaxed">
            💡 {book.why_read}
          </p>
        </div>

        {/* Price & Action Area */}
        <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-bold text-amber-400">
                {book.price} <span className="text-[10px] font-normal text-stone-400">ج.م</span>
              </span>
              {book.original_price && book.original_price > book.price && (
                <span className="text-[10px] text-stone-500 line-through">
                  {book.original_price}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity <= 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              book.stock_quantity <= 0
                ? 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                : added
                ? 'bg-amber-400 text-stone-950 font-black scale-95 shadow-md'
                : 'bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>أُضيف</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <Check className="w-3 h-3 text-amber-400" />
                <span>({inCartQty}) أضف</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>أضف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
