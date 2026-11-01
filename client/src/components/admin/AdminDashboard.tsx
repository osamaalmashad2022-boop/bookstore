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
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-5 text-right">
      {/* Top Admin Header - Gothic Sanctuary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#15121b] p-4 sm:p-5 rounded-2xl border border-amber-900/40 shadow-lg">
        <div>
          <h2 className="text-base sm:text-xl font-black font-readex text-amber-100 flex items-center gap-2">
            <span>🕯️</span>
            سجل حارس مقبرة الكتب وإدارة المخزون
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            إدارة المخطوطات، جلب البيانات بضغطة زر عبر Google Books، ومتابعة الطلبات وتأكيد واتساب
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'books'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-[#1e1927] text-stone-300 border border-stone-800 hover:border-amber-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الكتب والمخزون</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-[#1e1927] text-stone-300 border border-stone-800 hover:border-amber-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>طلبات الشراء</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'shipping'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-[#1e1927] text-stone-300 border border-stone-800 hover:border-amber-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>أسعار الشحن</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-[#1e1927] text-stone-300 border border-stone-800 hover:border-amber-900'
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
            <div className="bg-[#15121b] p-4 rounded-2xl border border-amber-900/40 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">إجمالي المبيعات المؤكدة</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-readex">
                {analytics?.totalRevenue || 0} <span className="text-xs font-normal text-stone-400 font-readex">ج.م</span>
              </span>
            </div>

            <div className="bg-[#15121b] p-4 rounded-2xl border border-amber-900/40 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">عدد الطلبات المسجلة</span>
              <span className="text-xl sm:text-2xl font-black text-amber-100 font-readex">
                {analytics?.totalOrders || 0} <span className="text-xs font-normal text-stone-400 font-readex">طلب</span>
              </span>
            </div>

            <div className="bg-[#15121b] p-4 rounded-2xl border border-amber-900/40 shadow-xs text-right">
              <span className="text-[11px] text-stone-400 block mb-1">تنبيهات المخزون المنخفض</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1.5 font-readex">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                {analytics?.lowStockBooks?.length || 0} كتب
              </span>
            </div>
          </div>

          {/* Search & Recommendation Content Gap Insights */}
          <div className="bg-[#15121b] p-5 rounded-2xl border border-amber-900/40 shadow-xs text-right space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-amber-900/30">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-100 font-readex">
                  تحليلات طلبات المستشار الذكي (Content Gap Analytics)
                </h3>
                <p className="text-xs text-stone-400">
                  سجل الاستفسارات والموضوعات التي يسأل عنها زوار المقبرة لتوفير الكتب المطلوبة
                </p>
              </div>
            </div>

            {analytics?.recentQueries && analytics.recentQueries.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentQueries.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#181420] border border-amber-900/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-amber-200 truncate max-w-md font-readex">
                      {log.query_or_quiz.startsWith('{') ? 'استشارة متدرجة: ' + log.query_or_quiz : log.query_or_quiz}
                    </span>
                    <span className="text-[10px] text-stone-500 font-readex">
                      {new Date(log.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">
                لم يتم تسجيل استفسارات جديدة بعد. ستظهر هنا فور تفاعل القراء مع مستشار المقبرة!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
