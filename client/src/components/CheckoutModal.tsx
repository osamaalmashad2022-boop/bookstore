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

      // Open WhatsApp link immediately in new tab
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              {orderSuccess ? 'تم تسجيل طلبك بنجاح!' : 'إتمام الطلب - الدفع عند الاستلام (COD)'}
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form / Success Screen */}
        <div className="overflow-y-auto p-5">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-stone-900">تم تسجيل طلبك بنجاح!</h4>
                <p className="text-xs text-stone-500 mt-1">
                  رقم مرجع الطلب: <strong className="text-brand-700 text-sm">{orderSuccess.orderRef}</strong>
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-right space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">طريقة الدفع:</span>
                  <span className="font-bold text-stone-800">نقداً عند الاستلام (COD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">مصاريف الشحن:</span>
                  <span className="font-bold text-stone-800">{orderSuccess.shippingFee} ج.م</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-stone-200 pt-2 text-stone-900">
                  <span>المبلغ المطلوب عند الاستلام:</span>
                  <span className="text-brand-700">{orderSuccess.finalTotal} ج.م</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                لقد فتحنا محادثة الواتساب مع إدارة المتجر لإرسال الفاتورة تلقائياً. إذا لم تفتح نافذة الواتساب، اضغط على الزر الأخضر أدناه:
              </p>

              <a
                href={orderSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>تأكيد الفاتورة على واتساب المتجر 💬</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد محمود"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    رقم الهاتف للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      رقم الواتساب
                    </label>
                    <button
                      type="button"
                      onClick={() => setSameAsPhone(!sameAsPhone)}
                      className="text-[10px] text-brand-600 font-semibold"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm disabled:bg-stone-50 disabled:text-stone-400 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Governorate Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">
                    المحافظة (لحساب الشحن تلقائياً) *
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">
                    مدة التوصيل: {currentGov.delivery_days}
                  </span>
                </div>
                <select
                  value={selectedGovId}
                  onChange={e => setSelectedGovId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {governorates.map(gov => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name} — مصاريف الشحن: {gov.fee} ج.م ({gov.delivery_days})
                    </option>
                  ))}
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  العنوان بالتفصيل *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="اسم الحي/الشارع، رقم العمارة، الطابق، بجوار علامة مميزة..."
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ملاحظات التوصيل (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الاتصال قبل الوصول بنصف ساعة، الاستلام بعد الساعة 3 ظهراً..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Invoice Breakdown Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>سعر الكتب المطلوبة:</span>
                  <span>{subtotal} ج.م</span>
                </div>
                {isBundleApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>خصم باقة مسار القراءة (10%):</span>
                    <span>-{discountAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-600" />
                    مصاريف الشحن ({currentGov.name}):
                  </span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-bold">مجاني (تجاوز 600 ج.م)</span>
                    ) : (
                      `${shippingFee} ج.م`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>المطلوب نقداً عند الاستلام:</span>
                  <span className="text-brand-700 text-base">{finalTotal} ج.م</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-stone-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-98 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري حفظ الطلب...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 text-emerald-300" />
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
