# Mobile-First Physical Bookstore & Smart Book Recommender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Overview
A lightweight, mobile-first Arabic RTL physical bookstore web application that runs 100% free-forever. It eliminates Next.js in favor of a clean **Vite + React (SPA) + Tailwind CSS** frontend paired with a lightweight **Node.js/Express + SQLite** backend. It includes a deterministic + hybrid Smart Book Advisor, WhatsApp COD checkout with governorate shipping calculation, and an admin dashboard with 1-click Google Books metadata auto-fill.

## Directory & File Structure
```
├── package.json                 # Monorepo/Root scripts (dev, build, start)
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql       # SQLite tables (books, categories, governorates, orders, items, logs)
│   │   │   ├── database.ts      # SQLite connection & helper methods (better-sqlite3)
│   │   │   └── seed.ts          # Rich Arabic books & Egyptian governorates seeder
│   │   ├── routes/
│   │   │   ├── books.ts         # Catalog search, filtering, product details
│   │   │   ├── advisor.ts       # Smart Book Advisor algorithm (quiz + natural query + reading path)
│   │   │   ├── orders.ts        # Order placement, WhatsApp link generation, inventory reservation
│   │   │   └── admin.ts         # Book CRUD, Google Books auto-fill, order status, analytics
│   │   ├── services/
│   │   │   ├── recommender.ts   # Deterministic hybrid scoring + local fallback + cache
│   │   │   ├── whatsapp.ts      # WhatsApp invoice payload builder
│   │   │   └── googleBooks.ts   # Free public Google Books API wrapper
│   │   └── index.ts             # Express app setup, CORS, API mounting
│   ├── tsconfig.json
│   └── package.json
├── client/
│   ├── index.html               # RTL setup, Cairo & Readex Pro fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx   # Mobile Top bar & Bottom Navigation Bar
│   │   │   ├── BookCard.tsx     # Mobile-optimized book card with DNA badges & stock status
│   │   │   ├── BookDetailModal.tsx # Book overview, Book DNA, Look Inside preview excerpt
│   │   │   ├── SmartAdvisor.tsx # 3-Step Quiz & Natural Language Search + Reading Path Bundle
│   │   │   ├── CartDrawer.tsx   # Persistent slide-over / bottom sheet cart with shipping progress
│   │   │   ├── CheckoutModal.tsx# Governorate shipping selector & WhatsApp COD submission
│   │   │   └── admin/
│   │   │       ├── BookManager.tsx     # Add/Edit book with Google Books 1-Click Auto-Fill
│   │   │       ├── OrderManager.tsx    # Order status tracking & 1-click WhatsApp customer contact
│   │   │       └── ShippingManager.tsx # Governorate shipping fees configuration
│   │   ├── context/
│   │   │   └── CartContext.tsx  # LocalStorage-synced cart state & bundle discount calculation
│   │   ├── types/
│   │   │   └── index.ts         # Shared TypeScript interfaces (Book, Order, AdvisorResult, etc.)
│   │   ├── App.tsx              # Main routing & view state (Storefront, Advisor, Admin)
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind CSS directives & Arabic typography styling
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
└── README.md                    # Zero-Cost Forever setup & deployment guide
```

---

## Tasks

### Task 1: Project Scaffolding & Root Configuration
- [ ] Initialize root `package.json` with workspace configuration or concurrent dev scripts.
- [ ] Setup `server/` with TypeScript, `express`, `cors`, `better-sqlite3`, `@types/better-sqlite3`.
- [ ] Setup `client/` with Vite, React, TypeScript, Tailwind CSS, Lucide icons.
- [ ] Configure `client/index.html` with `dir="rtl"`, `lang="ar"`, and Google Fonts (`Cairo`).
- [ ] Verify root build and dev scripts execute cleanly.

### Task 2: Database Schema, SQLite Driver & Rich Arabic Seeding
- [ ] Write `server/src/db/schema.sql` defining:
  - `categories` (id, name, slug, icon)
  - `books` (id, slug, title, author, price, original_price, stock_quantity, category_id, sub_topics, reader_level, page_count, reading_time_hours, why_read, excerpt_text, cover_image, is_bestseller, is_featured, created_at)
  - `shipping_governorates` (id, name, fee, delivery_days)
  - `orders` (id, order_ref, customer_name, customer_phone, customer_whatsapp, governorate_id, street_address, notes, total_books_price, discount_amount, shipping_fee, final_total, status, created_at)
  - `order_items` (id, order_id, book_id, title, price, quantity)
  - `recommendation_logs` (id, query_or_quiz, matched_books, created_at)
  - `site_settings` (key, value)
- [ ] Write `server/src/db/database.ts` initialization and queries wrapper.
- [ ] Write `server/src/db/seed.ts` with authentic Arabic books (Psychology, Philosophy, Self-Development, Literature) and all Egyptian governorates with shipping rates.
- [ ] Run seed script and test that database queries return expected counts.

### Task 3: Backend API & Recommendation Engine
- [ ] Implement `server/src/services/recommender.ts`:
  - Deterministic attribute + keyword matching (category, level, subtopics, page count).
  - Multi-step reading path generation (2 to 3 progressive books from foundational to deep).
  - In-stock inventory grounding (`stock_quantity > 0`).
  - In-memory semantic caching for frequent queries.
  - Optional Gemini Flash API polish wrapper with safe fallback.
- [ ] Implement `server/src/services/whatsapp.ts`:
  - Structured Arabic invoice generator matching the prompt schema.
- [ ] Implement `server/src/services/googleBooks.ts`:
  - Public Google Books API proxy for ISBN/title metadata lookup.
- [ ] Mount REST routes (`/api/books`, `/api/categories`, `/api/shipping-governorates`, `/api/recommend`, `/api/orders`, `/api/admin/*`).
- [ ] Write unit/API tests for recommender and order flow.

### Task 4: Mobile-First Frontend Storefront & Book Discovery
- [ ] Implement mobile navigation in `client/src/components/Navigation.tsx` (Top header with search & cart counter, fixed Bottom Navigation Bar).
- [ ] Implement `BookCard.tsx` with high-conversion mobile UI:
  - Cover image, stock badges (`متوفر`, `متبقي X فقط`, `نفد`), level badge, page count, price.
  - Quick "أضف للسلة" button.
- [ ] Implement `BookDetailModal.tsx`:
  - Book DNA badges (مستوى القارئ، وقت القراءة المقدر).
  - "لماذا تقرأ هذا الكتاب؟".
  - "تصفح مقتطف من الكتاب" (interactive excerpt & contents tab).
- [ ] Implement catalog filtering (Category pills, Reader Level, Price slider, In-Stock toggle).

### Task 5: Interactive Smart Book Advisor (مستشار الكتب الذكي) UI
- [ ] Build `client/src/components/SmartAdvisor.tsx`:
  - **Mode A (3-Step Interactive Quiz)**:
    - Step 1: المجال (علم النفس، الفلسفة، تطوير الذات، إلخ).
    - Step 2: المستوى القرائي (مبتدئ يبحث عن مدخل مبسط، قارئ متوسط، متعمق).
    - Step 3: الهدف أو الموضوع الفرعي المفضل وطول الكتاب.
  - **Mode B (Natural Language Search)**:
    - Free-form Arabic query with sample quick-prompts.
  - **Recommendations Display**:
    - Primary Match card with "لماذا نرشح لك هذا الكتاب؟" and "أبرز الفوائد والنتائج".
    - 2-3 Book Progressive Reading Path (مسار قراءة متدرج).
    - "أضف المسار الكامل للسلة بخصم الباقة (10%)" button.

### Task 6: Slide-Over Cart, Governorate Shipping & WhatsApp COD Checkout
- [ ] Build `client/src/context/CartContext.tsx` with `localStorage` persistence, bundle discount logic, and quantity controls.
- [ ] Build `client/src/components/CartDrawer.tsx` (mobile bottom-sheet / slide-over):
  - Cart items list with thumbnail, price, and +/- controls.
  - Dynamic free shipping progress bar.
- [ ] Build `client/src/components/CheckoutModal.tsx`:
  - Form fields: Full Name, Phone, WhatsApp, Governorate dropdown, Address, Notes.
  - Dynamic shipping cost display based on selected governorate.
  - Calculation of COD Total.
  - On submit: call `/api/orders`, obtain order reference and open pre-formatted `wa.me` WhatsApp link.

### Task 7: Merchant Admin Dashboard
- [ ] Build `client/src/components/admin/BookManager.tsx`:
  - Book listing with quick stock edit and delete.
  - "إضافة كتاب جديد" form with **"1-Click Auto-Fill" (جلب البيانات تلقائياً)** querying Google Books API.
- [ ] Build `client/src/components/admin/OrderManager.tsx`:
  - Orders list with status badges (`جديد`, `مؤكد واتساب`, `تم الشحن`, `تم التسليم`, `ملغي`).
  - 1-click WhatsApp customer contact button.
- [ ] Build `client/src/components/admin/ShippingManager.tsx`:
  - Update shipping fees per governorate and free shipping threshold.
- [ ] Build Recommendation Analytics widget (most requested topics & zero-result logs).

### Task 8: End-to-End Verification, Documentation & Zero-Cost Forever Guide
- [ ] Verify complete user flow on mobile viewport:
  - Browse catalog & filter.
  - Run Smart Book Advisor quiz & add reading path bundle.
  - Complete checkout with governorate selection & verify WhatsApp URL format.
  - Test Admin book addition with Google Books auto-fill.
- [ ] Create `.env.example` and write comprehensive `README.md` with zero-cost deployment instructions (Vercel/Netlify for frontend, Render/Railway/Fly.io for backend, Turso/SQLite for DB).
