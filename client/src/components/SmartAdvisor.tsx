import React, { useState } from 'react';
import { RecommendationResponse, Book } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Check, Layers, Loader2 } from 'lucide-react';
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

  // Field Options tailored to Sanctuary
  const categories = [
    { id: 'cat_psychology', name: 'علم النفس والتعافي الداخلي', icon: '🧠', topics: ['فهم الذات والقلق', 'تحليل السلوك والشخصيات', 'علم نفس العلاقات', 'التعافي النفسي'] },
    { id: 'cat_literature', name: 'روايات الغموض ومقبرة الكتب', icon: '🏰', topics: ['أسرار مقبرة الكتب المنسية', 'روايات تاريخية وإنسانية', 'أدب الغموض والذاكرة'] },
    { id: 'cat_philosophy', name: 'الفلسفة وعزاءات الفكر', icon: '🧭', topics: ['فلسفة الحياة اليومية', 'تاريخ الفلسفة والأسئلة الوجودية', 'التفكير المنطقي'] },
    { id: 'cat_self_help', name: 'بناء العادات وتطوير الذات', icon: '✨', topics: ['بناء العادات اليومية', 'الإنتاجية وإدارة الوقت', 'المرونة والذكاء العاطفي'] },
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
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-6 text-right">
      {/* Advisor Header Banner - Gothic Sanctuary Style */}
      <div className="bg-gradient-to-br from-[#1c1424] via-[#120f17] to-[#0d0b0f] text-[#ede6d6] rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-amber-900/50 candle-glow relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <span>🗝️</span>
            مستشار حارس مقبرة الكتب المنسية
          </div>
          <h2 className="text-lg sm:text-2xl font-black font-readex text-amber-100 mb-2 leading-tight">
            «لا تضع وقتك في حيرة الاختيار.. أخبر الحارس ليصمم مسار قراءتك»
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed font-readex">
            محرك ترشيح هجين دائم يطابق شغفك ومستواك القرائي مع المخطوطات والكتب الورقية المحفوظة في المقبرة، مع مسار قراءة متدرج من كتابين أو ثلاثة بخصم باقة خاص 10%.
          </p>

          {/* Mode Switcher */}
          <div className="mt-5 inline-flex p-1 bg-black/40 rounded-2xl border border-amber-900/40">
            <button
              onClick={() => { setMode('quiz'); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'quiz'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🗝️ استشارة الـ 3 خطوات (الأكثر دقة)
            </button>
            <button
              onClick={() => { setMode('natural'); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'natural'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              📜 وصف حر كما تحدث حارس المقبرة
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: 3-Step Interactive Quiz */}
      {mode === 'quiz' && !result && (
        <div className="bg-[#15121b] rounded-3xl p-5 sm:p-7 border border-amber-900/40 shadow-xl space-y-6 animate-fade-in">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-900/30">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 text-xs font-black flex items-center justify-center">
                {step}
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-100 font-readex">
                {step === 1 && 'الخطوة 1: اختر أروقة المعرفة التي تود استكشافها'}
                {step === 2 && 'الخطوة 2: ما هو مستوى قراءتك الحالي في هذا الميدان؟'}
                {step === 3 && 'الخطوة 3: حدد الموضوع الفرعي وحجم الكتاب'}
              </span>
            </div>
            <span className="text-xs text-amber-500/80 font-readex">خطوة {step} من 3</span>
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
                        ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/30'
                        : 'border-stone-800 bg-[#181420] hover:border-amber-900'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-black/40 border border-stone-800">{cat.icon}</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-100 font-readex">{cat.name}</h4>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{cat.topics.join(' • ')}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all"
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
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/30'
                      : 'border-stone-800 bg-[#181420] hover:border-amber-900'
                  }`}
                >
                  <span className="text-lg block mb-1">🌱 مبتدئ</span>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-100 mb-1 font-readex">مدخل تأسيسي مبسط</h4>
                  <p className="text-[10px] text-stone-400">لغة سلسة خالية من التعقيد، سريعة الفهم وتطبيقية فوراً.</p>
                </button>

                <button
                  onClick={() => setSelectedLevel('intermediate')}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    selectedLevel === 'intermediate'
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/30'
                      : 'border-stone-800 bg-[#181420] hover:border-amber-900'
                  }`}
                >
                  <span className="text-lg block mb-1">🌿 قارئ متوسط</span>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-100 mb-1 font-readex">فهم أعمق وتطبيقات</h4>
                  <p className="text-[10px] text-stone-400">قرأت بعض العناوين وتريد تشريحاً عملياً وعلمياً معمقاً.</p>
                </button>

                <button
                  onClick={() => setSelectedLevel('advanced')}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    selectedLevel === 'advanced'
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/30'
                      : 'border-stone-800 bg-[#181420] hover:border-amber-900'
                  }`}
                >
                  <span className="text-lg block mb-1">🌳 متعمق وباحث</span>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-100 mb-1 font-readex">أمهات الكتب وأصولها</h4>
                  <p className="text-[10px] text-stone-400">أطروحات عميقة وأعمال تأسيسية أصيلة بدون تبسيط مخل.</p>
                </button>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all"
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
                <label className="text-xs font-bold text-amber-200 block mb-2 font-readex">
                  الموضوع الفرعي الذي ترغب بالتركيز عليه:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentCategoryData.topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-xl text-xs font-bold text-right border transition-all ${
                        selectedTopic === topic
                          ? 'border-amber-500 bg-amber-500 text-stone-950 font-black shadow-sm'
                          : 'border-stone-800 bg-[#181420] text-stone-300 hover:border-amber-900'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-2 font-readex">
                  حجم الكتاب المفضل:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedLength('short')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'short'
                        ? 'border-amber-500 bg-amber-950/50 text-amber-300'
                        : 'border-stone-800 bg-[#181420] text-stone-400'
                    }`}
                  >
                    خفيف (&lt;250 ص)
                  </button>
                  <button
                    onClick={() => setSelectedLength('medium')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'medium'
                        ? 'border-amber-500 bg-amber-950/50 text-amber-300'
                        : 'border-stone-800 bg-[#181420] text-stone-400'
                    }`}
                  >
                    متوسط (250-400 ص)
                  </button>
                  <button
                    onClick={() => setSelectedLength('any')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLength === 'any'
                        ? 'border-amber-500 bg-amber-950/50 text-amber-300'
                        : 'border-stone-800 bg-[#181420] text-stone-400'
                    }`}
                  >
                    أي حجم متوفر
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>
                <button
                  onClick={() => handleRunAdvisor('quiz')}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl candle-glow transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>الحارس يفتش في سجلات المقبرة...</span>
                    </>
                  ) : (
                    <>
                      <span>🗝️ كشف مسار القراءة المخصص</span>
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
        <div className="bg-[#15121b] rounded-3xl p-5 sm:p-7 border border-amber-900/40 shadow-xl space-y-4 animate-fade-in">
          <label className="text-xs sm:text-sm font-bold text-amber-100 block font-readex">
            صف لحارس المقبرة ما تبحث عنه أو المشكلة التي تريد حلاً لها:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={naturalQuery}
              onChange={e => setNaturalQuery(e.target.value)}
              placeholder="مثال: رشح لي كتاب في علم النفس للمبتدئين يفهمني السلوك البشري وعلاقاتي بدون تعقيد أكاديمي..."
              className="w-full p-4 rounded-2xl border border-amber-900/40 bg-[#181420] text-amber-100 text-sm focus:outline-none focus:border-amber-500 resize-none placeholder:text-stone-500"
            />
          </div>

          {/* Quick suggestions chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-stone-400 font-medium">مخطوطات شائعة:</span>
            {[
              'أسرار مقبرة الكتب المنسية وظل الريح',
              'علم نفس للمبتدئين لفهم الذات',
              'عزاءات الفلسفة والتفكير الهادئ',
              'بناء العادات والتخلص من التسويف',
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => setNaturalQuery(prompt)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-black/40 hover:bg-amber-950/50 text-amber-300 border border-stone-800 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleRunAdvisor('natural')}
              disabled={loading || !naturalQuery.trim()}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg candle-glow transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <span>🗝️ استخراج مسار القراءة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Living Cathedral Candle Loader */}
      {loading && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#15111c] border border-amber-500/40 text-center space-y-4 animate-fade-in shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
          
          {/* Animated Cathedral Candle */}
          <div className="relative mx-auto w-16 h-28 flex items-end justify-center">
            {/* Candle Halo */}
            <div className="absolute top-2 w-28 h-28 rounded-full bg-amber-500/20 blur-xl candle-pulse-halo pointer-events-none" />
            
            {/* Wax Body */}
            <div className="w-8 h-16 rounded-t-sm bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF7] to-[#E2D5BE] border border-amber-400/40 shadow-md relative">
              <div className="absolute top-2 left-1 w-1.5 h-6 bg-amber-200/50 rounded-full" />
            </div>

            {/* Wick */}
            <div className="absolute top-7 w-1 h-3 bg-stone-900 rounded-full" />

            {/* Living Dancing Flame */}
            <div className="absolute top-0 w-6 h-9 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 candle-flame-anim shadow-[0_0_20px_#f59e0b,0_0_35px_#ea580c] flex items-center justify-center">
              <div className="w-2 h-4 rounded-full bg-white opacity-80" />
            </div>

            {/* Rising Embers */}
            <div className="absolute -top-3 left-3 w-1.5 h-1.5 rounded-full bg-amber-300 ember-particle" />
            <div className="absolute -top-6 right-2 w-1 h-1 rounded-full bg-amber-400 ember-particle" style={{ animationDelay: '0.7s' }} />
          </div>

          <h4 className="text-base font-bold font-readex text-amber-100">
            حارس المقبرة يضيء ممرات الكتب المنسية...
          </h4>
          <p className="text-xs text-amber-400/80 max-w-sm mx-auto font-readex leading-relaxed">
            نستحضر لك حكمة الأرفف ونستخرج مسار القراءة الأنسب لشغفك ومستواك القرائي.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results View - Gothic Sanctuary Reading Path */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Reset / New Search Action */}
          <div className="flex items-center justify-between bg-[#16131d] p-3 rounded-2xl border border-amber-900/30 text-xs">
            <span className="text-amber-200/90 font-readex">
              💡 {result.intent_summary}
            </span>
            <button
              onClick={() => setResult(null)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500 hover:text-stone-950 border border-amber-500/40"
            >
              استشارة جديدة ↺
            </button>
          </div>

          {/* Primary Recommendation Card */}
          <div className="bg-[#15121b] rounded-3xl p-5 sm:p-7 border-2 border-amber-500 shadow-2xl relative overflow-hidden candle-glow">
            <div className="absolute top-0 left-0 bg-amber-500 text-stone-950 text-[10px] font-black px-4 py-1 rounded-br-2xl flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              الترشيح الأول من حارس المقبرة ({Math.round(result.primary_recommendation.match_score * 100)}% تطابق)
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <div className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-stone-900 shadow-xl shrink-0 mx-auto sm:mx-0 border border-amber-900/40">
                <img
                  src={result.primary_recommendation.cover_image}
                  alt={result.primary_recommendation.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 text-right">
                <div>
                  <h3 className="text-base sm:text-xl font-black font-readex text-amber-100 leading-snug mb-1">
                    {result.primary_recommendation.title}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium leading-normal mb-1">
                    تأليف: {result.primary_recommendation.author}
                  </p>
                </div>

                {/* Why Recommended Callout */}
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5">
                  <span className="text-[11px] font-black text-amber-300 block mb-1">
                    🎯 لماذا اختار لك حارس المقبرة هذا الكتاب؟
                  </span>
                  <p className="text-xs text-stone-200 leading-relaxed font-readex">
                    {result.primary_recommendation.why_recommended}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <span className="text-[10px] font-bold text-amber-400/80 block mb-1.5 font-readex">
                    ✦ أبرز ما ستخرج به من هذه المخطوطة:
                  </span>
                  <ul className="space-y-1">
                    {result.primary_recommendation.key_takeaways.map((point, i) => (
                      <li key={i} className="text-xs text-stone-300 flex items-center gap-1.5 font-readex">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action for Book 1 */}
                <div className="pt-2 flex items-center justify-between border-t border-amber-900/30">
                  <span className="text-base font-bold text-amber-400">
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
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-bold border border-amber-900/40 transition-colors"
                  >
                    تبنّ هذا الكتاب منفرداً
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Reading Path Section */}
          {result.reading_path_steps && result.reading_path_steps.length > 1 && (
            <div className="bg-[#15121b] rounded-3xl p-5 sm:p-7 border border-amber-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-900/30">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold font-readex text-amber-100">
                      {result.reading_path_title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-readex">
                    مسار قراءة متدرج من {result.reading_path_steps.length} كتب مصممة لتنقلك خطوة بخطوة
                  </p>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  خصم الباقة: {result.bundle_discount_percent}% عند طلب المسار كاملاً
                </span>
              </div>

              {/* Steps Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.reading_path_steps.map((stepItem) => (
                  <div
                    key={stepItem.book_id}
                    className="bg-[#181420] rounded-2xl p-3 border border-amber-900/40 flex items-center gap-3"
                  >
                    <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-amber-900/40">
                      <img
                        src={stepItem.cover_image}
                        alt={stepItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-amber-400 block mb-0.5">
                        {stepItem.step_label}
                      </span>
                      <h4 className="text-xs font-bold text-amber-100 truncate font-readex leading-snug mb-0.5">
                        {stepItem.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate mb-1 leading-normal">
                        {stepItem.author}
                      </p>
                      <span className="text-xs font-bold text-amber-400">
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
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl candle-glow transition-all ${
                    bundleAdded
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 active:scale-98'
                  }`}
                >
                  {bundleAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت إضافة مسار القراءة كاملاً لصندوقك بخصم {result.bundle_discount_percent}%!</span>
                    </>
                  ) : (
                    <>
                      <span>🗝️ أضف المسار الكامل لصندوقك بخصم الباقة ({result.bundle_discount_percent}%)</span>
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
