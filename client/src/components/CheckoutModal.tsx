import React, { useState, useEffect } from 'react';
import { X, Check, MessageCircle, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Governorate } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    totalPrice,
    discountAmount,
    subtotal,
    isBundleApplied,
    clearCart,
  } = useCart();

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [selectedGovId, setSelectedGovId] = useState<string>('gov_cairo');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderRef: string;
    whatsappUrl: string;
    finalTotal: number;
    shippingFee: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/books/shipping-governorates')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.governorates) {
          setGovernorates(data.governorates);
          if (data.governorates.length > 0 && !selectedGovId) {
            setSelectedGovId(data.governorates[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching governorates:', err));
  }, []);

  if (!isCheckoutOpen) return null;

  const currentGov = governorates.find(g => g.id === selectedGovId) || {
    id: 'gov_cairo',
    name: 'القاهرة',
    fee: 40,
    delivery_days: '1-2 يوم عمل',
  };

  const freeShippingThreshold = 600;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : currentGov.fee;
  const finalTotal = totalPrice + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      setError('يرجى ملء كافة البيانات الأساسية (الاسم، رقم الهاتف، والعنوان بالتفصيل)');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_whatsapp: sameAsPhone ? customerPhone : customerWhatsapp,
        governorate_id: selectedGovId,
        street_address: streetAddress,
        notes,
        is_bundle: isBundleApplied,
        items: items.map(item => ({
          book_id: item.book.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء حفظ الطلب');
      }

      setOrderSuccess({
        orderRef: data.orderRef,
        whatsappUrl: data.whatsappUrl,
        finalTotal: data.finalTotal,
        shippingFee: data.shippingFee,
      });

      clearCart();

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تأكيد الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
      <div
        className="relative my-auto bg-[#120f17] text-[#ede6d6] w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-900/60 candle-glow"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold font-readex text-amber-100">
              {orderSuccess ? 'تم تسجيل طلبك في مقبرة الكتب!' : 'إتمام الطلب - الدفع عند الاستلام (COD)'}
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form / Success Screen */}
        <div className="overflow-y-auto p-5">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg candle-glow">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black font-readex text-amber-100">تم تسجيل طلبك بنجاح!</h4>
                <p className="text-xs text-stone-400 mt-1">
                  رقم مرجع الفاتورة: <strong className="text-amber-400 text-sm font-readex">{orderSuccess.orderRef}</strong>
                </p>
              </div>

              <div className="bg-[#181420] rounded-2xl p-4 border border-amber-900/30 text-right space-y-2 text-xs font-readex">
                <div className="flex justify-between">
                  <span className="text-stone-400">طريقة الدفع:</span>
                  <span className="font-bold text-amber-200">الدفع نقداً عند الاستلام (COD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">مصاريف الشحن:</span>
                  <span className="font-bold text-amber-200 font-readex">{orderSuccess.shippingFee} ج.م</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-amber-900/30 pt-2 text-amber-100">
                  <span>المبلغ المطلوب عند الاستلام:</span>
                  <span className="text-amber-400 font-readex">{orderSuccess.finalTotal} ج.م</span>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed max-w-sm mx-auto font-readex">
                تم تجهيز رسالة الفاتورة المنسقة وفتح تطبيق واتساب المتجر. إذا لم تفتح نافذة المحادثة، اضغط على الزر الأخضر أدناه:
              </p>

              <a
                href={orderSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>تأكيد الفاتورة على واتساب المقبرة 💬</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد محمود"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                    رقم الهاتف للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-200 font-readex">
                      رقم الواتساب
                    </label>
                    <button
                      type="button"
                      onClick={() => setSameAsPhone(!sameAsPhone)}
                      className="text-[10px] text-amber-400 font-semibold"
                    >
                      {sameAsPhone ? 'رقم مختلف؟' : 'نفس رقم الهاتف'}
                    </button>
                  </div>
                  <input
                    type="tel"
                    disabled={sameAsPhone}
                    value={sameAsPhone ? customerPhone : customerWhatsapp}
                    onChange={e => setCustomerWhatsapp(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Governorate Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-200 font-readex">
                    المحافظة (لحساب الشحن تلقائياً) *
                  </label>
                  <span className="text-[10px] text-stone-400">
                    مدة التوصيل: {currentGov.delivery_days}
                  </span>
                </div>
                <select
                  value={selectedGovId}
                  onChange={e => setSelectedGovId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {governorates.map(gov => (
                    <option key={gov.id} value={gov.id} className="bg-[#120f17] text-white">
                      {gov.name} — مصاريف الشحن: {gov.fee} ج.م ({gov.delivery_days})
                    </option>
                  ))}
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                  العنوان بالتفصيل *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="اسم الحي/الشارع، رقم العمارة، الطابق، بجوار علامة مميزة..."
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1 font-readex">
                  ملاحظات التوصيل (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الاتصال قبل الوصول بنصف ساعة..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-900/40 bg-[#181420] text-amber-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Invoice Breakdown Summary */}
              <div className="bg-[#181420] rounded-2xl p-4 border border-amber-900/30 space-y-1.5 text-xs font-readex">
                <div className="flex justify-between text-stone-300">
                  <span>سعر الكتب بالصندوق:</span>
                  <span className="font-readex">{subtotal} ج.م</span>
                </div>
                {isBundleApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>خصم باقة مسار القراءة (10%):</span>
                    <span className="font-readex">-{discountAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    مصاريف الشحن ({currentGov.name}):
                  </span>
                  <span className="font-readex">
                    {isFreeShipping ? (
                      <span className="text-amber-400 font-bold">مجاني (تجاوز 600 ج.م)</span>
                    ) : (
                      `${shippingFee} ج.م`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-amber-100 pt-2 border-t border-amber-900/30">
                  <span>المطلوب نقداً عند الاستلام:</span>
                  <span className="text-amber-400 text-base font-readex">{finalTotal} ج.م</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl candle-glow active:scale-98 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الطلب...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد الطلب عبر واتساب ({finalTotal} ج.م)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
