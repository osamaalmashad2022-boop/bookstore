# Code Review Remediations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all critical security flaws, race conditions, synthetic client fixtures, and code smells identified in the code review.

**Architecture:** 
1. Database layer: Remove hardcoded JWT tokens; fallback cleanly to local file-based SQLite when remote Turso credentials are not configured.
2. Order & Checkout pipeline: Enforce atomic transactional integrity and conditional stock deductions (`stock_quantity >= quantity`), collision-proof order references, and single-query order items fetching.
3. Admin Security: Issue tamper-proof tokens / hashed session validation rather than returning raw passwords.
4. Client Layer: Provide complete book data from recommender reading path to cart, eliminating synthetic dummy mock fixtures, fix SVG React attribute warnings, and provide null-safety for book tags.

**Tech Stack:** TypeScript 5.7, Express 4, @libsql/client (SQLite/Turso), React 19, Vite 6, Tailwind CSS.

**Spec:** `bookstore_coding_agent_prompt.md`

## Global Constraints
- Strictly 100% Free-Forever / Zero-Cost tiers and open-source packages.
- Zero hardcoded credentials or tokens in repository source files.
- Authentic Arabic RTL UX with Cairo / Readex Pro typography.
- Atomic stock decrements to prevent negative inventory under concurrent orders.

## Review Focus
- Database URL fallback to local SQLite without auth token when env vars are omitted.
- Concurrent order submission with insufficient stock must reject with HTTP 400 and never result in negative stock.
- Order reference collisions: random references must be unique and non-colliding.
- Adding Reading Path bundle to cart must contain actual book data from database, never mock fixtures.
- React console warnings: SVG attributes on Candle component must be warning-free.

---

### Task 1: Security & Credentials — Remove Hardcoded Turso Token
**Files:**
- Modify: `server/src/db/database.ts:8-17`
- Modify: `.gitignore`

- [ ] **Step 1: Update `.gitignore` to ensure all `.env` files across subdirectories are ignored**
- [ ] **Step 2: Refactor `server/src/db/database.ts` to remove hardcoded Turso URL and JWT token**
  Fallback to `file:./data/bookstore.db` or `file:data/bookstore.db` when `DATABASE_URL` is unset, and pass `authToken` only when present.
- [ ] **Step 3: Verify TypeScript builds and server starts cleanly**

### Task 2: Admin Security & Auth Hardening
**Files:**
- Modify: `server/src/routes/admin.ts:8-33`
- Modify: `client/src/utils/adminApi.ts`

- [ ] **Step 1: Replace raw password token reflection in `server/src/routes/admin.ts`**
  Generate a secure HMAC-SHA256 session token using the server's secret or crypto module, valid for the session, instead of returning the raw plaintext password.
- [ ] **Step 2: Update admin middleware to validate the HMAC token**
- [ ] **Step 3: Update `client/src/utils/adminApi.ts` if needed to maintain seamless authentication**

### Task 3: Data Integrity — Atomic Transactions, Safe Stock Decrement & Unique Order Ref
**Files:**
- Modify: `server/src/routes/orders.ts:50-140`
- Modify: `server/src/routes/admin.ts:175-195`

- [ ] **Step 1: Replace 4-digit order ref with collision-proof order reference**
  Generate `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`.
- [ ] **Step 2: Implement atomic transactional order creation and conditional stock deduction**
  Use `db.batch(...)` or sequential transaction with conditional verification `UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`. If any item fails stock availability, reject the transaction and return HTTP 400.
- [ ] **Step 3: Resolve N+1 query loop on `GET /api/admin/orders`**
  Fetch all order items in a single query using `IN (...)` and map to orders in memory.

### Task 4: Recommender Clean Data & Cart Integration — Eliminate Mock Fixtures
**Files:**
- Modify: `server/src/services/recommender.ts:36-46, 170-225`
- Modify: `client/src/components/SmartAdvisor.tsx:79-105`
- Modify: `client/src/types/index.ts`

- [ ] **Step 1: Update `RecommendationResult` to include full book details in reading path steps**
  Return the complete book attributes (`stock_quantity`, `category_id`, `reader_level`, `page_count`, `reading_time_hours`, `why_read`, `sub_topics`) for all steps.
- [ ] **Step 2: Update `client/src/components/SmartAdvisor.tsx` to map real book details directly to the cart**
  Remove hardcoded `'cat_psychology'`, `stock_quantity: 10`, `page_count: 200` mock fixtures.

### Task 5: Client Bugfixes & UI Polish
**Files:**
- Modify: `client/src/components/Candle.tsx:50-95`
- Modify: `client/src/components/BookDetailModal.tsx:96-105`
- Modify: `client/src/components/CandleTorch.tsx:19-38`

- [ ] **Step 1: Replace kebab-case SVG attributes `stop-color` and `stop-opacity` with camelCase `stopColor` and `stopOpacity` in `Candle.tsx`**
- [ ] **Step 2: Add null-safe fallback for `sub_topics` in `BookDetailModal.tsx` (`(book.sub_topics || '').split(',')`)**
- [ ] **Step 3: Optimize `CandleTorch.tsx` pointer event handler with `requestAnimationFrame` to prevent 60Hz React re-rendering**

### Task 6: Full Build Verification & Quality Check
- [ ] **Step 1: Run `npm run build` to confirm zero TypeScript compilation errors in client and server**
- [ ] **Step 2: Perform clean-code-guard verification across changed files**

