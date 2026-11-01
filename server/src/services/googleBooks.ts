export interface GoogleBookItem {
  id: string;
  title: string;
  author: string;
  description: string;
  pageCount: number;
  coverImage: string;
  publishedDate?: string;
  isbn?: string;
  categories?: string[];
  source?: 'open-library' | 'arabic-archive' | 'google-books';
}

export interface BookLookupResponse {
  items: GoogleBookItem[];
  source: 'open-library' | 'arabic-archive' | 'google-books' | 'none';
  quotaExceeded: boolean;
  message?: string;
}

/**
 * Built-in Popular Arabic & Translated Books Database with REAL Official Book Covers (100% Free Forever)
 */
const CURATED_ARABIC_BOOKS: Record<string, Partial<GoogleBookItem>> = {
  'جلسات نفسية': {
    title: 'جلسات نفسية',
    author: 'د. محمد إبراهيم',
    description: 'مدخل عملي مبسط يفكك التفكير الزائد والضغوط اليومية ويوضح كيفية التعامل مع المشاعر الصعبة بلغة دافئة ومفهومة.',
    pageCount: 215,
    coverImage: '/covers/jalasat-nafsiya.jpg',
    publishedDate: '2020',
    isbn: '9789778240580',
    categories: ['علم النفس', 'تطوير الذات']
  },
  'عزاءات الفلسفة': {
    title: 'عزاءات الفلسفة',
    author: 'ألان دو بوتون',
    description: 'كيف تحول حكمة كبار الفلاسفة (سقراط، إبيقور، سينيكا) إلى ترياق عملي يهدئ قلقك اليومي ويمنحك السكينة.',
    pageCount: 280,
    coverImage: '/covers/aza-at-al-falsafa.jpg',
    publishedDate: '2000',
    isbn: '9789953893327',
    categories: ['الفلسفة والتفكير']
  },
  'الخروج عن النص': {
    title: 'الخروج عن النص',
    author: 'د. محمد طه',
    description: 'رحلة استكشافية عميقة في النفس البشرية لفهم المشاعر والعلاقات الإنسانية والتحرر من الأدوار المفروضة علينا.',
    pageCount: 240,
    coverImage: '/covers/al-khoroog-an-al-nas.jpg',
    publishedDate: '2016',
    isbn: '9789770932827',
    categories: ['علم النفس', 'تطوير الذات']
  },
  'علاقات خطرة': {
    title: 'علاقات خطرة',
    author: 'د. محمد طه',
    description: 'دليلك التشريحي لأكثر من 30 نوعاً من العلاقات المؤذية وكيف تحمي حدودك النفسية وتبني علاقات صحية متوازنة.',
    pageCount: 280,
    coverImage: '/covers/alaqat-khatira.jpg',
    publishedDate: '2016',
    isbn: '9789770933398',
    categories: ['علم النفس']
  },
  'عقدك النفسية سجنك الأبدي': {
    title: 'عقدك النفسية سجنك الأبدي',
    author: 'د. يوسف الحسني',
    description: 'تحليل جريء للعقد النفسية المتوارثة والتجارب المؤلمة في الطفولة، وطرق التحرر منها لبناء حياة حرة واعية.',
    pageCount: 288,
    coverImage: '/covers/oqadak-al-nafsiya.jpg',
    publishedDate: '2021',
    isbn: '9789921746204',
    categories: ['علم النفس']
  },
  'أبي الذي أكره': {
    title: 'أبي الذي أكره: تأملات في التعافي من إساءات الطفولة',
    author: 'د. عماد رشاد عثمان',
    description: 'كتاب يتعامل بعمق وإنسانية مع التعافي من الصدمات الأسرية وإساءات العلاقات التدميرية وسيكولوجية النجاة.',
    pageCount: 320,
    coverImage: '/covers/abi-alladhi-akraho.jpg',
    publishedDate: '2020',
    isbn: '9789778240573',
    categories: ['علم النفس']
  },
  'ظل الريح': {
    title: 'ظل الريح (مقبرة الكتب المنسية)',
    author: 'كارلوس زافون',
    description: 'الرواية الأولى في ملحمة مقبرة الكتب المنسية؛ سر خفي وأدب غموض ساحر في أزقة برشلونة القديمة ينسج حب القراءة كقدر أبدي.',
    pageCount: 540,
    coverImage: '/covers/zill-al-reeh.jpg',
    publishedDate: '2001',
    isbn: '9789953890258',
    categories: ['الروايات والأدب']
  },
  'لعبة الملاك': {
    title: 'لعبة الملاك',
    author: 'كارلوس زافون',
    description: 'الجزء الثاني من ملحمة مقبرة الكتب المنسية؛ كاتب شاب في أزقة برشلونة القديمة يُطلب منه تأليف كتاب يغير معتقدات العالم.',
    pageCount: 510,
    coverImage: '/covers/leabat-al-malak.jpg',
    publishedDate: '2008',
    isbn: '9789953890982',
    categories: ['الروايات والأدب']
  },
  'العادات الذرية': {
    title: 'العادات الذرية: تغييرات صغيرة لنتائج مبهرة',
    author: 'جيمس كلير',
    description: 'دليل عملي مثبت علمياً لبناء عادات إيجابية والتخلص من السلوكيات السلبية من خلال تراكم التغييرات الطفيفة بنسبة 1% يومياً.',
    pageCount: 320,
    coverImage: '/covers/al-adat-al-thariya.jpg',
    publishedDate: '2018',
    isbn: '9780735211292',
    categories: ['تطوير الذات']
  },
  'فن اللامبالاة': {
    title: 'فن اللامبالاة: لعيش حياة تخالف المألوف',
    author: 'مارك مانسون',
    description: 'كتاب فلسفي نفسي صريح يدعو لتقبل الصعوبات والمعاناة الواقعية بدلاً من السعي وراء الإيجابية الزائفة وغير الواقعية.',
    pageCount: 272,
    coverImage: '/covers/fann-al-lamobala.jpg',
    publishedDate: '2016',
    isbn: '9780062457714',
    categories: ['تطوير الذات', 'علم النفس']
  },
  'الإنسان يبحث عن المعنى': {
    title: 'الإنسان يبحث عن المعنى',
    author: 'فيكتور فرانكل',
    description: 'تأصيل لمدرسة العلاج بالمعنى، مستوحى من تجربة الطبيب النفسي فرانكل في معسكرات الاعتقال وقدرة الروح على التجاوز.',
    pageCount: 216,
    coverImage: '/covers/al-insan-wa-al-bahth-an-al-maana.jpg',
    publishedDate: '1946',
    isbn: '9780807014295',
    categories: ['علم النفس', 'الفلسفة والتفكير']
  },
  'عالم صوفي': {
    title: 'عالم صوفي',
    author: 'جوستاين غاردر',
    description: 'أشهر رواية فلسفية في العالم؛ تأخذك في رحلة مشوقة عبر تاريخ الفكر الإنساني بأكمله.',
    pageCount: 550,
    coverImage: '/covers/alam-sofi.jpg',
    publishedDate: '1991',
    isbn: '9780374530716',
    categories: ['الفلسفة والتفكير']
  },
  'ثلاثية غرناطة': {
    title: 'ثلاثية غرناطة',
    author: 'رضوى عاشور',
    description: 'ثلاثية روائية تاريخية بديعة تسرد وقائع سقوط الأندلس ومأساة بقاء الموريسكيين في غرناطة عبر أجيال عائلة أبي جعفر.',
    pageCount: 520,
    coverImage: '/covers/thulathiyat-gharnata.jpg',
    publishedDate: '1994',
    isbn: '9789770908860',
    categories: ['الروايات والأدب']
  },
  'عزازيل': {
    title: 'عزازيل',
    author: 'يوسف زيدان',
    description: 'رواية تاريخية فلسفية حائزة على البوكر، تسرد مذكرات الراهب هيبا في مصر والشام وصراعات الإيمان والشك في القرن الخامس الميلادي.',
    pageCount: 380,
    coverImage: '/covers/azazeel.jpg',
    publishedDate: '2008',
    isbn: '9789770923085',
    categories: ['الروايات والأدب', 'الفلسفة والتفكير']
  },
  'الخيميائي': {
    title: 'الخيميائي',
    author: 'باولو كويلو',
    description: 'رواية رمزية بديعة عن الراعي الأندلسي سنتياغو في رحلته للبحث عن كنزه الدفين، وأسطورته الشخصية.',
    pageCount: 190,
    coverImage: '/covers/al-khemyai.jpg',
    publishedDate: '1988',
    isbn: '9780062315007',
    categories: ['الروايات والأدب', 'تطوير الذات']
  },
  '1984': {
    title: '1984',
    author: 'جورج أورويل',
    description: 'رواية الديستوبيا العالمية الخالدة التي تجسد العالم تحت سطوة الأخ الكبير والمراقبة الشاملة وتزييف الحقائق والتاريخ.',
    pageCount: 328,
    coverImage: '/covers/1984.jpg',
    publishedDate: '1949',
    isbn: '9780451524935',
    categories: ['الروايات والأدب', 'الفلسفة والتفكير']
  },
  'الأب الغني والأب الفقير': {
    title: 'الأب الغني والأب الفقير',
    author: 'روبرت كيوساكي',
    description: 'أشهر كتاب في الثقافة المالية واستثمار الأموال، يوضح الفارق الجوهري بين الأصول والخصوم وكيف يفكر الأثرياء في تنمية ثرواتهم.',
    pageCount: 336,
    coverImage: '/covers/al-ab-al-ghani.jpg',
    publishedDate: '1997',
    isbn: '9781612680194',
    categories: ['المال والأعمال']
  }
};

/**
 * Helper to fetch real cover image from Open Library or Google Books content by title or ISBN
 */
async function fetchRealCover(title: string, isbn?: string): Promise<string> {
  // If clean ISBN exists, direct Google Books content URL is ultra-reliable
  if (isbn && /^[\d-]{10,17}$/.test(isbn.trim())) {
    const cleanIsbn = isbn.replace(/[\s-]/g, '');
    return `https://books.google.com/books/content?vid=isbn${cleanIsbn}&printsec=frontcover&img=1&zoom=1`;
  }

  // Otherwise, query Open Library for title to extract cover ID
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data: any = await res.json();
      const doc = data.docs?.[0];
      if (doc?.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
      if (doc?.isbn && doc.isbn[0]) {
        return `https://books.google.com/books/content?vid=isbn${doc.isbn[0]}&printsec=frontcover&img=1&zoom=1`;
      }
    }
  } catch {}

  return '';
}

/**
 * Match query against local curated Arabic books
 */
function findInCuratedBooks(query: string): GoogleBookItem[] {
  const q = query.trim().toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, '');
  const matches: GoogleBookItem[] = [];

  for (const [key, book] of Object.entries(CURATED_ARABIC_BOOKS)) {
    const cleanKey = key.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, '');
    const cleanTitle = (book.title || '').toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, '');
    const cleanAuthor = (book.author || '').toLowerCase();
    const isbn = book.isbn || '';

    if (
      cleanKey.includes(q) ||
      q.includes(cleanKey) ||
      cleanTitle.includes(q) ||
      cleanAuthor.includes(q) ||
      (isbn && q.replace(/[\s-]/g, '') === isbn.replace(/[\s-]/g, ''))
    ) {
      matches.push({
        id: `curated_${Date.now()}_${matches.length}`,
        title: book.title || key,
        author: book.author || 'مؤلف معروف',
        description: book.description || 'مخطوطة قيمة تثري الفكر والوعي.',
        pageCount: book.pageCount || 220,
        coverImage: book.coverImage || '',
        publishedDate: book.publishedDate || '',
        isbn: book.isbn || '',
        categories: book.categories || [],
        source: 'arabic-archive',
      });
    }
  }

  return matches;
}

/**
 * Search Wikipedia Arabic Book Archive + Real Cover Detection
 */
async function searchArabicWikipedia(query: string): Promise<GoogleBookItem[]> {
  try {
    const cleanQuery = query.trim();
    const url = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery + ' كتاب أو رواية')}&utf8=1&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data: any = await res.json();
    const items = data.query?.search;
    if (!items || !Array.isArray(items) || items.length === 0) return [];

    const results: GoogleBookItem[] = [];
    for (const item of items.slice(0, 3)) {
      const cleanSnippet = (item.snippet || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

      let detectedAuthor = 'مؤلف غير محدد';
      const authorMatch = cleanSnippet.match(/تأليف (?:الكاتب|الدكتور|الروائي)?\s*([^،.]+)/);
      if (authorMatch && authorMatch[1]) {
        detectedAuthor = authorMatch[1].trim();
      }

      const cleanTitle = item.title
        .replace(/\s*\(رواية\)/gi, '')
        .replace(/\s*\(كتاب\)/gi, '')
        .trim();

      // Resolve real cover from Open Library by clean title
      const realCover = await fetchRealCover(cleanTitle);

      results.push({
        id: `wiki_${item.pageid || Date.now()}`,
        title: cleanTitle,
        author: detectedAuthor,
        description: cleanSnippet,
        pageCount: 250,
        coverImage: realCover || 'https://covers.openlibrary.org/b/id/13009625-L.jpg',
        source: 'arabic-archive',
      });
    }

    return results;
  } catch (err) {
    return [];
  }
}

/**
 * Search Open Library API (Over 30M books, 100% Free Forever, Real Covers & ISBNs)
 */
async function searchOpenLibrary(query: string): Promise<GoogleBookItem[]> {
  try {
    const isIsbn = /^[\d-]{10,17}$/.test(query.trim());
    const searchParam = isIsbn
      ? `isbn=${encodeURIComponent(query.replace(/[\s-]/g, ''))}`
      : `q=${encodeURIComponent(query)}`;

    const url = `https://openlibrary.org/search.json?${searchParam}&limit=5`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];

    const data: any = await res.json();
    if (!data.docs || !Array.isArray(data.docs) || data.docs.length === 0) {
      return [];
    }

    return data.docs.map((doc: any, index: number) => {
      const isbn = doc.isbn ? doc.isbn[0] : '';
      let coverImage = '';
      if (doc.cover_i) {
        coverImage = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      } else if (isbn) {
        coverImage = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      } else {
        coverImage = 'https://covers.openlibrary.org/b/id/13009625-L.jpg';
      }

      const authors = Array.isArray(doc.author_name)
        ? doc.author_name.join('، ')
        : (doc.author_name || 'مؤلف غير معروف');

      return {
        id: `ol_${doc.key || index}_${Date.now()}`,
        title: doc.title || query,
        author: authors,
        description: Array.isArray(doc.first_sentence)
          ? doc.first_sentence.join(' ')
          : (doc.first_sentence || 'كتاب متوفر في الأرشيف المفتوح.'),
        pageCount: doc.number_of_pages_median || 220,
        coverImage,
        publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
        isbn,
        source: 'open-library' as const,
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Main Search Engine - 100% Free Forever, Zero Cards, Zero Billing
 */
export async function searchBooksMetadata(query: string): Promise<BookLookupResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { items: [], source: 'none', quotaExceeded: false };
  }

  // 1. Check curated Arabic library first with real official covers (0ms)
  const curated = findInCuratedBooks(cleanQuery);
  if (curated.length > 0) {
    return {
      items: curated,
      source: 'arabic-archive',
      quotaExceeded: false,
    };
  }

  // 2. Query Open Library (great for ISBNs and international translated books)
  const openLibraryItems = await searchOpenLibrary(cleanQuery);
  if (openLibraryItems.length > 0) {
    return {
      items: openLibraryItems,
      source: 'open-library',
      quotaExceeded: false,
    };
  }

  // 3. Query Arabic Wikipedia archive
  const wikiItems = await searchArabicWikipedia(cleanQuery);
  if (wikiItems.length > 0) {
    return {
      items: wikiItems,
      source: 'arabic-archive',
      quotaExceeded: false,
    };
  }

  return {
    items: [],
    source: 'none',
    quotaExceeded: false,
    message: 'لم يتم العثور على بيانات مطابقة تلقائياً، يمكنك إدخال تفاصيل الكتاب وحفظها مباشرة.',
  };
}

/**
 * Backward-compatible helper
 */
export async function searchGoogleBooks(query: string): Promise<GoogleBookItem[]> {
  const res = await searchBooksMetadata(query);
  return res.items;
}
