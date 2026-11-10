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
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['merchant_phone', '201555779084']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['merchant_email', 'store@dar-almaarefa.com']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['store_name', 'مقبرة الكتب المنسية']);
  await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['store_address', 'الصعيدي القديم، خلف اسكندراني بجوار بيتزا بارتي بجوار شاتوه أمام كوافير شريف موسى']);

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
      cover_image: '/covers/zill-al-reeh.jpg',
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
      cover_image: '/covers/leabat-al-malak.jpg',
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
      cover_image: '/covers/jalasat-nafsiya.jpg',
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
      cover_image: '/covers/al-khoroog-an-al-nas.jpg',
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
      cover_image: '/covers/alaqat-khatira.jpg',
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
      cover_image: '/covers/oqadak-al-nafsiya.jpg',
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
      cover_image: '/covers/al-insan-wa-al-bahth-an-al-maana.jpg',
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
      cover_image: '/covers/al-adat-al-thariya.jpg',
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
      cover_image: '/covers/fann-al-lamobala.jpg',
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
      cover_image: '/covers/aza-at-al-falsafa.jpg',
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
      cover_image: '/covers/alam-sofi.jpg',
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
      cover_image: '/covers/thulathiyat-gharnata.jpg',
      is_bestseller: 1,
      is_featured: 1,
      recommended_next_book_id: null
    },
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
