import React from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    totalPrice,
    freeShippingThreshold,
    isBundleApplied,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const freeShippingProgress = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        {/* Drawer Panel - Gothic Sanctuary */}
        <div className="w-screen max-w-md bg-[#120f17] text-[#ede6d6] shadow-2xl flex flex-col border-r border-amber-900/40 animate-slide-left text-right">
          {/* Header */}
          <div className="p-4 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <h2 className="text-sm sm:text-base font-bold font-readex text-amber-100">
                صندوق الكتب المتبناة
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {items.length} كتب
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Free Shipping Progress Bar */}
          <div className="bg-[#181420] p-3.5 border-b border-amber-900/30">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-readex">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-amber-300">مبارك! نلت شحناً مجانياً لكافة المحافظات 🎉</span>
                ) : (
                  <span>
                    أضف <strong className="text-amber-400 font-readex">{amountNeededForFreeShipping} ج.م</strong> لتنال الشحن المجاني
                  </span>
                )}
              </span>
              <span className="text-[10px] text-amber-400/80 font-readex">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-stone-900 rounded-full border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-300 relative shadow-[0_0_10px_#f59e0b]"
                style={{ width: `${freeShippingProgress}%` }}
              >
                {/* Flame indicator on the leading edge */}
                {freeShippingProgress > 0 && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 text-xs candle-flame-anim pointer-events-none">
                    🔥
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="relative w-16 h-20 flex items-end justify-center mb-3">
                  <div className="w-6 h-12 rounded-t-sm bg-stone-800 border border-stone-700/60 shadow-inner" />
                  <div className="absolute top-4 w-0.5 h-3 bg-stone-600 rounded-full" />
                  <div className="absolute top-1 w-2 h-2 rounded-full bg-stone-600/40 animate-ping" />
                </div>
                <p className="text-sm font-bold text-amber-200/80 mb-1 font-readex">شمعة صندوقك لم تُشعل بعد...</p>
                <p className="text-xs text-stone-400 mb-4 font-readex">أضف كتابك الأول لتشعل نور المقبرة وتنال خصم الباقة</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-black shadow-md hover:bg-amber-400 transition-colors"
                >
                  استكشف المقبرة
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.book.id}
                  className="p-3 bg-[#15121b] rounded-2xl border border-amber-900/30 flex gap-3 items-center"
                >
                  {/* Cover */}
                  <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-amber-900/40">
                    <img
                      src={item.book.cover_image}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140" viewBox="0 0 100 140"><rect width="100%" height="100%" fill="%231c1917"/><text x="50%" y="50%" text-anchor="middle" fill="%23d97706" font-size="14">📖</text></svg>';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold font-readex text-amber-100 truncate leading-snug mb-0.5">
                      {item.book.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 truncate mb-1 leading-normal">
                      {item.book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-amber-400">
                        {item.book.price} ج.م
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#1e1927] rounded-lg p-1 border border-stone-800">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-amber-200 px-1 font-readex">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          disabled={item.quantity >= item.book.stock_quantity}
                          className="w-5 h-5 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 flex items-center justify-center text-stone-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.book.id)}
                    className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 bg-[#16131d] border-t border-amber-900/30 space-y-3">
              <div className="space-y-1 text-xs text-stone-400 font-readex">
                <div className="flex justify-between">
                  <span>مجموع الكتب:</span>
                  <span className="font-semibold text-amber-200 font-readex">{subtotal} ج.م</span>
                </div>

                {isBundleApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      خصم باقة مسار القراءة (10%):
                    </span>
                    <span className="font-readex">-{discountAmount} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-amber-100 pt-2 border-t border-amber-900/30">
                  <span>الإجمالي المطلوب:</span>
                  <span className="text-amber-400 text-base font-readex">{totalPrice} ج.م</span>
                </div>
                <p className="text-[10px] text-stone-500 text-right">
                  * يتم احتساب مصاريف الشحن للمحافظة في خطوة الدفع عند الاستلام التالية
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg candle-glow active:scale-98 transition-all"
              >
                <span>متابعة الطلب والدفع عند الاستلام (COD)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
