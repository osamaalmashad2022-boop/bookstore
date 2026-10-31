import React, { useState } from 'react';
import { RecommendationResponse, Book } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Check, Layers, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface SmartAdvisorProps {
  onSelectBook?: (book: Book) => void;
}

export const SmartAdvisor: React.FC<SmartAdvisorProps> = () => {
  const { addBundleToCart, addToCart } = useCart();
  const [mode, setMode] = useState<'quiz' | 'natural'>('quiz');

  // Quiz State
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_psychology');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string>('فهم الذات والقلق');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long' | 'any'>('short');

  // Natural Language State
  const [naturalQuery, setNaturalQuery] = useState<string>('');

  // Results State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bundleAdded, setBundleAdded] = useState(false);

  // Field Options
  const categories = [
    { id: 'cat_psychology', name: 'علم النفس والصحة النفسية', icon: '🧠', topics: ['فهم الذات والقلق', 'تحليل السلوك والشخصيات', 'علم نفس العلاقات', 'التعافي النفسي'] },
    { id: 'cat_self_help', name: 'تطوير الذات وبناء العادات', icon: '✨', topics: ['بناء العادات اليومية', 'الإنتاجية وإدارة الوقت', 'المرونة والذكاء العاطفي'] },
    { id: 'cat_philosophy', name: 'الفلسفة والتفكير النقدي', icon: '🧭', topics: ['فلسفة الحياة اليومية', 'تاريخ الفلسفة والأسئلة الوجودية', 'التفكير المنطقي'] },
    { id: 'cat_literature', name: 'الروايات والأدب الرفيع', icon: '📖', topics: ['روايات تاريخية وإنسانية', 'الأدب العربي الكلاسيكي', 'أدب الرحلات'] },
  ];

  const currentCategoryData = categories.find(c => c.id === selectedCategory) || categories[0];

  const handleRunAdvisor = async (requestMode: 'quiz' | 'natural') => {
    setLoading(true);
    setError(null);
    setBundleAdded(false);

    try {
      const payload = requestMode === 'quiz' ? {
        mode: 'quiz',
        quiz: {
          category_id: selectedCategory,
          reader_level: selectedLevel,
          sub_topic: selectedTopic,
          preferred_length: selectedLength,
        }
      } : {
        mode: 'natural',
        query: naturalQuery,
      };

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل جلب الترشيحات');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إعداد الترشيحات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = () => {
    if (!result || !result.reading_path_steps) return;
    const booksToAdd: Book[] = result.reading_path_steps.map(step => ({
      id: step.book_id,
      slug: step.slug,
      title: step.title,
      author: step.author,
      price: step.price,
      cover_image: step.cover_image,
      stock_quantity: 10,
      category_id: 'cat_psychology',
      sub_topics: '',
      reader_level: 'beginner',
      page_count: 200,
      reading_time_hours: 4,
      why_read: '',
      is_bestseller: 0,
      is_featured: 0,
    }));

    addBundleToCart(booksToAdd);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Advisor Header Banner */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-amber-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-brand-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            مستشار الكتب الذكي (Smart Book Advisor)
          </div>
          <h2 className="text-xl sm:text-3xl font-black mb-2 leading-tight">
            لا تضيع وقتك في حيرة الاختيار.. سنصمم لك مسار قراءتك
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            محرك ترشيح ذكي دائم يطابق اهتمامك ومستواك القرائي مع مخزون كتبنا الورقية فوراً، مع مسار قراءة متدرج من 2 إلى 3 كتب وخصم باقة خاص.
          </p>

          {/* Mode Switcher */}
          <div className="mt-5 inline-flex p-1 bg-black/30 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => { setMode('quiz'); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'quiz'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🎯 اختبار الـ 3 خطوات (الأكثر دقة)
            </button>
            <button
              onClick={() => { setMode('natural'); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'natural'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              💬 وصف حر باللغة العربية
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: 3-Step Interactive Quiz */}
      {mode === 'quiz' && !result && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-sm space-y-6 animate-fade-in">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                {step}
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-900">
                {step === 1 && 'الخطوة 1: اختر المجال الذي يثير فضولك'}
                {step === 2 && 'الخطوة 2: ما هو مستواك الحالي في هذا المجال؟'}
                {step === 3 && 'الخطوة 3: حدد هدفك ونوع الكتاب المفضل'}
              </span>
            </div>
            <span className="text-xs text-stone-400 font-medium">خطوة {step} من 3</span>
          </div>

          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedTopic(cat.topics[0]);
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3.5 ${
                      selectedCategory === cat.id
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs">{cat.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{cat.name}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{cat.topics.join(' • ')}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                >
                  <span>التالي: تحديد المستوى</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reading Level Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedLevel('beginner')}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    selectedLevel === 'beginner'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-lg block mb-1">🌱 مبتدئ</span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 mb-1">مدخل تأسيسي مبسط</h4>
                  <p className="text-[11px] text-stone-500">لغة سلسة وسهلة، خالية من المصطلحات المعقدة، تطبيقية وسريعة الفهم.</p>
                </button>

                <button
                  onClick={() => setSelectedLevel('intermediate')}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    selectedLevel === 'intermediate'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-lg block mb-1">🌿 قارئ متوسط</span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 mb-1">فهم أعمق وتطبيقات</h4>
                  <p className="text-[11px] text-stone-500">قرأت بعض الكتب وتريد تشريحاً علمياً وعملياً للشخصيات والنظريات.</p>
                </button>

                <button
                  onClick={() => setSelectedLevel('advanced')}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    selectedLevel === 'advanced'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-lg block mb-1">🌳 متعمق وباحث</span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 mb-1">أمهات الكتب وأصولها</h4>
                  <p className="text-[11px] text-stone-500">أطروحات عميقة وأعمال تأسيسية لكبار المفكرين بدون تبسيط مخل.</p>
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                >
                  <span>التالي: تحديد الهدف</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sub-topic & Length */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">
                  الموضوع الفرعي أو المشكلة التي تريد حلها:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentCategoryData.topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-xl text-xs font-bold text-right border transition-all ${
                        selectedTopic === topic
                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">
                  حجم الكتاب المفضل:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedLength('short')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'short'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    سريع وخفيف (&lt;250 صفحة)
                  </button>
                  <button
                    onClick={() => setSelectedLength('medium')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'medium'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    متوسط (250-400 صفحة)
                  </button>
                  <button
                    onClick={() => setSelectedLength('any')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'any'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    أي حجم متوفر
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>
                <button
                  onClick={() => handleRunAdvisor('quiz')}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري مطابقة الكتب...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>عرض مسار القراءة المخصص</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Natural Language Arabic Search */}
      {mode === 'natural' && !result && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-sm space-y-4 animate-fade-in">
          <label className="text-xs sm:text-sm font-bold text-stone-900 block">
            اكتب استفسارك بحرية كما لو كنت تتحدث مع بائع الكتب في المتجر:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={naturalQuery}
              onChange={e => setNaturalQuery(e.target.value)}
              placeholder="مثال: رشح لي كتاب في علم النفس للمبتدئين يفهمني السلوك البشري وعلاقاتي بدون تعقيد أكاديمي..."
              className="w-full p-4 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
          </div>

          {/* Quick suggestions chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-400 font-medium">نماذج سريعة:</span>
            {[
              'كتب علم نفس للمبتدئين',
              'بناء العادات والتخلص من التسويف',
              'مدخل مبسط للفلسفة وعزاءاتها',
              'رواية إنسانية عن الذاكرة والهوية',
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => setNaturalQuery(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleRunAdvisor('natural')}
              disabled={loading || !naturalQuery.trim()}
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحليل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>البحث الذكي وتوليد المسار</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Reset / New Search Action */}
          <div className="flex items-center justify-between bg-stone-100 p-3 rounded-2xl text-xs">
            <span className="text-stone-600 font-medium">
              💡 {result.intent_summary}
            </span>
            <button
              onClick={() => setResult(null)}
              className="px-3 py-1.5 rounded-xl bg-white text-brand-700 font-bold hover:bg-stone-50 border border-stone-200 shadow-xs"
            >
              بحث جديد ↺
            </button>
          </div>

          {/* Primary Recommendation Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-brand-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-brand-600 text-white text-[11px] font-black px-4 py-1 rounded-br-2xl flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              الترشيح الأول الأنسب لك ({Math.round(result.primary_recommendation.match_score * 100)}% تطابق)
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <div className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-md shrink-0 mx-auto sm:mx-0">
                <img
                  src={result.primary_recommendation.cover_image}
                  alt={result.primary_recommendation.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 text-right">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    {result.primary_recommendation.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    تأليف: {result.primary_recommendation.author}
                  </p>
                </div>

                {/* Why Recommended Callout */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5">
                  <span className="text-[11px] font-black text-amber-800 block mb-1">
                    🎯 لماذا نرشح لك هذا الكتاب بالتحديد؟
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed">
                    {result.primary_recommendation.why_recommended}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                    ✨ أبرز ما ستخرج به من هذا الكتاب:
                  </span>
                  <ul className="space-y-1">
                    {result.primary_recommendation.key_takeaways.map((point, i) => (
                      <li key={i} className="text-xs text-stone-700 flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action for Book 1 */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <span className="text-lg font-bold text-stone-900">
                    {result.primary_recommendation.price} ج.م
                  </span>
                  <button
                    onClick={() => {
                      addToCart({
                        id: result.primary_recommendation.book_id,
                        slug: result.primary_recommendation.slug,
                        title: result.primary_recommendation.title,
                        author: result.primary_recommendation.author,
                        price: result.primary_recommendation.price,
                        cover_image: result.primary_recommendation.cover_image,
                        stock_quantity: 10,
                        category_id: 'cat_psychology',
                        sub_topics: '',
                        reader_level: 'beginner',
                        page_count: result.primary_recommendation.page_count,
                        reading_time_hours: result.primary_recommendation.reading_time_hours,
                        why_read: result.primary_recommendation.why_recommended,
                        is_bestseller: 0,
                        is_featured: 0,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    أضف هذا الكتاب منفرداً
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Reading Path Section */}
          {result.reading_path_steps && result.reading_path_steps.length > 1 && (
            <div className="bg-stone-50 rounded-3xl p-5 sm:p-7 border border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base sm:text-lg font-bold text-stone-900">
                      {result.reading_path_title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تدرج معرفي منظم ومدروس من {result.reading_path_steps.length} كتب لضمان الاستيعاب الكامل
                  </p>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  خصم الباقة: {result.bundle_discount_percent}% عند طلب المسار كاملاً
                </span>
              </div>

              {/* Steps Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.reading_path_steps.map((stepItem) => (
                  <div
                    key={stepItem.book_id}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs flex items-center gap-3 relative"
                  >
                    <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={stepItem.cover_image}
                        alt={stepItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-brand-600 block mb-0.5">
                        {stepItem.step_label}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {stepItem.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mb-1">
                        {stepItem.author}
                      </p>
                      <span className="text-xs font-bold text-stone-800">
                        {stepItem.price} ج.م
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1-Click Add Full Reading Path to Cart with Bundle Discount */}
              <div className="pt-3">
                <button
                  onClick={handleAddBundle}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                    bundleAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-98'
                  }`}
                >
                  {bundleAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت إضافة مسار القراءة كاملاً بخصم الباقة (10%)!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>
                        أضف المسار الكامل للسلة بخصم الباقة ({result.bundle_discount_percent}%)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
