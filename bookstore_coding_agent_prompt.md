# Coding Agent Prompt: Perpetual Zero-Cost Physical Bookstore & Smart Book Recommender (English Version)

Copy and paste the structured English prompt below directly into your coding agent (Claude Code, Cursor, Windsurf, or Cline).

## Ready-to-Use Prompt

&lt;role&gt;
You are a Principal Full-Stack &amp; AI Engineer and E-Commerce Solutions Architect specializing in building high-conversion, zero-maintenance web applications on Perpetual Free-Forever ($0/month) cloud infrastructure. You write clean, type-safe, production-ready code with native Arabic Right-to-Left (RTL) UI/UX and resilient, zero-expiry recommendation engines.
&lt;/role&gt;

&lt;context&gt;
We are building a complete, production-ready online bookstore for **physical books only**, designed to be handed over to a client as a finished, turnkey product. Because this is a final client handover, **every single component must run on 100% Free-Forever (Always-Free) tiers or self-contained open-source logic** so that nothing expires, breaks, or requires paid renewals after 1, 2, or 5+ years.

Core Business Requirements:
1. Product Type: Physical books only (requires inventory stock tracking and automatic shipping fee calculation by Governorate/City).
2. Checkout & Payment Flow: **Cash on Delivery (COD)** paired with a **Structured WhatsApp Order Checkout**. When a customer places an order, the system saves the order in the database, sends an email alert to the merchant, and opens a pre-formatted WhatsApp message to the store owner's number with the full invoice and delivery details.
3. Catalog Entry Workflow: The store owner will add books and prices **manually** via the Admin Dashboard. To make manual entry effortless, the Admin Book Form must include a **"1-Click Smart Auto-Fill"** button that queries the free public Google Books / Open Library API by book title or ISBN to auto-populate the cover image, author, page count, and description, while allowing full manual editing.
4. Signature Feature — **"Smart Book Advisor / Recommender" (مستشار الكتب الذكي)**: Customers frequently ask the store owner for book recommendations in specific fields (e.g., Psychology / علم النفس, Philosophy, Self-Development) tailored to their reading level. We need an interactive in-store tool that recommends individual books and progressive 2-to-3 book Reading Paths from in-stock inventory.

Approved 100% Free-Forever Tech Stack (Zero Expiring Trials & Mobile-First Simplicity):
- Framework & UI: **Vite + React (SPA) + TypeScript + Tailwind CSS** (strictly avoid Next.js complexity/SSR/hydration overhead. Ultra-fast, lightweight mobile-first UI with Bottom Navigation Bar, touch-friendly bottom sheets/drawers, and native Arabic RTL typography with Cairo / Readex Pro).
- Backend API & Server: **Node.js (Express / Fastify)** lightweight REST API serving the storefront, cart, checkout, admin, and recommendation engine.
- Hosting: **Vercel / Netlify (for frontend) + Render / Fly.io / Railway / Deno** (100% Free-Forever tiers, zero expiring trials).
- Database & Search: **Turso Serverless SQLite / SQLite** (5 GB storage + 500M row reads/month Free Forever, instant responses, zero credit card required).
- Media & Book Covers CDN: **Cloudinary Free Forever Tier** (25 monthly renewing credits = 25 GB storage + 25 GB bandwidth + automatic WebP/AVIF compression) OR **Scaleway Object Storage** (75 GB Free Forever).
- Authentication: Self-contained database/cookie session auth (**Auth.js / Jose JWT**) or **WorkOS AuthKit** (Free Forever up to 1,000,000 MAUs) for the Merchant Admin Dashboard.
- Merchant Email Notifications: **Brevo Free Forever Plan** (300 emails/day = 9,000/month Free Forever) or **Mailjet Free Tier** (6,000 emails/month Free Forever).
- Zero-Expiry Hybrid Recommendation Engine:
  * **Primary Permanent Engine (100% Free Forever, Zero External API Dependency):** A deterministic + semantic hybrid scoring engine running directly against the database (matching Category, Sub-Topics, Reader Level, Page Count/Reading Goal, Keywords, and pre-computed Embeddings via local `@xenova/transformers` / `EmbeddingGemma 2` or SQL Full-Text/Vector scoring).
  * **Optional Conversational Polish Layer (With Automatic Zero-Downtime Fallback):** An optional wrapper supporting a monthly-renewing free LLM API (e.g., Gemini Flash-Lite Free Tier) routed through **Helicone Semantic Caching** (100,000 requests/month Free Forever). If the API key is omitted, rate-limited, or deprecated years from now, the engine automatically falls back to the local database recommendation engine with zero errors or downtime.
&lt;/context&gt;

&lt;instructions&gt;
Design and implement the complete application across the following four architectural modules:

1. Arabic RTL Storefront & Book Discovery Experience:
   - Build a responsive Arabic RTL storefront featuring: Hero Banner with a prominent CTA for the **"Smart Book Advisor" (مستشار الكتب الذكي)**, Featured Categories (e.g., علم النفس، الفلسفة، تطوير الذات، الروايات، التاريخ، الإدارة), Bestsellers, and New Arrivals.
   - Implement advanced catalog filtering and sorting (by Category, Sub-topic, Reader Level: Beginner/Intermediate/Advanced, Page Count range, Price range, and In-Stock toggle).
   - Build the Book Product Page (`/[slug]`) with:
     * High-resolution cover, title, author, price, and real-time stock badge (`متوفر` / `متبقي X نسخ فقط` / `نفدت الكمية`).
     * **Book DNA Badges**: Difficulty Level (`مبتدئ` / `متوسط` / `متقدم`), Page Count, Estimated Reading Time (e.g., `~5 ساعات قراءة`), and a concise `"لماذا تقرأ هذا الكتاب؟"` (Why Read This Book) callout.
     * **"Look Inside / Preview Excerpt" (تصفح مقتطف من الكتاب)**: A modal showing the Table of Contents, a text excerpt, or sample page images.

2. "Smart Book Advisor" (مستشار الكتب الذكي) & Reading Path Builder:
   - Build a dual-mode interactive recommendation interface accessible from the navbar and homepage:
     * **Mode A — 3-Step Interactive Quiz:**
       - Step 1: Select field of interest (e.g., `علم النفس`, `تطوير الذات`, `الفلسفة`, `الأدب`).
       - Step 2: Select current reading level in this field (`مبتدئ يبحث عن مدخل مبسط`, `قارئ متوسط`, `متعمق`).
       - Step 3: Select specific goal or sub-topic (e.g., for Psychology: `فهم الذات والقلق`, `تحليل السلوك والشخصيات`, `علم نفس العلاقات`, `علم النفس المعرفي`) and preferred book length.
     * **Mode B — Natural Language Search:** Customers type free-form Arabic queries (e.g., `"رشح لي كتاب في علم النفس للمبتدئين يفهمني السلوك البشري بدون تعقيد"`).
   - Recommendation Output & Upsell Mechanics:
     * Query ONLY books where `stock_quantity > 0`.
     * Return a **Top Primary Match** with a clear personalized explanation (`"لماذا نرشح لك هذا الكتاب؟"`) and key takeaways.
     * Generate a **Progressive Reading Path (مسار قراءة متدرج من 2 إلى 3 كتب)** ordered from foundational (`Step 1: المدخل`) to deeper application (`Step 2 & 3`), using `recommended_next_book_id` or category/level progression.
     * Include a **"1-Click Add Full Reading Path to Cart with Bundle Discount" (أضف المسار الكامل للسلة بخصم الباقة)** button to increase Average Order Value (AOV).

3. Slide-Over Cart, Governorate Shipping Calculator & WhatsApp COD Checkout:
   - Build a persistent Slide-Over Cart (`localStorage` synced) with a dynamic progress bar showing how much remains to unlock discounted/free shipping or bundle savings.
   - Build a streamlined **Physical Book Checkout Form**:
     * Fields: Full Name (`الاسم بالكامل`), Phone Number (`رقم الهاتف`), WhatsApp Number (`رقم الواتساب`), Governorate Dropdown (`المحافظة`), Detailed Street Address (`العنوان بالتفصيل`), and Delivery Notes (`ملاحظات التوصيل`).
     * Automatically calculate and display the exact shipping cost as soon as the customer selects their Governorate, and compute the final **Cash on Delivery (COD) Total**.
   - On Checkout Submission:
     1. Validate stock and create an order record in the database with a unique reference (e.g., `ORD-1042`) and status `PENDING_WHATSAPP_CONFIRMATION`.
     2. Trigger a non-blocking transactional email notification to the merchant via Brevo/Mailjet.
     3. Generate a clean, pre-formatted Arabic WhatsApp invoice message and redirect/open `https://wa.me/<MERCHANT_PHONE>?text=<ENCODED_INVOICE>` so the customer confirms the COD order directly on WhatsApp.

4. Merchant Admin Dashboard (Effortless Manual Book Entry & Operations):
   - Build a protected `/admin` dashboard optimized for both desktop and mobile use by the store owner.
   - **Smart Manual Book Entry Form:**
     * Allow the merchant to type a Book Title or ISBN and click **"جلب البيانات تلقائياً" (Auto-Fill Metadata)** to fetch title, author, cover image URL, page count, and summary from the free Google Books API (`https://www.googleapis.com/books/v1/volumes?q=...`), while letting the merchant edit every field or upload a custom cover image to Cloudinary.
     * Include simple inputs for: Price (`السعر`), Stock Quantity (`الكمية المتوفرة`), Category (`التصنيف`), Sub-Topics tags (`المواضيع الفرعية`), Reader Level (`مبتدئ / متوسط / متقدم`), `"لماذا تقرأ هذا الكتاب؟"` (1-sentence pitch used by the recommender), Table of Contents / Excerpt text, and optional Next Recommended Book in Path.
     * Automatically compute and store the book's search vector/keywords upon saving so it immediately appears in the Smart Book Advisor.
   - **Governorate Shipping & Bundle Rules Manager:** Allow the merchant to update shipping fees per Governorate, set the free-shipping threshold, and configure the Reading Path bundle discount percentage.
   - **Order Management & Content Gap Analytics:**
     * View and filter orders (`جديد`, `مؤكد واتساب`, `تم الشحن`, `تم التسليم`, `ملغي`), with 1-click stock deduction and 1-click WhatsApp customer contact link.
     * Display a **"Search & Recommendation Insights" (تحليلات طلبات الترشيح)** widget showing the most requested fields/sub-topics and zero-result queries so the store owner knows which books to stock next.
&lt;/instructions&gt;

&lt;constraints&gt;
- Enforce the **Zero-Expiry / Always-Free Constraint**: Use strictly Free-Forever tiers and open-source packages. Avoid any service that requires a credit card to stay active or relies on time-limited trial credits.
- Design the **&quot;Smart Book Advisor&quot;** with a **Local-First Hybrid Architecture**: The weighted attribute + vector/full-text matching algorithm must work 100% deterministically and accurately using only the database even when `LLM_API_KEY` is empty. When an optional free LLM key (e.g., `GEMINI_API_KEY`) is provided, wrap the call in a strict timeout and `try/catch` block that seamlessly falls back to the database-generated recommendation rationale without surfacing any error to the user.
- Enforce **100% Inventory Grounding**: Every book returned by the recommender must come directly from the `books` table with `stock_quantity &gt; 0` and real database IDs, prices, and slugs.
- Apply **Semantic Caching &amp; Rate Limiting**: Cache recommendation results for identical quiz combinations or normalized queries in the database/memory so repeated questions execute in `&lt;15ms` at zero compute cost.
- Ensure authentic **Arabic RTL UX**: Use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`), `dir=&quot;rtl&quot;` on the root HTML element, and clear Arabic typography.
&lt;/constraints&gt;

&lt;examples&gt;
1. Expected JSON Response Schema from `/api/recommend` (Smart Book Advisor):

```json
{
  "intent_summary": "قارئ مبتدئ يبحث عن مدخل مبسط وعملي في علم النفس لفهم الذات والسلوك البشري",
  "reading_path_title": "مسار التأسيس النفسي المبسط (من فهم الذات إلى تحليل السلوك)",
  "bundle_discount_percent": 10,
  "primary_recommendation": {
    "book_id": "bk_101",
    "slug": "jalasat-nafsiya",
    "title": "جلسات نفسية",
    "author": "د. محمد إبراهيم",
    "price": 180,
    "reader_level": "beginner",
    "page_count": 215,
    "match_score": 0.96,
    "why_recommended": "مدخل سلس ومبسط يشرح كيفية التعامل مع التفكير الزائد والضغوط النفسية بلغة عملية خالية من التعقيد الأكاديمي.",
    "key_takeaways": [
      "فهم جذور القلق والتفكير المفرط",
      "خطوات عملية للتعامل مع المشاعر اليومية",
      "بناء مرونة نفسية بطريقة مبسطة"
    ],
    "in_stock": true
  },
  "reading_path_steps": [
    {
      "step_number": 1,
      "step_label": "الخطوة 1: المدخل التأسيسي المبسط",
      "book_id": "bk_101",
      "title": "جلسات نفسية",
      "price": 180
    },
    {
      "step_number": 2,
      "step_label": "الخطوة 2: فهم السلوك والعادات",
      "book_id": "bk_105",
      "title": "العادات الذرية",
      "price": 220
    }
  ],
  "engine_mode": "hybrid_local_forever"
}
```

2. Expected Formatted Arabic WhatsApp Invoice Message (`wa.me` payload):

```text
📚 *طلب جديد من متجر الكتب* (#ORD-1042)
──────────────────
👤 *العميل:* أحمد محمد
📱 *الهاتف:* 010XXXXXXXX
📍 *المحافظة:* دمياط
🏠 *العنوان:* شارع الجلاء، بجوار ...
📝 *ملاحظات:* الاتصال قبل المندوب بنصف ساعة

🛒 *الكتب المطلوبة:*
1. جلسات نفسية (1 × 180 ج.م)
2. العادات الذرية (1 × 220 ج.م)
🎁 *خصم باقة مسار القراءة (10%):* -40 ج.م

📦 *إجمالي الكتب بعد الخصم:* 360 ج.م
🚚 *مصاريف الشحن (دمياط):* 55 ج.م
💰 *الإجمالي المطلوب عند الاستلام:* *415 ج.م*
──────────────────
طريقة الدفع: الدفع نقداً عند الاستلام (COD)
```
&lt;/examples&gt;

<output_format>
Execute the build systematically in the following order:
1. **Architecture & Database Schema:** Present the complete project directory structure and write the full database schema (`books`, `categories`, `shipping_governorates`, `orders`, `order_items`, `recommendation_logs`, `site_settings`) plus a seed script containing sample Arabic books (especially across Psychology / علم النفس levels) and Egyptian governorate shipping rates.
2. **Perpetual Smart Book Recommender Engine:** Write the complete backend scoring/vector/keyword algorithm (`/api/recommend`) with the Local-First engine, semantic cache, and optional LLM wrapper, followed by the interactive Arabic RTL Quiz & Search UI component.
3. **Storefront, Product Page & WhatsApp COD Checkout:** Write the Homepage, Book Product Page (with Book DNA badges & Look Inside preview modal), Slide-Over Cart, Governorate Shipping Calculator, and WhatsApp Order Generator (`/api/orders`).
4. **Merchant Admin Dashboard:** Write the `/admin` pages for adding/editing books (including the 1-Click Google Books API Auto-Fill helper), managing stock and governorate shipping fees, tracking orders, and viewing customer recommendation analytics.
5. **Zero-Cost Deployment Guide:** Provide `.env.example` and concise step-by-step instructions for deploying the database, media storage, backend API, and mobile-first Vite frontend on the Free-Forever stack.
</output_format>
