import { InStatement } from '@libsql/client/web';
import { initDb, batch } from './database';

export async function runSeed() {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceProdSeed = process.argv.includes('--force-prod-seed') || process.env.ALLOW_REMOTE_SEED === 'true';

  const currentUrl = process.env.DATABASE_URL || '';
  const isRemoteDb = currentUrl.startsWith('libsql://') || currentUrl.startsWith('https://') || currentUrl.includes('turso.io');

  if ((isProduction || isRemoteDb) && !forceProdSeed) {
    const errorMsg = '⛔ SAFETY ABORT: Seed was invoked on a remote or production database without the --force-prod-seed flag. Aborting to protect live production data.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('🌱 Initializing tables and starting batch seed...');
  await initDb();

  const statements: InStatement[] = [];

  // Clear existing
  statements.push('DELETE FROM order_items');
  statements.push('DELETE FROM orders');
  statements.push('DELETE FROM recommendation_logs');
  statements.push('DELETE FROM books');
  statements.push('DELETE FROM categories');
  statements.push('DELETE FROM shipping_governorates');
  statements.push('DELETE FROM site_settings');

  // 1. Site Settings
  const settings: [string, string][] = [
    ['free_shipping_threshold', '600'],
    ['bundle_discount_percent', '10'],
    ['merchant_phone', '201555779084'],
    ['merchant_email', 'store@dar-almaarefa.com'],
    ['store_name', 'مقبرة الكتب المنسية'],
    ['store_address', 'الصعيدي القديم، خلف اسكندراني بجوار بيتزا بارتي بجوار شاتوه أمام كوافير شريف موسى'],
  ];

  for (const [key, value] of settings) {
    statements.push({
      sql: 'INSERT INTO site_settings (key, value) VALUES (?, ?)',
      args: [key, value],
    });
  }

  // 2. Categories
  const categories = [
    { id: 'cat_psychology', name: 'علم النفس', slug: 'psychology', icon: 'Brain' },
    { id: 'cat_self_help', name: 'تطوير الذات', slug: 'self-help', icon: 'Sparkles' },
    { id: 'cat_philosophy', name: 'الفلسفة والتفكير', slug: 'philosophy', icon: 'Compass' },
    { id: 'cat_literature', name: 'الروايات والأدب', slug: 'literature', icon: 'BookOpen' },
    { id: 'cat_business', name: 'المال والأعمال', slug: 'business', icon: 'TrendingUp' }
  ];

  for (const cat of categories) {
    statements.push({
      sql: 'INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?)',
      args: [cat.id, cat.name, cat.slug, cat.icon],
    });
  }

  // 3. Books
  const books = [
    {
      id: 'bk_sitt_al_husn',
      slug: 'qadiyat-sitt-al-husn',
      title: 'قضية ست الحسن',
      author: 'ميرنا المهدي',
      price: 250,
      original_price: 290,
      stock_quantity: 10,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, أدب الجريمة والغموض, الرواية البوليسية المصرية',
      reader_level: 'intermediate',
      page_count: 320,
      reading_time_hours: 6.5,
      why_read: 'الجزء الأول من سلسلة تحقيقات نوح الألفي الشهيرة؛ جرائم متفرقة تبدو بلا رابط وألغاز مشوقة تكشف عن موهبة بوليسية استثنائية تحبس الأنفاس.',
      excerpt_text: '«ذبح طالبة جامعية في سيارتها بميدان التحرير، وصحفي شهير يتحول إلى رماد داخل شقته دون أن تمس النيران شيئاً سواه... هكذا بدأت أولى القضايا المستعصية أمام نوح الألفي.»',
      cover_image: '/covers/qadiyat-sitt-al-husn.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_lawz_murr'
    },
    {
      id: 'bk_lawz_murr',
      slug: 'qadiyat-lawz-murr',
      title: 'قضية لوز مر',
      author: 'ميرنا المهدي',
      price: 250,
      original_price: 290,
      stock_quantity: 8,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, ألغاز القتل والسموم, التشويق والإثارة',
      reader_level: 'intermediate',
      page_count: 310,
      reading_time_hours: 6.0,
      why_read: 'الجزء الثاني من ملحمة نوح الألفي؛ خيوط جريمة جديدة تستند إلى سم السيانيد واللوز المر، وتأخذك إلى متاهة من الشكوك والانعطافات المفاجئة.',
      excerpt_text: '«رائحة اللوز المر لم تكن سوى نذير شؤم يسبق سقوط الضحية التالية... ونوح الألفي يدرك أن القاتل هذه المرة يسبقه بخطوة دائماً.»',
      cover_image: '/covers/qadiyat-lawz-murr.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_inab_al_thalab'
    },
    {
      id: 'bk_inab_al_thalab',
      slug: 'qadiyat-inab-al-thalab',
      title: 'قضية عنب الثعلب',
      author: 'ميرنا المهدي',
      price: 250,
      original_price: 290,
      stock_quantity: 8,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, غموض وجريمة, نباتات سامة',
      reader_level: 'intermediate',
      page_count: 340,
      reading_time_hours: 7.0,
      why_read: 'الجزء الثالث من تحقيقات نوح الألفي؛ جريمة معقدة تتداخل فيها الدوافع النفسية مع أسرار النباتات السامة في حبكة بوليسية مشدودة الأعصاب.',
      excerpt_text: '«ثمرات عنب الثعلب السوداء اللامعة تغري بالاقتراب، لكن قطرة واحدة من عصارتها تكفي لإسكات نبض قلب إلى الأبد...»',
      cover_image: '/covers/qadiyat-inab-al-thalab.jpg',
      is_bestseller: 1,
      is_featured: 0,
      recommended_next_book_id: 'bk_dhayl_al_qitt'
    },
    {
      id: 'bk_dhayl_al_qitt',
      slug: 'qadiyat-dhayl-al-qitt',
      title: 'قضية ذيل القط',
      author: 'ميرنا المهدي',
      price: 250,
      original_price: 290,
      stock_quantity: 8,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, صراع الشرطة والمجرمين, إثارة بوليسية',
      reader_level: 'intermediate',
      page_count: 330,
      reading_time_hours: 6.5,
      why_read: 'الجزء الرابع من السلسلة؛ تصاعد خطير في وتيرة الجرائم وألغاز متتابعة تضع بصيرة نوح الألفي الاستثنائية في أصعب اختباراتها.',
      excerpt_text: '«حينما تتشابك خيوط الجريمة كذيل قط هائج، يصبح البحث عن الحقيقة مقامرة قد تكلف المحقق حياته وعقله معاً.»',
      cover_image: '/covers/qadiyat-dhayl-al-qitt.jpg',
      is_bestseller: 1,
      is_featured: 0,
      recommended_next_book_id: 'bk_makhalib_al_qitt'
    },
    {
      id: 'bk_makhalib_al_qitt',
      slug: 'qadiyat-makhalib-al-qitt',
      title: 'قضية مخالب القط',
      author: 'ميرنا المهدي',
      price: 300,
      original_price: 350,
      stock_quantity: 7,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, الجريمة المنظمة, ألغاز مستعصية',
      reader_level: 'intermediate',
      page_count: 360,
      reading_time_hours: 7.5,
      why_read: 'الجزء الخامس من السلسلة البوليسية الأشهر؛ مواجهة مباشرة مع مخالب قاتل محترف لا يترك وراءه أي أثر سوى الخوف والحيرة.',
      excerpt_text: '«الضحايا يسقطون الواحد تلو الآخر بطرق لا تخطر على بال، والآثار تدل على مخالب لا ترحم تتربص في عتمة الليل...»',
      cover_image: '/covers/qadiyat-makhalib-al-qitt.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_sanawat_saba'
    },
    {
      id: 'bk_sanawat_saba',
      slug: 'qadiyat-al-sanawat-al-saba',
      title: 'قضية السنوات السبع',
      author: 'ميرنا المهدي',
      price: 300,
      original_price: 350,
      stock_quantity: 7,
      category_id: 'cat_literature',
      sub_topics: 'تحقيقات نوح الألفي, أسرار مدفونة, غموض كورونا وحظر التجوال',
      reader_level: 'intermediate',
      page_count: 350,
      reading_time_hours: 7.0,
      why_read: 'الجزء السادس المشوق؛ رأس مقطوع يتدحرج في ليلة حظر التجوال ليعيد فتح ملفات سرية تعود لسبع سنوات مضت من الأسرار المدفونة.',
      excerpt_text: '«صرخة في شقة الجيران تكسر صمت الحظر الشامل، ورأس مقطوع أمام الثلاجة يعيد نوح وقطز إلى قضية ظن الجميع أنها دفنت منذ سبع سنوات.»',
      cover_image: '/covers/qadiyat-al-sanawat-al-saba.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_jazz_wa_rock'
    },
    {
      id: 'bk_jazz_wa_rock',
      slug: 'jazz-wa-rock',
      title: 'جاز وروك',
      author: 'ميرنا المهدي',
      price: 300,
      original_price: 350,
      stock_quantity: 6,
      category_id: 'cat_literature',
      sub_topics: 'قائمة أغاني السفاح المثالي, إثارة نفسية, موسيقى وجريمة',
      reader_level: 'intermediate',
      page_count: 290,
      reading_time_hours: 6.0,
      why_read: 'الرواية الأولى من سلسلة "قائمة أغاني السفاح المثالي"؛ مزيج عبقري بين صخب الروك وشجن الجاز مع جريمة نفسية غير تقليدية.',
      excerpt_text: '«كل نغمة موسيقية تعزف في الخلفية تصاحب ضربة محسوبة بدقة... قائمة أغاني السفاح لا تخطئ إيقاعها أبداً.»',
      cover_image: '/covers/jazz-wa-rock.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_qunbula'
    },
    {
      id: 'bk_qunbula',
      slug: 'qunbula-lil-istikhdam-al-shakhsi',
      title: 'قنبلة للاستخدام الشخصي',
      author: 'ميرنا المهدي',
      price: 300,
      original_price: 350,
      stock_quantity: 6,
      category_id: 'cat_literature',
      sub_topics: 'روايات سياسية تاريخية, صراع وجاسوسية, أحداث معاصرة',
      reader_level: 'advanced',
      page_count: 310,
      reading_time_hours: 6.5,
      why_read: 'رواية سياسية وجاسوسية ملحمية مستوحاة من وقائع حقيقية وتاريخ الصراع، تغوص في النفس الإنسانية ودوائر الانتقام والمقاومة.',
      excerpt_text: '«في زمن اشتعال الأرض، لا تكون القنبلة مجرد سلاح متفجر، بل تصبح الملاذ الأخير لروح تبحث عن استرداد كرامتها المسلوبة.»',
      cover_image: '/covers/qunbula-lil-istikhdam-al-shakhsi.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_al_mijwar'
    },
    {
      id: 'bk_al_mijwar',
      slug: 'al-mijwar',
      title: 'المجوار',
      author: 'د. أحمد خالد توفيق',
      price: 300,
      original_price: 350,
      stock_quantity: 6,
      category_id: 'cat_literature',
      sub_topics: 'أدب الغموض والرعب, العراب أحمد خالد توفيق, إثارة وتشويق',
      reader_level: 'intermediate',
      page_count: 280,
      reading_time_hours: 5.5,
      why_read: 'عمل سردي مميز بقلم العراب أحمد خالد توفيق، يغوص في أعماق العوالم الغامضة بأسلوبه الساخر المشوق الذي يخاطب العقول والقلوب.',
      excerpt_text: '«هناك أشياء نمر بجوارها كل يوم دون أن ننتبه أنها تراقبنا بصمت، وحينما تقرر هي أن تلتفت نحونا، تتغير كل قواعد اللعبة...»',
      cover_image: '/covers/al-mijwar.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: 'bk_al_hawl'
    },
    {
      id: 'bk_al_hawl',
      slug: 'al-hawl',
      title: 'الهول',
      author: 'د. أحمد خالد توفيق',
      price: 250,
      original_price: 300,
      stock_quantity: 8,
      category_id: 'cat_literature',
      sub_topics: 'أدب الرعب والفانتازيا, مجموعات قصصية, رعب نفسي وكوزمي',
      reader_level: 'intermediate',
      page_count: 224,
      reading_time_hours: 4.5,
      why_read: 'ثماني حكايات كابوسية من أروع ما كتب د. أحمد خالد توفيق في أدب الرعب الماورائي والفانتازيا، تبحث في مخاوف الإنسان الأزلية مما وراء المألوف.',
      excerpt_text: '«الهول ليس ما تراه عينك، بل ما يمليه عليك خيالك في الظلام حينما تعلم أنك لست وحدك في الغرفة المغلقة...»',
      cover_image: '/covers/al-hawl.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    }
  ];

  for (const b of books) {
    statements.push({
      sql: `
        INSERT INTO books (
          id, slug, title, author, price, original_price, stock_quantity,
          category_id, sub_topics, reader_level, page_count, reading_time_hours,
          why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        b.id, b.slug, b.title, b.author, b.price, b.original_price, b.stock_quantity,
        b.category_id, b.sub_topics, b.reader_level, b.page_count, b.reading_time_hours,
        b.why_read, b.excerpt_text, b.cover_image, b.is_bestseller, b.is_featured, b.recommended_next_book_id
      ],
    });
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
    statements.push({
      sql: 'INSERT INTO shipping_governorates (id, name, fee, delivery_days) VALUES (?, ?, ?, ?)',
      args: [g.id, g.name, g.fee, g.delivery_days],
    });
  }

  // Execute all inserts atomically in a single batch transaction
  await batch(statements, 'write');

  console.log(`✅ Batch seed completed successfully: ${books.length} books, ${categories.length} categories, ${governorates.length} governorates.`);
}

if (require.main === module || process.argv.includes('--run')) {
  runSeed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
}
