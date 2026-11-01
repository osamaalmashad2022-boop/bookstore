import React, { useState, useEffect } from 'react';
import { Governorate } from '../../types';
import { Truck, Check } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

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
      const res = await adminFetch(`/api/admin/shipping-rates/${gov.id}`, {
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
    <div className="bg-[#15121b] rounded-2xl border border-amber-900/40 p-4 sm:p-6 space-y-4 text-right">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-readex text-amber-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            إدارة أسعار الشحن لمحافظات مصر
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            تحديث تكلفة التوصيل ومدة الشحن التي تظهر للعميل في شاشة الدفع
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-stone-500 text-xs">جاري تحميل الأسعار...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {governorates.map(gov => (
            <div
              key={gov.id}
              className="p-3.5 rounded-xl border border-amber-900/30 bg-[#181420] flex items-center justify-between gap-3 text-right"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-amber-100 block truncate font-readex">{gov.name}</span>
                <input
                  type="text"
                  value={gov.delivery_days}
                  onChange={e => {
                    const val = e.target.value;
                    setGovernorates(prev => prev.map(g => g.id === gov.id ? { ...g, delivery_days: val } : g));
                  }}
                  className="text-[11px] text-stone-400 bg-transparent border-b border-stone-800 focus:outline-none focus:border-amber-500 mt-1 w-full"
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
                    className="w-16 px-2 py-1 text-xs font-bold border border-amber-900/40 rounded-lg text-center bg-[#120f17] text-amber-300 font-readex"
                  />
                  <span className="text-xs text-stone-400">ج.م</span>
                </div>

                <button
                  onClick={() => handleUpdate(gov)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    savingId === gov.id
                      ? 'bg-amber-400 text-stone-950 font-black'
                      : 'bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40'
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
