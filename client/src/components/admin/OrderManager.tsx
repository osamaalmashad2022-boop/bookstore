import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { MessageCircle, Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = () => {
    setLoading(true);
    adminFetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_WHATSAPP_CONFIRMATION':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> بانتظار تأكيد واتساب</span>;
      case 'CONFIRMED_WHATSAPP':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مؤكد عبر واتساب</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30 flex items-center gap-1"><Package className="w-3 h-3" /> تم الشحن للمندوب</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1">تم التسليم بنجاح</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ملغي</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-4 text-right">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'ALL', label: 'كافة الطلبات' },
          { key: 'PENDING_WHATSAPP_CONFIRMATION', label: 'بانتظار التأكيد' },
          { key: 'CONFIRMED_WHATSAPP', label: 'مؤكد واتساب' },
          { key: 'SHIPPED', label: 'تم الشحن' },
          { key: 'DELIVERED', label: 'تم التسليم' },
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              statusFilter === filter.key
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'bg-[#15121b] text-stone-400 border border-stone-800 hover:border-amber-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-500 text-xs">جاري تحميل الطلبات...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#15121b] p-8 rounded-2xl border border-amber-900/30 text-center text-stone-500 text-xs font-readex">
          لا توجد طلبات تطابق هذا التصنيف في سجلات المقبرة.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const customerPhoneClean = (order.customer_whatsapp || order.customer_phone).replace(/\D/g, '');
            const waNumber = customerPhoneClean.startsWith('01') ? '2' + customerPhoneClean : customerPhoneClean;

            return (
              <div
                key={order.id}
                className="bg-[#15121b] p-4 rounded-2xl border border-amber-900/40 shadow-md space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-400 font-readex">#{order.order_ref}</span>
                    <span className="text-xs text-stone-500 font-readex">
                      {new Date(order.created_at).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block mb-0.5">العميل والهاتف:</span>
                    <p className="font-bold text-amber-100 font-readex">{order.customer_name}</p>
                    <p className="text-stone-400 font-readex">{order.customer_phone}</p>
                  </div>

                  <div>
                    <span className="text-stone-500 block mb-0.5">عنوان التوصيل:</span>
                    <p className="font-bold text-amber-200">
                      محافظة {order.governorate_name || 'مصر'}
                    </p>
                    <p className="text-stone-400 truncate">{order.street_address}</p>
                    {order.notes && (
                      <p className="text-stone-500 italic text-[11px]">ملاحظات: {order.notes}</p>
                    )}
                  </div>
                </div>

                {/* Items Ordered List */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-[#181420] rounded-xl p-2.5 space-y-1 border border-stone-800">
                    <span className="text-[10px] text-amber-400/80 font-bold block mb-1">الكتب المطلوبة:</span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-300">
                        <span>• {item.title} ({item.quantity} × {item.price} ج.م)</span>
                        <span className="font-bold font-readex text-amber-300">{item.quantity * item.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-900/30">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-400">الإجمالي عند الاستلام (COD):</span>
                    <span className="text-base font-black text-amber-400 font-readex">{order.final_total} ج.م</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click Customer WhatsApp */}
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`أهلاً بك أستاذ ${order.customer_name}، نتواصل معك بخصوص طلبك #${order.order_ref} من متجر مقبرة الكتب المنسية.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب العميل</span>
                    </a>

                    {/* Status Changer */}
                    <select
                      value={order.status}
                      onChange={e => handleUpdateStatus(order.id, e.target.value)}
                      className="text-xs font-bold border border-amber-900/40 rounded-xl px-2.5 py-1.5 bg-[#181420] text-amber-200 focus:outline-none"
                    >
                      <option value="PENDING_WHATSAPP_CONFIRMATION" className="bg-[#120f17]">بانتظار التأكيد</option>
                      <option value="CONFIRMED_WHATSAPP" className="bg-[#120f17]">تأكيد الطلب</option>
                      <option value="SHIPPED" className="bg-[#120f17]">تم الشحن</option>
                      <option value="DELIVERED" className="bg-[#120f17]">تم التسليم</option>
                      <option value="CANCELLED" className="bg-[#120f17]">إلغاء الطلب</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
