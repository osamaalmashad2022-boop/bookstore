import * as crypto from 'node:crypto';
import { queryAll, queryOne, execute, batch } from './server/src/db/database';
import { getSmartRecommendation } from './server/src/services/recommender';
import { searchBooksMetadata } from './server/src/services/googleBooks';
import { generateWhatsAppMessage, generateWhatsAppUrl } from './server/src/services/whatsapp';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DATABASE_URL?: string;
  DATABASE_AUTH_TOKEN?: string;
  ADMIN_PASSWORD?: string;
  MERCHANT_PHONE?: string;
  STORE_NAME?: string;
  FREE_SHIPPING_THRESHOLD?: string;
  BUNDLE_DISCOUNT_PERCENT?: string;
  ALLOWED_ORIGINS?: string;
}

function maskPhone(phone: string): string {
  if (!phone) return '';
  const clean = String(phone).trim();
  if (clean.length <= 4) return '***';
  return clean.slice(0, 3) + '*'.repeat(Math.max(3, clean.length - 6)) + clean.slice(-3);
}

function maskAddress(addr: string): string {
  if (!addr) return '';
  const clean = String(addr).trim();
  if (clean.length <= 5) return '***';
  return clean.slice(0, 5) + '... (مخفي للخصوصية)';
}

function maskName(name: string): string {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts.slice(1).map(p => p[0] + '.').join(' ')}`;
}

function getCorsHeaders(request: Request, env?: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);

  let allowedOrigin = '';
  if (origin) {
    if (origin === url.origin) {
      allowedOrigin = origin;
    } else {
      const devOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ];

      const configuredOrigins = env?.ALLOWED_ORIGINS
        ? env.ALLOWED_ORIGINS.split(',').map((s: string) => s.trim())
        : [];

      const isExplicitlyAllowed = devOrigins.includes(origin) || configuredOrigins.includes(origin);

      // Restrict strictly to project-specific domains (never allow arbitrary Cloudflare tenants)
      const isProjectDomain =
        /^https:\/\/(?:[a-z0-9-]+\.)?dar-almaarefa\.com$/i.test(origin) ||
        /^https:\/\/(?:[a-z0-9-]+\.)?maqbara-books\.com$/i.test(origin) ||
        /^https:\/\/bookstore(?:-[a-z0-9-]+)?\.pages\.dev$/i.test(origin) ||
        /^https:\/\/maqbara(?:-[a-z0-9-]+)?\.pages\.dev$/i.test(origin) ||
        /^https:\/\/arabic-bookstore(?:-[a-z0-9-]+)?\.pages\.dev$/i.test(origin) ||
        /^https:\/\/bookstore(?:-[a-z0-9-]+)?\.workers\.dev$/i.test(origin);

      if (isExplicitlyAllowed || isProjectDomain) {
        allowedOrigin = origin;
      }
    }
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
    'Vary': 'Origin',
  };

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function json(data: any, status = 200, corsHeaders: Record<string, string> = {}, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

function safeParseFloat(val: any, fallback = 0): number {
  const n = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function safeParseInt(val: any, fallback = 0): number {
  const n = typeof val === 'number' ? Math.floor(val) : parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

function getHmacKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret + '_token_salt').digest();
}

function generateAdminToken(secret: string): string {
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const hmacKey = getHmacKey(secret);
  const hmac = crypto.createHmac('sha256', hmacKey).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function verifyAdminToken(token: string, secret?: string): boolean {
  if (!token || !secret) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, providedHmac] = parts;
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const hmacKey = getHmacKey(secret);
    const expectedHmac = crypto.createHmac('sha256', hmacKey).update(payload).digest('hex');

    const providedBuf = Buffer.from(providedHmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return false;
    }

    const [role, timestampStr] = payload.split(':');
    if (role !== 'admin') return false;
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days
    if (Date.now() - timestamp > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);
    const reply = (data: any, status = 200, extra: Record<string, string> = {}) => json(data, status, corsHeaders, extra);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // 2. Delegate Non-API Requests to Static Assets with SPA fallback
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    const path = url.pathname;
    const method = request.method;

    try {
      // Health check
      if (path === '/api/health' || path === '/health') {
        return reply({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'Dar Al-Maarefa Bookstore Platform (Cloudflare Worker + Turso)',
          mode: 'Perpetual Zero-Cost Full-Stack',
        });
      }

      // ============================================================
      // ADMIN ROUTES
      // ============================================================

      // POST /api/admin/login
      if (path === '/api/admin/login' && method === 'POST') {
        const adminSecret = env.ADMIN_PASSWORD;
        if (!adminSecret) {
          return reply({ success: false, error: 'كلمة مرور الإدارة غير مهيأة على خادم التطبيق' }, 500);
        }

        const body = await request.json().catch(() => ({})) as any;
        const password = body?.password;

        if (password && String(password).trim() === adminSecret.trim()) {
          const token = generateAdminToken(adminSecret);
          return reply({ success: true, token });
        }
        return reply({ success: false, error: 'مفتاح الحارس غير صحيح' }, 401);
      }

      // Admin authorization guard for all other /api/admin/* endpoints
      if (path.startsWith('/api/admin/')) {
        const adminSecret = env.ADMIN_PASSWORD;
        if (!adminSecret) {
          return reply({ success: false, error: 'لوحة الإدارة غير مهيأة على خادم التطبيق' }, 500);
        }

        const authHeader = request.headers.get('x-admin-token') ||
          (request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '');

        if (!verifyAdminToken(authHeader, adminSecret)) {
          return reply({ success: false, error: 'غير مصرح بالوصول إلى لوحة الإدارة' }, 401);
        }

        // GET /api/admin/google-books?q=...
        if (path === '/api/admin/google-books' && method === 'GET') {
          const q = url.searchParams.get('q') || '';
          if (!q.trim()) {
            return reply({ success: false, error: 'يرجى تقديم اسم الكتاب أو الـ ISBN' }, 400);
          }
          const result = await searchBooksMetadata(q);
          return reply({
            success: true,
            results: result.items,
            source: result.source,
            quotaExceeded: result.quotaExceeded,
            message: result.message,
          });
        }

        // GET /api/admin/books
        if (path === '/api/admin/books' && method === 'GET') {
          const books = await queryAll(`
            SELECT b.*, c.name as category_name
            FROM books b
            JOIN categories c ON b.category_id = c.id
            ORDER BY b.created_at DESC
          `, [], env);
          return reply({ success: true, books });
        }

        // POST /api/admin/books
        if (path === '/api/admin/books' && method === 'POST') {
          const b = await request.json() as any;
          if (!b.title || !b.author || !b.price || !b.category_id) {
            return reply({ success: false, error: 'يرجى إدخال اسم الكتاب والمؤلف والسعر والتصنيف' }, 400);
          }

          const price = safeParseFloat(b.price, 0);
          if (price <= 0) {
            return reply({ success: false, error: 'يرجى إدخال سعر صالح للكتاب' }, 400);
          }

          const originalPrice = (b.original_price != null && b.original_price !== '') ? safeParseFloat(b.original_price, 0) : null;
          const stockQuantity = Math.max(0, safeParseInt(b.stock_quantity, 5));
          const pageCount = Math.max(1, safeParseInt(b.page_count, 200));

          const rawReadingTime = b.reading_time_hours != null && b.reading_time_hours !== ''
            ? safeParseFloat(b.reading_time_hours, 0)
            : safeParseFloat(pageCount / 50, 4);
          const readingTimeHours = rawReadingTime > 0 ? Number(rawReadingTime.toFixed(1)) : 4;

          const id = 'bk_' + crypto.randomUUID();
          const slug = b.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s\u0600-\u06FF]/gi, '')
            .replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);

          await execute(`
            INSERT INTO books (
              id, slug, title, author, price, original_price, stock_quantity,
              category_id, sub_topics, reader_level, page_count, reading_time_hours,
              why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id, slug, b.title, b.author, price,
            originalPrice,
            stockQuantity, b.category_id, b.sub_topics || '',
            b.reader_level || 'beginner', pageCount,
            readingTimeHours, b.why_read || 'كتاب قيم يثري حصيلتك المعرفية وتفكيرك.',
            b.excerpt_text || '',
            b.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
            b.is_bestseller ? 1 : 0, b.is_featured ? 1 : 0,
            b.recommended_next_book_id || null,
          ], env);

          const createdBook = await queryOne(`SELECT * FROM books WHERE id = ?`, [id], env);
          return reply({ success: true, book: createdBook });
        }

        // PUT /api/admin/books/:id
        const bookEditMatch = path.match(/^\/api\/admin\/books\/([^\/]+)$/);
        if (bookEditMatch && method === 'PUT') {
          const id = bookEditMatch[1];
          const b = await request.json() as any;

          const price = safeParseFloat(b.price, 0);
          if (price <= 0) {
            return reply({ success: false, error: 'يرجى إدخال سعر صالح للكتاب' }, 400);
          }

          const originalPrice = (b.original_price != null && b.original_price !== '') ? safeParseFloat(b.original_price, 0) : null;
          const stockQuantity = Math.max(0, safeParseInt(b.stock_quantity, 0));
          const pageCount = Math.max(1, safeParseInt(b.page_count, 200));

          const rawReadingTime = b.reading_time_hours != null && b.reading_time_hours !== ''
            ? safeParseFloat(b.reading_time_hours, 0)
            : safeParseFloat(pageCount / 50, 4);
          const readingTimeHours = rawReadingTime > 0 ? Number(rawReadingTime.toFixed(1)) : 4;

          await execute(`
            UPDATE books SET
              title = ?, author = ?, price = ?, original_price = ?, stock_quantity = ?,
              category_id = ?, sub_topics = ?, reader_level = ?, page_count = ?,
              reading_time_hours = ?, why_read = ?, excerpt_text = ?, cover_image = ?,
              is_bestseller = ?, is_featured = ?, recommended_next_book_id = ?
            WHERE id = ?
          `, [
            b.title, b.author, price,
            originalPrice,
            stockQuantity, b.category_id, b.sub_topics || '', b.reader_level || 'beginner',
            pageCount, readingTimeHours, b.why_read || '',
            b.excerpt_text || '', b.cover_image || '', b.is_bestseller ? 1 : 0, b.is_featured ? 1 : 0,
            b.recommended_next_book_id || null, id,
          ], env);

          const updated = await queryOne(`SELECT * FROM books WHERE id = ?`, [id], env);
          return reply({ success: true, book: updated });
        }

        // DELETE /api/admin/books/:id
        if (bookEditMatch && method === 'DELETE') {
          const id = bookEditMatch[1];
          try {
            await execute(`UPDATE books SET recommended_next_book_id = NULL WHERE recommended_next_book_id = ?`, [id], env);
            await execute(`DELETE FROM books WHERE id = ?`, [id], env);
            return reply({ success: true, message: 'تم حذف الكتاب بنجاح' });
          } catch (e: any) {
            if (e.message?.includes('FOREIGN KEY')) {
              return reply({
                success: false,
                error: 'لا يمكن حذف هذا الكتاب مباشرة لأنه مرتبط بطلبات شراء مسجلة في سجلات المتجر.'
              }, 400);
            }
            throw e;
          }
        }

        // GET /api/admin/orders
        if (path === '/api/admin/orders' && method === 'GET') {
          const orders = await queryAll(`
            SELECT o.*, g.name as governorate_name
            FROM orders o
            JOIN shipping_governorates g ON o.governorate_id = g.id
            ORDER BY o.created_at DESC
          `, [], env);

          if (orders.length === 0) {
            return reply({ success: true, orders: [] });
          }

          const orderIds = orders.map((o: any) => o.id);
          const placeholders = orderIds.map(() => '?').join(',');
          const allItems = await queryAll(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds, env);

          const itemsByOrderId: Record<string, any[]> = {};
          for (const item of allItems) {
            if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
            itemsByOrderId[item.order_id].push(item);
          }

          const ordersWithItems = orders.map((order: any) => ({
            ...order,
            items: itemsByOrderId[order.id] || [],
          }));

          return reply({ success: true, orders: ordersWithItems });
        }

        // PATCH /api/admin/orders/:id/status
        const orderStatusMatch = path.match(/^\/api\/admin\/orders\/([^\/]+)\/status$/);
        if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
          const id = orderStatusMatch[1];
          const { status } = await request.json() as any;
          const validStatuses = ['PENDING_WHATSAPP_CONFIRMATION', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
          if (!validStatuses.includes(status)) {
            return reply({ success: false, error: 'حالة الطلب غير صالحة' }, 400);
          }
          await execute(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], env);
          return reply({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
        }

        // GET /api/admin/shipping-rates
        if (path === '/api/admin/shipping-rates' && method === 'GET') {
          const governorates = await queryAll(`SELECT * FROM shipping_governorates ORDER BY fee ASC, name ASC`, [], env);
          return reply({ success: true, governorates });
        }

        // PUT /api/admin/shipping-rates/:id
        const shipMatch = path.match(/^\/api\/admin\/shipping-rates\/([^\/]+)$/);
        if (shipMatch && method === 'PUT') {
          const id = shipMatch[1];
          const { fee, delivery_days } = await request.json() as any;
          const feeNum = safeParseFloat(fee, 0);
          await execute(`UPDATE shipping_governorates SET fee = ?, delivery_days = ? WHERE id = ?`, [
            feeNum, delivery_days, id,
          ], env);
          return reply({ success: true, message: 'تم تحديث سعر الشحن' });
        }

        // GET /api/admin/analytics
        if (path === '/api/admin/analytics' && method === 'GET') {
          const logs = await queryAll(`SELECT * FROM recommendation_logs ORDER BY created_at DESC LIMIT 50`, [], env);
          const totalOrders = await queryOne(`SELECT COUNT(*) as count, SUM(final_total) as revenue FROM orders`, [], env);
          const lowStockBooks = await queryAll(`SELECT title, stock_quantity FROM books WHERE stock_quantity <= 3`, [], env);

          return reply({
            success: true,
            totalOrders: totalOrders?.count || 0,
            totalRevenue: totalOrders?.revenue || 0,
            lowStockBooks,
            recentQueries: logs,
          });
        }
      }

      // ============================================================
      // STOREFRONT & CATALOG ROUTES
      // ============================================================

      // GET /api/books/categories
      if ((path === '/api/books/categories' || path === '/api/categories') && method === 'GET') {
        const categories = await queryAll(`
          SELECT c.*, COUNT(b.id) as book_count
          FROM categories c
          LEFT JOIN books b ON c.id = b.category_id
          GROUP BY c.id
          ORDER BY c.name ASC
        `, [], env);
        return reply({ success: true, categories });
      }

      // GET /api/books/shipping-governorates
      if ((path === '/api/books/shipping-governorates' || path === '/api/shipping-governorates') && method === 'GET') {
        const governorates = await queryAll(`SELECT * FROM shipping_governorates ORDER BY fee ASC, name ASC`, [], env);
        return reply({ success: true, governorates });
      }

      // GET /api/settings
      if (path === '/api/settings' && method === 'GET') {
        const rows = await queryAll(`SELECT key, value FROM site_settings`, [], env);
        const settings: Record<string, string> = {};
        rows.forEach((r: any) => { settings[r.key] = r.value; });
        return reply({ success: true, settings });
      }

      // GET /api/books (Catalog Filter & Search)
      if (path === '/api/books' && method === 'GET') {
        const category = url.searchParams.get('category');
        const level = url.searchParams.get('level');
        const minPrice = url.searchParams.get('minPrice');
        const maxPrice = url.searchParams.get('maxPrice');
        const search = url.searchParams.get('search');
        const inStock = url.searchParams.get('inStock');
        const bestseller = url.searchParams.get('bestseller');
        const featured = url.searchParams.get('featured');

        let sql = `
          SELECT b.*, c.name as category_name, c.slug as category_slug
          FROM books b
          JOIN categories c ON b.category_id = c.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (category && category !== 'all') {
          sql += ` AND (c.slug = ? OR c.id = ?)`;
          params.push(category, category);
        }
        if (level && level !== 'all') {
          sql += ` AND b.reader_level = ?`;
          params.push(level);
        }
        if (minPrice && Number.isFinite(parseFloat(minPrice))) {
          sql += ` AND b.price >= ?`;
          params.push(parseFloat(minPrice));
        }
        if (maxPrice && Number.isFinite(parseFloat(maxPrice))) {
          sql += ` AND b.price <= ?`;
          params.push(parseFloat(maxPrice));
        }
        if (inStock === 'true' || inStock === '1') {
          sql += ` AND b.stock_quantity > 0`;
        }
        if (bestseller === 'true' || bestseller === '1') {
          sql += ` AND b.is_bestseller = 1`;
        }
        if (featured === 'true' || featured === '1') {
          sql += ` AND b.is_featured = 1`;
        }
        if (search) {
          const searchTerm = `%${String(search).trim()}%`;
          sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.sub_topics LIKE ? OR b.why_read LIKE ?)`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY b.is_featured DESC, b.is_bestseller DESC, b.created_at DESC`;

        const books = await queryAll(sql, params, env);
        return reply({ success: true, count: books.length, books });
      }

      // GET /api/books/:idOrSlug
      const singleBookMatch = path.match(/^\/api\/books\/([^\/]+)$/);
      if (singleBookMatch && method === 'GET') {
        const idOrSlug = singleBookMatch[1];
        const book = await queryOne(`
          SELECT b.*, c.name as category_name, c.slug as category_slug
          FROM books b
          JOIN categories c ON b.category_id = c.id
          WHERE b.id = ? OR b.slug = ?
        `, [idOrSlug, idOrSlug], env);

        if (!book) {
          return reply({ success: false, error: 'الكتاب غير موجود' }, 404);
        }

        let nextBook = null;
        if (book.recommended_next_book_id) {
          nextBook = await queryOne(`
            SELECT id, slug, title, author, price, cover_image, reader_level
            FROM books WHERE id = ?
          `, [book.recommended_next_book_id], env);
        }

        const relatedBooks = await queryAll(`
          SELECT id, slug, title, author, price, cover_image, reader_level
          FROM books
          WHERE category_id = ? AND id != ? AND stock_quantity > 0
          LIMIT 3
        `, [book.category_id, book.id], env);

        return reply({ success: true, book, nextBook, relatedBooks });
      }

      // POST /api/recommend (Smart Book Advisor)
      if ((path === '/api/recommend' || path === '/recommend') && method === 'POST') {
        const body = await request.json() as any;
        const { mode, quiz, query } = body || {};

        if (!mode || (mode !== 'quiz' && mode !== 'natural')) {
          return reply({ success: false, error: 'يجب تحديد وضع البحث (quiz أو natural)' }, 400);
        }
        if (mode === 'natural' && (!query || !query.trim())) {
          return reply({ success: false, error: 'يرجى كتابة استفسارك أو المجال المطلوب ترشيح كتب فيه' }, 400);
        }

        const recommendation = await getSmartRecommendation({ mode, quiz, query }, env);
        return reply({ success: true, ...recommendation });
      }

      // GET /api/orders/:orderRef (Track Order with PII privacy masking for public callers)
      const orderTrackMatch = path.match(/^\/api\/orders\/([^\/]+)$/);
      if (orderTrackMatch && method === 'GET') {
        const orderRef = orderTrackMatch[1];
        const order = await queryOne(`
          SELECT o.*, g.name as governorate_name
          FROM orders o
          JOIN shipping_governorates g ON o.governorate_id = g.id
          WHERE o.order_ref = ?
        `, [orderRef], env);

        if (!order) {
          return reply({ success: false, error: 'الطلب غير موجود' }, 404);
        }

        const items = await queryAll(`
          SELECT id, order_id, book_id, title, price, quantity FROM order_items WHERE order_id = ?
        `, [order.id], env);

        const authHeader = request.headers.get('x-admin-token') ||
          (request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '');
        const isAdmin = verifyAdminToken(authHeader, env.ADMIN_PASSWORD);

        if (isAdmin) {
          return reply({ success: true, order, items });
        }

        // Mask sensitive PII for public tracking
        const safeOrder = {
          id: order.id,
          order_ref: order.order_ref,
          status: order.status,
          created_at: order.created_at,
          governorate_name: order.governorate_name,
          total_books_price: order.total_books_price,
          discount_amount: order.discount_amount,
          shipping_fee: order.shipping_fee,
          final_total: order.final_total,
          customer_name: maskName(order.customer_name),
          customer_phone: maskPhone(order.customer_phone),
          customer_whatsapp: maskPhone(order.customer_whatsapp),
          street_address: maskAddress(order.street_address),
        };

        return reply({ success: true, order: safeOrder, items });
      }

      // POST /api/orders (Place COD Order)
      if ((path === '/api/orders' || path === '/orders') && method === 'POST') {
        const {
          customer_name, customer_phone, customer_whatsapp,
          governorate_id, street_address, notes, items, is_bundle,
          coupon_code,
        } = await request.json() as any;

        if (!customer_name || !customer_phone || !governorate_id || !street_address) {
          return reply({ success: false, error: 'يرجى استكمال جميع بيانات العميل والعنوان والمحافظة' }, 400);
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
          return reply({ success: false, error: 'سلة المشتريات فارغة' }, 400);
        }

        const governorate = await queryOne(`SELECT * FROM shipping_governorates WHERE id = ?`, [governorate_id], env);
        if (!governorate) {
          return reply({ success: false, error: 'المحافظة المختارة غير صحيحة' }, 400);
        }

        const settingsRows = await queryAll(`SELECT key, value FROM site_settings`, [], env);
        const settings: Record<string, string> = {};
        settingsRows.forEach((r: any) => { settings[r.key] = r.value; });

        const merchantPhone = env.MERCHANT_PHONE || settings['merchant_phone'] || '201555779084';
        const freeShippingThreshold = safeParseFloat(env.FREE_SHIPPING_THRESHOLD || settings['free_shipping_threshold'], 600);
        const bundleDiscountPercent = safeParseFloat(env.BUNDLE_DISCOUNT_PERCENT || settings['bundle_discount_percent'], 10);

        // 3. Validate stock and calculate items total (Batch-fetched: avoids N+1 queries)
        const bookIds = Array.from(new Set(items.map((i: any) => i.book_id).filter(Boolean)));
        if (bookIds.length === 0) {
          return reply({ success: false, error: 'سلة المشتريات لا تحتوي على كتب صالحة' }, 400);
        }

        const placeholders = bookIds.map(() => '?').join(',');
        const books = await queryAll(`SELECT * FROM books WHERE id IN (${placeholders})`, bookIds, env);
        const booksMap = new Map<string, any>(books.map((b: any) => [b.id, b]));

        let totalBooksPrice = 0;
        const validatedItems: Array<{ book: any; quantity: number }> = [];

        for (const item of items) {
          const book = booksMap.get(item.book_id);
          if (!book) {
            return reply({ success: false, error: `الكتاب المعرف بـ ${item.book_id} غير متوفر في المتجر` }, 400);
          }
          const requestedQty = Math.max(1, safeParseInt(item.quantity, 1));
          if (book.stock_quantity < requestedQty) {
            return reply({ success: false, error: `الكمية المتاحة من كتاب "${book.title}" هي ${book.stock_quantity} فقط` }, 400);
          }
          totalBooksPrice += book.price * requestedQty;
          validatedItems.push({ book, quantity: requestedQty });
        }

        // 4. Calculate discount & coupon handling
        let discountAmount = 0;
        let discountReason = '';

        const validCoupons: Record<string, number> = {
          'MAQBARA10': 10,
          'READ10': 10,
          'WARAQ10': 10,
        };

        const cleanCoupon = typeof coupon_code === 'string' ? coupon_code.trim().toUpperCase() : '';
        const couponPercent = validCoupons[cleanCoupon] || 0;

        if (couponPercent > 0) {
          discountAmount = Math.round((totalBooksPrice * couponPercent) / 100);
          discountReason = `كود خصم (${cleanCoupon} - ${couponPercent}%)`;
        } else if (is_bundle) {
          discountAmount = Math.round((totalBooksPrice * bundleDiscountPercent) / 100);
          discountReason = `خصم باقة مسار القراءة (${bundleDiscountPercent}%)`;
        }

        const priceAfterDiscount = totalBooksPrice - discountAmount;
        let shippingFee = safeParseFloat(governorate.fee, 0);
        if (priceAfterDiscount >= freeShippingThreshold) {
          shippingFee = 0;
        }

        const finalTotal = priceAfterDiscount + shippingFee;
        const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
        const timestampSuffix = Date.now().toString(36).toUpperCase();
        const orderRef = `ORD-${timestampSuffix}-${uuid.slice(0, 6)}`;
        const orderId = `order_${crypto.randomUUID()}`;

        // 5. Build atomic transaction batch for order, items, and conditional stock decrements
        const batchStatements: Array<{ sql: string; args: any[] }> = [
          {
            sql: `
              INSERT INTO orders (
                id, order_ref, customer_name, customer_phone, customer_whatsapp,
                governorate_id, street_address, notes, total_books_price,
                discount_amount, shipping_fee, final_total, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_WHATSAPP_CONFIRMATION')
            `,
            args: [
              orderId, orderRef, customer_name, customer_phone,
              customer_whatsapp || customer_phone, governorate_id,
              street_address, notes || '', totalBooksPrice,
              discountAmount, shippingFee, finalTotal,
            ],
          },
        ];

        for (const v of validatedItems) {
          const itemId = `item_${crypto.randomUUID()}`;
          batchStatements.push({
            sql: `INSERT INTO order_items (id, order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [itemId, orderId, v.book.id, v.book.title, v.book.price, v.quantity],
          });
          // Conditional decrement: if stock is insufficient, triggers NOT NULL constraint failure which aborts and rolls back transaction
          batchStatements.push({
            sql: `
              UPDATE books
              SET stock_quantity = CASE
                WHEN stock_quantity >= ? THEN stock_quantity - ?
                ELSE NULL
              END
              WHERE id = ?
            `,
            args: [v.quantity, v.quantity, v.book.id],
          });
        }

        try {
          const results = await batch(batchStatements, 'write', env);
          // Verify rowsAffected for stock updates
          for (let i = 0; i < validatedItems.length; i++) {
            const updateResultIndex = 1 + (i * 2) + 1;
            const res = results[updateResultIndex];
            if (!res || res.rowsAffected !== 1) {
              throw new Error('INSUFFICIENT_STOCK: Stock quantity changed during checkout');
            }
          }
        } catch (batchErr: any) {
          if (batchErr.message && (
            batchErr.message.includes('NOT NULL constraint failed') ||
            batchErr.message.includes('INSUFFICIENT_STOCK') ||
            batchErr.message.includes('CONSTRAINT')
          )) {
            return reply({ success: false, error: 'عذراً، نفدت كمية أحد الكتب المطلوبة أثناء تسجيل طلبك' }, 400);
          }
          throw batchErr;
        }

        const whatsappMessage = generateWhatsAppMessage({
          orderRef,
          customerName: customer_name,
          customerPhone: customer_phone,
          customerWhatsapp: customer_whatsapp || customer_phone,
          governorateName: governorate.name,
          streetAddress: street_address,
          notes,
          items: validatedItems.map(v => ({
            title: v.book.title,
            price: v.book.price,
            quantity: v.quantity,
          })),
          discountAmount,
          discountReason,
          totalBooksPrice,
          shippingFee,
          finalTotal,
          merchantPhone,
        });

        const whatsappUrl = generateWhatsAppUrl(merchantPhone, whatsappMessage);

        return reply({
          success: true,
          orderRef,
          orderId,
          finalTotal,
          shippingFee,
          discountAmount,
          whatsappUrl,
          whatsappMessage,
        });
      }

      return reply({ success: false, error: 'المسار المطلوب غير موجود' }, 404);
    } catch (err: any) {
      console.error('Worker API error:', err);
      return reply({ success: false, error: err.message || 'حدث خطأ في الخادم' }, 500);
    }
  },
};
