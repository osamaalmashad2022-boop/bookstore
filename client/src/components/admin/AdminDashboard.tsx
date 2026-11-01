import React, { useState, useEffect } from 'react';
import { BookManager } from './BookManager';
import { OrderManager } from './OrderManager';
import { ShippingManager } from './ShippingManager';
import {
  BookOpen,
  ShoppingBag,
  Truck,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  isAdminAuthenticated,
  setAdminToken,
  clearAdminToken,
  adminFetch,
} from '../../utils/adminApi';

interface AdminDashboardProps {
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'books' | 'orders' | 'shipping' | 'analytics'>('books');
  const [analytics, setAnalytics] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError(data.error || 'مفتاح الحارس غير صحيح');
      }
    } catch (err) {
      setLoginError('تعذر التحقق من المفتاح، يرجى التأكد من تشغيل الخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    adminFetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data);
      })
      .catch(e => console.error(e));
  }, [activeTab, isAuthenticated]);

  // ----------------------------------------------------
  // GOTHIC SECURITY GATE (If not authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-right animate-fade-in">
        <div className="bg-[#15121b] border border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle atmospheric glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon and Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1e1927] border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-black font-readex text-amber-100">
              بوابة حارس مقبرة الكتب
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed font-readex">
              منطقة الإدارة مخصصة لصاحب المتجر فقط للتحكم في المخزون والطلبات وأسعار الشحن.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-300/90 mb-1.5 font-readex">
                مفتاح الحارس السري (كلمة المرور)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="أدخل المفتاح السري..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-[#0d0b0f] border border-amber-900/50 focus:border-amber-400 text-amber-100 placeholder-stone-600 text-sm outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 font-readex animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !passwordInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-stone-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 active:scale-98 disabled:opacity-50 transition-all font-readex"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'فتح السجل وإلغاء القفل'}</span>
            </button>
          </form>

          {/* Return to Public Store */}
          {onClose && (
            <div className="pt-2 border-t border-amber-900/30 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-400 hover:text-amber-300 font-readex inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة إلى رفوف الكتب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // UNLOCKED ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-5 text-right animate-fade-in">
      {/* Top Admin Header - Gothic Sanctuary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#15121b] p-4 sm:p-5 rounded-2xl border border-amber-900/40 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-xl font-black font-readex text-amber-100">
              سجل حارس مقبرة الكتب وإدارة المخزون
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              جلسة مؤمنة
            </span>
          </div>
          <p className="text-xs text-stone-400">
            إدارة المخطوطات، جلب البيانات بضغطة زر عبر Google Books، ومتابعة الطلبات وتأكيد واتساب
          </p>
        </div>

        {/* Top Actions: Lock/Logout + Back to Store */}
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1e1927] hover:bg-stone-900 text-stone-300 border border-stone-800 flex items-center gap-1.5 transition-colors font-readex"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الكتالوج</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            title="قفل السجل وتسجيل الخروج"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 flex items-center gap-1.5 transition-all font-readex"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>قفل السجل</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-readex ${
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-readex ${
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-readex ${
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-readex ${
            activeTab === 'analytics'
              ? 'bg-amber-500 text-stone-950 font-black shadow-md'
              : 'bg-[#1e1927] text-stone-300 border border-stone-800 hover:border-amber-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>التحليلات والمستشار</span>
        </button>
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
