import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Sparkles, Truck } from 'lucide-react';
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
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-stone-200 animate-slide-left">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-stone-900">سلة المشتريات</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                {items.length} كتب
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Free Shipping Progress Bar */}
          <div className="bg-stone-50 p-3.5 border-b border-stone-100">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-stone-700">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700">مبروك! حصلت على شحن مجاني لكافة المحافظات 🎉</span>
                ) : (
                  <span>
                    أضف <strong className="text-brand-600">{amountNeededForFreeShipping} ج.م</strong> للحصول على شحن مجاني
                  </span>
                )}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-stone-300" />
                </div>
                <p className="text-sm font-bold text-stone-600 mb-1">سلتك فارغة حالياً</p>
                <p className="text-xs text-stone-400 mb-4">تصفح الكتب المميزة أو جرب مستشار الكتب الذكي</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  استكشف الكتب
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.book.id}
                  className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex gap-3 items-center"
                >
                  {/* Cover */}
                  <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.book.cover_image}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {item.book.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate mb-1">
                      {item.book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-brand-700">
                        {item.book.price} ج.م
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-stone-900 px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          disabled={item.quantity >= item.book.stock_quantity}
                          className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 disabled:opacity-40 flex items-center justify-center text-stone-700 transition-colors shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.book.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي للكتب:</span>
                  <span className="font-semibold">{subtotal} ج.م</span>
                </div>

                {isBundleApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      خصم باقة مسار القراءة (10%):
                    </span>
                    <span>-{discountAmount} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>إجمالي الكتب:</span>
                  <span className="text-brand-700 text-base">{totalPrice} ج.م</span>
                </div>
                <p className="text-[10px] text-stone-400 text-right">
                  * يتم حساب مصاريف الشحن تلقائياً عند تحديد محافظتك في الخطوة التالية
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-98 transition-all"
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
