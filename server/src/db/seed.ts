import { db, initDb, execute } from './database';

export async function runSeed() {
  console.log('🌱 Initializing tables and starting seed...');
  await initDb();

  // Clear existing
  await execute('DELETE FROM order_items');
  await execute('DELETE FROM orders');
  await execute('DELETE FROM recommendation_logs');
  await execute('DELETE FROM books');
  await execute('DELETE FROM categories');
  await execute('DELETE FROM shipping_governorates');
  await execute('DELETE FROM site_settings');

  // 1. Site Settings
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['free_shipping_threshold', '600']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['bundle_discount_percent', '10']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['merchant_phone', '201012345678']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['merchant_email', 'store@dar-almaarefa.com']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['store_name', 'مقبرة الكتب المنسية']);

  // 2. Categories
  const categories = [
    { id: 'cat_psychology', name: 'علم النفس', slug: 'psychology', icon: 'Brain' },
    { id: 'cat_self_help', name: 'تطوير الذات', slug: 'self-help', icon: 'Sparkles' },
    { id: 'cat_philosophy', name: 'الفلسفة والتفكير', slug: 'philosophy', icon: 'Compass' },
    { id: 'cat_literature', name: 'الروايات والأدب', slug: 'literature', icon: 'BookOpen' },
    { id: 'cat_business', name: 'المال والأعمال', slug: 'business', icon: 'TrendingUp' }
  ];

  for (const cat of categories) {
    await execute('INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?)', [
      cat.id, cat.name, cat.slug, cat.icon
    ]);
  }

  // 3. Books
  const books = [
    {
      id: 'bk_201',
      slug: 'zill-al-reeh',
      title: 'ظل الريح (مقبرة الكتب المنسية)',
      author: 'كارلوس زافون',
      price: 260,
      original_price: 300,
      stock_quantity: 14,
      category_id: 'cat_literature',
      sub_topics: 'مقبرة الكتب المنسية, أدب الغموض والذاكرة, الرواية الإسبانية',
      reader_level: 'intermediate',
      page_count: 540,
      reading_time_hours: 11.0,
      why_read: 'المدخل المقدس لعالم مقبرة الكتب المنسية؛ سر خفي ورواية تحرك نبضات القلوب وتنسج حب الكتب كقدر أبدي.',
      excerpt_text: '«تذكر يا دانيال، المرة الأولى التي يزور فيها شخص ما مقبرة الكتب المنسية، يتوجب عليه أن يتبنى كتاباً وينقذه، ويتعهد بألا يتركه يموت أبداً...»',
      cover_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_202'
    },
    {
      id: 'bk_202',
      slug: 'leabat-al-malak',
      title: 'لعبة الملاك',
      author: 'كارلوس زافون',
      price: 270,
      original_price: 310,
      stock_quantity: 9,
      category_id: 'cat_literature',
      sub_topics: 'مقبرة الكتب المنسية, كُتاب برشلونة, أسرار المخطوطات',
      reader_level: 'intermediate',
      page_count: 510,
      reading_time_hours: 10.5,
      why_read: 'الجزء الثاني من ملحمة المقبرة؛ كاتب شاب في أزقة برشلونة القديمة يُطلب منه تأليف كتاب يغير معتقدات العالم.',
      excerpt_text: '«الخطوات التي تقودك إلى مقبرة الكتب المنسية لا يمكن نسيانها أبداً، لأنها محفورة في ذاكرة الأرواح الحائرة...»',
      cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    },
    {
      id: 'bk_101',
      slug: 'jalasat-nafsiya',
      title: 'جلسات نفسية',
      author: 'د. محمد إبراهيم',
      price: 180,
      original_price: 210,
      stock_quantity: 12,
      category_id: 'cat_psychology',
      sub_topics: 'فهم الذات والقلق, التفكير الزائد, الصحة النفسية للمبتدئين',
      reader_level: 'beginner',
      page_count: 215,
      reading_time_hours: 4.5,
      why_read: 'مدخل سلس وعملي يفكك التفكير الزائد والضغوط اليومية بلغة دافئة ومفهومة لكل مبتدئ.',
      excerpt_text: 'الفصل الأول: أنت لست أفكارك\nكثير منا يعيش حبيساً لحديثه الداخلي، نصدق كل فكرة سلبية تخطر ببالنا وكأنها حقيقة مطلقة. تعلم أن تراقب أفكارك دون أن تصبح أسيراً لها...',
      cover_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_102'
    },
    {
      id: 'bk_102',
      slug: 'al-khoroog-an-al-nas',
      title: 'الخروج عن النص',
      author: 'د. محمد طه',
      price: 195,
      original_price: 230,
      stock_quantity: 8,
      category_id: 'cat_psychology',
      sub_topics: 'فهم الذات والقلق, تحليل السلوك والشخصيات, التعافي النفسي',
      reader_level: 'beginner',
      page_count: 240,
      reading_time_hours: 5.0,
      why_read: 'يساعدك على التوقف عن تمثيل أدوار فرضها عليك الآخرون، والبدء في كتابة نص حياتك الحقيقي.',
      excerpt_text: 'مقدمة:\nمن قال أنك مضطر للالتزام بالنص المكتوب لك سلفاً؟ في هذا الكتاب دعوة صريحة لإعادة اكتشاف نفسك بعيداً عن أقنعة المجتمع وتوقعاته المسبقة...',
      cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_103'
    },
    {
      id: 'bk_103',
      slug: 'alaqat-khatira',
      title: 'علاقات خطرة',
      author: 'د. محمد طه',
      price: 210,
      original_price: 240,
      stock_quantity: 6,
      category_id: 'cat_psychology',
      sub_topics: 'علم نفس العلاقات, تحليل السلوك والشخصيات, العلاقات السامة',
      reader_level: 'intermediate',
      page_count: 280,
      reading_time_hours: 6.0,
      why_read: 'دليلك التشريحي لأكثر من 30 نوعاً من العلاقات المؤذية وكيف تحمي حدودك النفسية بوعي.',
      excerpt_text: 'علاقة التقمص والاحتواء:\nحين تصبح العلاقة ساحة لامتصاص طاقة طرف لحساب طرف آخر دون تبادل عادل، هنا يدق ناقوس الخطر...',
      cover_image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 0,
      recommended_next_book_id: 'bk_104'
    },
    {
      id: 'bk_104',
      slug: 'oqadak-al-nafsiya',
      title: 'عقدك النفسية سجنك الأبدي',
      author: 'د. يوسف الحسني',
      price: 230,
      original_price: 260,
      stock_quantity: 10,
      category_id: 'cat_psychology',
      sub_topics: 'فهم الذات والقلق, التعافي النفسي, صدمات الطفولة',
      reader_level: 'intermediate',
      page_count: 310,
      reading_time_hours: 6.5,
      why_read: 'مواجهة شجاعة وصريحة مع الجروح غير الملتئمة وترسبات الطفولة التي تتحكم في اختياراتك الحالية.',
      excerpt_text: 'العقدة الأولى: الشعور بالذنب غير المبرر.\nهل تشعر دائماً بأنك مسؤول عن سعادة الجميع من حولك؟ هذا الفخ النفسي يبدأ مبكراً جداً...',
      cover_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 0,
      is_featured: 1,
      recommended_next_book_id: null
    },
    {
      id: 'bk_105',
      slug: 'al-insan-wa-al-bahth-an-al-maana',
      title: 'الإنسان والبحث عن المعنى',
      author: 'فيكتور فرانكل',
      price: 220,
      original_price: 250,
      stock_quantity: 5,
      category_id: 'cat_psychology',
      sub_topics: 'العلاج بالمعنى, الصمود النفسي, فلسفة الألم',
      reader_level: 'advanced',
      page_count: 200,
      reading_time_hours: 4.5,
      why_read: 'تحفة علم النفس الإنساني الخالدة؛ كيف يجد الإنسان سبباً للعيش حتى في أحلك ظروف المعاناة.',
      excerpt_text: 'تجارب معسكر الاعتقال:\nيمكن تجريد الإنسان من كل شيء عدا حرية واحدة: حريته في اختيار موقفه وتصرفه حيال أي ظرف كان...',
      cover_image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    },
    {
      id: 'bk_106',
      slug: 'al-adat-al-thariya',
      title: 'العادات الذرية',
      author: 'جيمس كلير',
      price: 220,
      original_price: 250,
      stock_quantity: 15,
      category_id: 'cat_self_help',
      sub_topics: 'بناء العادات, الإنتاجية, التغيير التدريجي',
      reader_level: 'beginner',
      page_count: 320,
      reading_time_hours: 6.5,
      why_read: 'أفضل نظام عملي مثبت لبناء العادات الطيبة والتخلص من العادات السيئة بتغييرات صغيرة بنسبة 1%.',
      excerpt_text: 'القوانين الأربعة لتغيير السلوك:\n1. اجعلها واضحة.\n2. اجعلها جذابة.\n3. اجعلها سهلة.\n4. اجعلها مشبعة...',
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    },
    {
      id: 'bk_107',
      slug: 'fann-al-lamobala',
      title: 'فن اللامبالاة',
      author: 'مارك مانسون',
      price: 195,
      original_price: 220,
      stock_quantity: 9,
      category_id: 'cat_self_help',
      sub_topics: 'إدارة الأولويات, المرونة النفسية, التفكير الواقعي',
      reader_level: 'beginner',
      page_count: 270,
      reading_time_hours: 5.5,
      why_read: 'طرح غير مألوف وصادم للتصالح مع النقص والمعاناة واختيار المعارك التي تستحق اهتمامك حقاً.',
      excerpt_text: 'الفصل الأول: لا تحاول.\nالإيجابية المفرطة أصبحت عبئاً ثقيلاً. التعاسة جزء طبيعي من التجربة البشرية التي تصقل وعينا...',
      cover_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 0,
      recommended_next_book_id: null
    },
    {
      id: 'bk_108',
      slug: 'aza-at-al-falsafa',
      title: 'عزاءات الفلسفة',
      author: 'ألان دو بوتون',
      price: 210,
      original_price: 240,
      stock_quantity: 7,
      category_id: 'cat_philosophy',
      sub_topics: 'فلسفة الحياة اليومية, التعامل مع الإحباط, سقراط وسينيكا',
      reader_level: 'beginner',
      page_count: 280,
      reading_time_hours: 6.0,
      why_read: 'كيف تحول حكمة كبار الفلاسفة (سقراط، إبيقور، سينيكا) إلى ترياق عملي يهدئ قلقك اليومي.',
      excerpt_text: 'عزاء في قلة الشعبية:\nحين حاكمت أثينا سقراط لم يكن ذلك دليلاً على خطئه بل على ارتباك الحشود أمام التفكير المنطقي الصارم...',
      cover_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 0,
      is_featured: 1,
      recommended_next_book_id: 'bk_109'
    },
    {
      id: 'bk_109',
      slug: 'alam-sofi',
      title: 'عالم صوفي',
      author: 'جوستاين غاردر',
      price: 260,
      original_price: 290,
      stock_quantity: 4,
      category_id: 'cat_philosophy',
      sub_topics: 'تاريخ الفلسفة, التفكير النقدي, الأسئلة الوجودية',
      reader_level: 'intermediate',
      page_count: 550,
      reading_time_hours: 11.0,
      why_read: 'أشهر رواية فلسفية في العالم؛ تأخذك في رحلة مشوقة عبر تاريخ الفكر الإنساني بأكمله.',
      excerpt_text: 'رسالة في صندوق البريد:\nمن أنتِ؟ من أين جاء العالم؟ سؤالان بسيطان قلبا حياة فتاة في الرابعة عشرة من عمرها رأساً على عقب...',
      cover_image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    },
    {
      id: 'bk_110',
      slug: 'thulathiyat-gharnata',
      title: 'ثلاثية غرناطة',
      author: 'رضوى عاشور',
      price: 280,
      original_price: 320,
      stock_quantity: 6,
      category_id: 'cat_literature',
      sub_topics: 'رواية تاريخية, الذاكرة والهوية, الأدب العربي',
      reader_level: 'intermediate',
      page_count: 500,
      reading_time_hours: 10.0,
      why_read: 'ملحمة روائية إنسانية خالدة تروي قصة سقوط الأندلس من عيون أهلها البسطاء وصمود ذاكرتهم.',
      excerpt_text: 'في حي البيازين:\nكانت غرناطة تحتضر ببطء، لكن في بيت أبي جعفر كان الورق يُصنع، والحروف تُكتب، لأن الكلمة هي الحصن الأخير...',
      cover_image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    }
  ];

  for (const b of books) {
    await execute(`
      INSERT INTO books (
        id, slug, title, author, price, original_price, stock_quantity,
        category_id, sub_topics, reader_level, page_count, reading_time_hours,
        why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      b.id, b.slug, b.title, b.author, b.price, b.original_price, b.stock_quantity,
      b.category_id, b.sub_topics, b.reader_level, b.page_count, b.reading_time_hours,
      b.why_read, b.excerpt_text, b.cover_image, b.is_bestseller, b.is_featured, b.recommended_next_book_id
    ]);
  }

  // 4. Egyptian Governorates Shipping Rates
  const governorates = [
    { id: 'gov_cairo', name: 'القاهرة', fee: 40, delivery_days: '1-2 يوم عمل' },
    { id: 'gov_giza', name: 'الجيزة', fee: 40, delivery_days: '1-2 يوم عمل' },
    { id: 'gov_alex', name: 'الإسكندرية', fee: 50, delivery_days: '2 يوم عمل' },
    { id: 'gov_qalyubia', name: 'القليوبية', fee: 45, delivery_days: '1-2 يوم عمل' },
    { id: 'gov_damietta', name: 'دمياط', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_dakahlia', name: 'الدقهلية (المنصورة)', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_gharbia', name: 'الغربية (طنطا)', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_sharqia', name: 'الشرقية (الزقازيق)', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_monufia', name: 'المنوفية', fee: 50, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_beheira', name: 'البحيرة', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_kafr_el_sheikh', name: 'كفر الشيخ', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_port_said', name: 'بورسعيد', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_ismailia', name: 'الإسماعيلية', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_suez', name: 'السويس', fee: 55, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_fayoum', name: 'الفيوم', fee: 60, delivery_days: '2-3 أيام عمل' },
    { id: 'gov_beni_suef', name: 'بني سويف', fee: 65, delivery_days: '2-4 أيام عمل' },
    { id: 'gov_minya', name: 'المنيا', fee: 70, delivery_days: '3-4 أيام عمل' },
    { id: 'gov_asyut', name: 'أسيوط', fee: 75, delivery_days: '3-4 أيام عمل' },
    { id: 'gov_sohag', name: 'سوهاج', fee: 80, delivery_days: '3-5 أيام عمل' },
    { id: 'gov_qena', name: 'قنا', fee: 85, delivery_days: '3-5 أيام عمل' },
    { id: 'gov_luxor', name: 'الأقصر', fee: 90, delivery_days: '3-5 أيام عمل' },
    { id: 'gov_aswan', name: 'أسوان', fee: 95, delivery_days: '4-6 أيام عمل' },
    { id: 'gov_red_sea', name: 'البحر الأحمر والغردقة', fee: 90, delivery_days: '3-5 أيام عمل' },
    { id: 'gov_south_sinai', name: 'جنوب سيناء وشرم الشيخ', fee: 95, delivery_days: '3-5 أيام عمل' },
    { id: 'gov_matrouh', name: 'مطروح والساحل الشمالي', fee: 80, delivery_days: '3-5 أيام عمل' }
  ];

  for (const g of governorates) {
    await execute('INSERT INTO shipping_governorates (id, name, fee, delivery_days) VALUES (?, ?, ?, ?)', [
      g.id, g.name, g.fee, g.delivery_days
    ]);
  }

  console.log(`✅ Seed completed successfully: ${books.length} books, ${governorates.length} governorates.`);
}

if (require.main === module || process.argv.includes('--run')) {
  runSeed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
}
