import React, { useState, useEffect } from 'react';
import { BookManager } from './BookManager';
import { OrderManager } from './OrderManager';
import { ShippingManager } from './ShippingManager';
import { BookOpen, ShoppingBag, Truck, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'orders' | 'shipping' | 'analytics'>('books');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data);
      })
      .catch(e => console.error(e));
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-black text-stone-900">لوحة تحكم المتجر والمخزون</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            إدارة الكتب، إضافة العناوين بضغطة زر عبر Google Books، متابعة الطلبات والواتساب
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'books'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الكتب والمخزون</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>طلبات الشراء</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'shipping'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>أسعار الشحن</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>التحليلات والمستشار</span>
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'books' && <BookManager />}
      {activeTab === 'orders' && <OrderManager />}
      {activeTab === 'shipping' && <ShippingManager />}

      {/* Analytics & Search Insights Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">إجمالي المبيعات المؤكدة</span>
              <span className="text-xl sm:text-2xl font-black text-brand-700">
                {analytics?.totalRevenue || 0} <span className="text-xs font-normal text-stone-500">ج.م</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">عدد الطلبات المسجلة</span>
              <span className="text-xl sm:text-2xl font-black text-stone-900">
                {analytics?.totalOrders || 0} <span className="text-xs font-normal text-stone-500">طلب</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">تنبيهات المخزون المنخفض</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {analytics?.lowStockBooks?.length || 0} كتب
              </span>
            </div>
          </div>

          {/* Search & Recommendation Content Gap Insights */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-right space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-stone-100">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  تحليلات طلبات مستشار القراءة (Content Gap Analytics)
                </h3>
                <p className="text-xs text-stone-500">
                  سجل الاستفسارات والمجالات التي يسأل عنها العملاء لتحديد الكتب التي تحتاج لتوفيرها
                </p>
              </div>
            </div>

            {analytics?.recentQueries && analytics.recentQueries.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentQueries.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-stone-800 truncate max-w-md">
                      {log.query_or_quiz.startsWith('{') ? 'اختبار متدرج: ' + log.query_or_quiz : log.query_or_quiz}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {new Date(log.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-6 text-center">
                لم يتم تسجيل استفسارات جديدة بعد. ستظهر هنا فور تفاعل العملاء مع مستشار الكتب!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
