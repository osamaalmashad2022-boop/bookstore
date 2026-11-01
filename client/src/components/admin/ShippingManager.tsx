import React, { useState, useEffect } from 'react';
import { Governorate } from '../../types';
import { Truck, Check } from 'lucide-react';

export const ShippingManager: React.FC = () => {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchRates = () => {
    setLoading(true);
    fetch('/api/books/shipping-governorates')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.governorates) setGovernorates(data.governorates);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdate = async (gov: Governorate) => {
    setSavingId(gov.id);
    try {
      const res = await fetch(`/api/admin/shipping-rates/${gov.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee: gov.fee,
          delivery_days: gov.delivery_days,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => setSavingId(null), 800);
      }
    } catch (e) {
      console.error(e);
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            إدارة أسعار الشحن للمحافظات المصرية
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            تحديث تكلفة التوصيل ومدة الشحن التي تظهر للعميل في شاشة الدفع
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-stone-400 text-xs">جاري تحميل الأسعار...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {governorates.map(gov => (
            <div
              key={gov.id}
              className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-3 text-right"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-stone-900 block truncate">{gov.name}</span>
                <input
                  type="text"
                  value={gov.delivery_days}
                  onChange={e => {
                    const val = e.target.value;
                    setGovernorates(prev => prev.map(g => g.id === gov.id ? { ...g, delivery_days: val } : g));
                  }}
                  className="text-[11px] text-stone-500 bg-transparent border-b border-stone-200 focus:outline-none focus:border-brand-500 mt-1 w-full"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={gov.fee}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setGovernorates(prev => prev.map(g => g.id === gov.id ? { ...g, fee: val } : g));
                    }}
                    className="w-16 px-2 py-1 text-xs font-bold border border-stone-200 rounded-lg text-center bg-white"
                  />
                  <span className="text-xs text-stone-500">ج.م</span>
                </div>

                <button
                  onClick={() => handleUpdate(gov)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    savingId === gov.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                  }`}
                >
                  {savingId === gov.id ? <Check className="w-3.5 h-3.5" /> : 'حفظ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

