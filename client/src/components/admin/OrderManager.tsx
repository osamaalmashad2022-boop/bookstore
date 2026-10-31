import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { MessageCircle, Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/orders')
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
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
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
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> بانتظار تأكيد واتساب</span>;
      case 'CONFIRMED_WHATSAPP':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مؤكد عبر واتساب</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1"><Package className="w-3 h-3" /> تم الشحن للمندوب</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">تم التسليم بنجاح</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ملغي</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === filter.key
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-xs">جاري تحميل الطلبات...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-xs">
          لا توجد طلبات تطابق هذا التصنيف حالياً.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const customerPhoneClean = (order.customer_whatsapp || order.customer_phone).replace(/\D/g, '');
            const waNumber = customerPhoneClean.startsWith('01') ? '2' + customerPhoneClean : customerPhoneClean;

            return (
              <div
                key={order.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3 text-right"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-brand-700">#{order.order_ref}</span>
                    <span className="text-xs text-stone-400 font-medium">
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
                    <span className="text-stone-400 block mb-0.5">العميل والهاتف:</span>
                    <p className="font-bold text-stone-900">{order.customer_name}</p>
                    <p className="text-stone-600 font-medium">{order.customer_phone}</p>
                  </div>

                  <div>
                    <span className="text-stone-400 block mb-0.5">عنوان التوصيل:</span>
                    <p className="font-bold text-stone-900">
                      محافظة {order.governorate_name || 'مصر'}
                    </p>
                    <p className="text-stone-600 truncate">{order.street_address}</p>
                    {order.notes && (
                      <p className="text-stone-400 italic text-[11px]">ملاحظات: {order.notes}</p>
                    )}
                  </div>
                </div>

                {/* Items Ordered List */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-stone-50 rounded-xl p-2.5 space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold block mb-1">الكتب المطلوبة:</span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-700">
                        <span>• {item.title} ({item.quantity} × {item.price} ج.م)</span>
                        <span className="font-bold">{item.quantity * item.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-500">الإجمالي عند الاستلام (COD):</span>
                    <span className="text-base font-black text-stone-900">{order.final_total} ج.م</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click Customer WhatsApp */}
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`أهلاً بك أستاذ ${order.customer_name}، نتواصل معك بخصوص طلبك #${order.order_ref} من متجر دار المعرفة للكتب.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب العميل</span>
                    </a>

                    {/* Status Changer */}
                    <select
                      value={order.status}
                      onChange={e => handleUpdateStatus(order.id, e.target.value)}
                      className="text-xs font-bold border border-stone-200 rounded-xl px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none"
                    >
                      <option value="PENDING_WHATSAPP_CONFIRMATION">بانتظار التأكيد</option>
                      <option value="CONFIRMED_WHATSAPP">تأكيد الطلب</option>
                      <option value="SHIPPED">تم الشحن</option>
                      <option value="DELIVERED">تم التسليم</option>
                      <option value="CANCELLED">إلغاء الطلب</option>
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
