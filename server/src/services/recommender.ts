import { queryAll, queryOne, execute } from '../db/database';

export interface QuizInput {
  category_id?: string;
  reader_level?: 'beginner' | 'intermediate' | 'advanced';
  sub_topic?: string;
  preferred_length?: 'short' | 'medium' | 'long' | 'any';
}

export interface RecommendRequest {
  mode: 'quiz' | 'natural';
  quiz?: QuizInput;
  query?: string;
}

export interface RecommendationResult {
  intent_summary: string;
  reading_path_title: string;
  bundle_discount_percent: number;
  primary_recommendation: {
    book_id: string;
    slug: string;
    title: string;
    author: string;
    price: number;
    original_price?: number;
    cover_image: string;
    reader_level: string;
    page_count: number;
    reading_time_hours: number;
    match_score: number;
    why_recommended: string;
    key_takeaways: string[];
    in_stock: boolean;
  };
  reading_path_steps: Array<{
    step_number: number;
    step_label: string;
    book_id: string;
    slug: string;
    title: string;
    author: string;
    price: number;
    cover_image: string;
  }>;
  engine_mode: string;
}

// In-memory cache for ultra-fast repeated recommendations
const memoryCache = new Map<string, { result: RecommendationResult; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getSmartRecommendation(req: RecommendRequest): Promise<RecommendationResult> {
  const cacheKey = JSON.stringify(req);
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // 1. Fetch all in-stock books
  const allBooks = await queryAll(`
    SELECT b.*, c.name as category_name, c.slug as category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.stock_quantity > 0
  `);

  if (!allBooks || allBooks.length === 0) {
    throw new Error('لا توجد كتب متوفرة حالياً في المخزون.');
  }

  let matchedBooks: any[] = [];
  let intentSummary = '';
  let pathTitle = '';

  if (req.mode === 'quiz' && req.quiz) {
    const { category_id, reader_level, sub_topic, preferred_length } = req.quiz;

    // Filter and score books
    matchedBooks = allBooks.map(book => {
      let score = 0;

      // Category match
      if (category_id && (book.category_id === category_id || book.category_slug === category_id)) {
        score += 40;
      }

      // Reader level match
      if (reader_level && book.reader_level === reader_level) {
        score += 35;
      } else if (reader_level === 'beginner' && book.reader_level === 'intermediate') {
        score += 15;
      } else if (reader_level === 'intermediate') {
        score += 20;
      }

      // Sub-topic / keywords match
      if (sub_topic) {
        const normSub = normalizeArabicText(sub_topic);
        const normBookSub = normalizeArabicText(book.sub_topics || '');
        const normWhy = normalizeArabicText(book.why_read || '');
        const normTitle = normalizeArabicText(book.title);

        if (normBookSub.includes(normSub) || normWhy.includes(normSub) || normTitle.includes(normSub)) {
          score += 25;
        }
      }

      // Length preference
      if (preferred_length === 'short' && book.page_count <= 250) score += 10;
      if (preferred_length === 'medium' && book.page_count > 250 && book.page_count <= 400) score += 10;
      if (preferred_length === 'long' && book.page_count > 400) score += 10;

      return { ...book, score };
    });

    matchedBooks.sort((a, b) => b.score - a.score);

    const levelAr = reader_level === 'beginner' ? 'مبتدئ' : reader_level === 'intermediate' ? 'متوسط' : 'متعمق';
    intentSummary = `قارئ ${levelAr} يبحث عن ترشيح دقيق في ${matchedBooks[0]?.category_name || 'الكتب العامة'} ${sub_topic ? `(تركيز: ${sub_topic})` : ''}`;
    pathTitle = `مسار القراءة المتدرج في ${matchedBooks[0]?.category_name || 'المجال'}`;
  } else {
    // Natural Language Search Mode
    const query = normalizeArabicText(req.query || '');

    matchedBooks = allBooks.map(book => {
      let score = 0;
      const title = normalizeArabicText(book.title);
      const author = normalizeArabicText(book.author);
      const sub = normalizeArabicText(book.sub_topics || '');
      const why = normalizeArabicText(book.why_read || '');
      const cat = normalizeArabicText(book.category_name || '');

      const words = query.split(' ').filter(w => w.length > 2);
      for (const word of words) {
        if (title.includes(word)) score += 30;
        if (sub.includes(word)) score += 20;
        if (cat.includes(word)) score += 15;
        if (why.includes(word)) score += 10;
        if (author.includes(word)) score += 25;
      }

      // Detect level mentions in query
      if (query.includes('مبتدئ') || query.includes('مبتدئين') || query.includes('بسيط') || query.includes('مدخل')) {
        if (book.reader_level === 'beginner') score += 20;
      }
      if (query.includes('متوسط') && book.reader_level === 'intermediate') score += 20;
      if ((query.includes('متعمق') || query.includes('متقدم')) && book.reader_level === 'advanced') score += 20;

      return { ...book, score };
    });

    matchedBooks.sort((a, b) => b.score - a.score);
    intentSummary = `بحث ذكي موجه بناءً على استفسارك: "${req.query}"`;
    pathTitle = `مسار مقترح مخصص وفق اهتمامك القرائي`;
  }

  // Ensure we have a primary match
  const primaryBook = matchedBooks[0] || allBooks[0];

  // Build reading path: Step 1 (Primary or Foundational), Step 2 (Follow-up or intermediate), Step 3 (Mastery or related)
  const pathSteps: any[] = [];

  // Step 1: Foundation
  pathSteps.push({
    step_number: 1,
    step_label: 'الخطوة 1: المدخل التأسيسي المبسط',
    book_id: primaryBook.id,
    slug: primaryBook.slug,
    title: primaryBook.title,
    author: primaryBook.author,
    price: primaryBook.price,
    cover_image: primaryBook.cover_image,
  });

  // Step 2: Next recommended book or highest ranked complementary book
  let step2Book = null;
  if (primaryBook.recommended_next_book_id) {
    step2Book = allBooks.find(b => b.id === primaryBook.recommended_next_book_id);
  }
  if (!step2Book) {
    step2Book = matchedBooks.find(b => b.id !== primaryBook.id && (b.category_id === primaryBook.category_id || b.reader_level !== 'beginner'));
  }
  if (!step2Book && matchedBooks.length > 1) {
    step2Book = matchedBooks[1];
  }

  if (step2Book) {
    pathSteps.push({
      step_number: 2,
      step_label: 'الخطوة 2: الفهم والتطبيق العملي',
      book_id: step2Book.id,
      slug: step2Book.slug,
      title: step2Book.title,
      author: step2Book.author,
      price: step2Book.price,
      cover_image: step2Book.cover_image,
    });

    // Step 3: Deepening
    const step3Book = matchedBooks.find(b => b.id !== primaryBook.id && b.id !== step2Book.id);
    if (step3Book) {
      pathSteps.push({
        step_number: 3,
        step_label: 'الخطوة 3: التوسع والتعمق الفكري',
        book_id: step3Book.id,
        slug: step3Book.slug,
        title: step3Book.title,
        author: step3Book.author,
        price: step3Book.price,
        cover_image: step3Book.cover_image,
      });
    }
  }

  // Key takeaways extracted or generated cleanly
  const subTopicsList = primaryBook.sub_topics ? primaryBook.sub_topics.split(',').map((s: string) => s.trim()) : [];
  const keyTakeaways = subTopicsList.length >= 2 ? [
    `إتقان أساسيات ${subTopicsList[0] || 'المجال'} بخطوات عملية`,
    `التعرف على أسرار ${subTopicsList[1] || 'التطبيق اليومي'} وأهم النماذج الفكرية`,
    `بناء نظرة شمولية واعية بعيداً عن التعقيد النظري`
  ] : [
    'بناء أساس معرفي متين مدعوم بأمثلة واقعية',
    'خطوات وتوجيهات قابلة للتطبيق في الحياة اليومية',
    'تطوير مرونة فكرية وفهم أعمق للذات والآخرين'
  ];

  const result: RecommendationResult = {
    intent_summary: intentSummary,
    reading_path_title: pathTitle,
    bundle_discount_percent: 10,
    primary_recommendation: {
      book_id: primaryBook.id,
      slug: primaryBook.slug,
      title: primaryBook.title,
      author: primaryBook.author,
      price: primaryBook.price,
      original_price: primaryBook.original_price,
      cover_image: primaryBook.cover_image,
      reader_level: primaryBook.reader_level,
      page_count: primaryBook.page_count,
      reading_time_hours: primaryBook.reading_time_hours,
      match_score: Math.min(0.98, Math.max(0.85, (primaryBook.score || 80) / 100)),
      why_recommended: primaryBook.why_read,
      key_takeaways: keyTakeaways,
      in_stock: primaryBook.stock_quantity > 0,
    },
    reading_path_steps: pathSteps,
    engine_mode: 'hybrid_local_forever',
  };

  // Cache result
  memoryCache.set(cacheKey, { result, timestamp: Date.now() });

  // Log recommendation asynchronously in DB for merchant content-gap analytics
  try {
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const logQuery = req.mode === 'quiz' ? JSON.stringify(req.quiz) : (req.query || '');
    const matchedBookIds = pathSteps.map(s => s.book_id).join(',');
    execute('INSERT INTO recommendation_logs (id, query_or_quiz, matched_books) VALUES (?, ?, ?)', [
      logId, logQuery, matchedBookIds
    ]).catch(() => {});
  } catch (e) {
    // Non-blocking log
  }

  return result;
}

