import crypto from 'crypto';
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
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
};

function json(data: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
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

function verifyAdminToken(token: string, secret: string): boolean {
  if (!token) return false;
  if (token.trim() === secret.trim()) return true;

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
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Delegate Non-API Requests to Static Assets with SPA fallback
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    const path = url.pathname;
    const method = request.method;
    const adminSecret = env.ADMIN_PASSWORD || '123456';

    try {
      // Health check
      if (path === '/api/health' || path === '/health') {
        return json({
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
        const body = await request.json().catch(() => ({})) as any;
        const password = body?.password;

        if (password && String(password).trim() === adminSecret.trim()) {
          const token = generateAdminToken(adminSecret);
          return json({ success: true, token });
        }
        return json({ success: false, error: 'مفتاح الحارس غير صحيح' }, 401);
      }

      // Admin authorization guard for all other /api/admin/* endpoints
      if (path.startsWith('/api/admin/')) {
        const authHeader = request.headers.get('x-admin-token') ||
          (request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '');

        if (!verifyAdminToken(authHeader, adminSecret)) {
          return json({ success: false, error: 'غير مصرح بالوصول إلى لوحة الإدارة' }, 401);
        }

        // GET /api/admin/google-books?q=...
        if (path === '/api/admin/google-books' && method === 'GET') {
          const q = url.searchParams.get('q') || '';
          if (!q.trim()) {
            return json({ success: false, error: 'يرجى تقديم اسم الكتاب أو الـ ISBN' }, 400);
          }
          const result = await searchBooksMetadata(q);
          return json({
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
          `);
          return json({ success: true, books });
        }

        // POST /api/admin/books
        if (path === '/api/admin/books' && method === 'POST') {
          const b = await request.json() as any;
          if (!b.title || !b.author || !b.price || !b.category_id) {
            return json({ success: false, error: 'يرجى إدخال اسم الكتاب والمؤلف والسعر والتصنيف' }, 400);
          }

          const id = 'bk_' + Date.now();
          const slug = b.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s\u0600-\u06FF]/gi, '')
            .replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);

          const calcReadingTime = b.reading_time_hours || (b.page_count ? (b.page_count / 50).toFixed(1) : 4);

          await execute(`
            INSERT INTO books (
              id, slug, title, author, price, original_price, stock_quantity,
              category_id, sub_topics, reader_level, page_count, reading_time_hours,
              why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id, slug, b.title, b.author, parseFloat(b.price),
            b.original_price ? parseFloat(b.original_price) : null,
            parseInt(b.stock_quantity) || 5, b.category_id, b.sub_topics || '',
            b.reader_level || 'beginner', parseInt(b.page_count) || 200,
            parseFloat(calcReadingTime), b.why_read || 'كتاب قيم يثري حصيلتك المعرفية وتفكيرك.',
            b.excerpt_text || '',
            b.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
            b.is_bestseller ? 1 : 0, b.is_featured ? 1 : 0,
            b.recommended_next_book_id || null,
          ]);

          const createdBook = await queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
          return json({ success: true, book: createdBook });
        }

        // PUT /api/admin/books/:id
        const bookEditMatch = path.match(/^\/api\/admin\/books\/([^\/]+)$/);
        if (bookEditMatch && method === 'PUT') {
          const id = bookEditMatch[1];
          const b = await request.json() as any;

          await execute(`
            UPDATE books SET
              title = ?, author = ?, price = ?, original_price = ?, stock_quantity = ?,
              category_id = ?, sub_topics = ?, reader_level = ?, page_count = ?,
              reading_time_hours = ?, why_read = ?, excerpt_text = ?, cover_image = ?,
              is_bestseller = ?, is_featured = ?, recommended_next_book_id = ?
            WHERE id = ?
          `, [
            b.title, b.author, parseFloat(b.price),
            b.original_price ? parseFloat(b.original_price) : null,
            parseInt(b.stock_quantity), b.category_id, b.sub_topics, b.reader_level,
            parseInt(b.page_count), parseFloat(b.reading_time_hours), b.why_read,
            b.excerpt_text, b.cover_image, b.is_bestseller ? 1 : 0, b.is_featured ? 1 : 0,
            b.recommended_next_book_id || null, id,
          ]);

          const updated = await queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
          return json({ success: true, book: updated });
        }

        // DELETE /api/admin/books/:id
        if (bookEditMatch && method === 'DELETE') {
          const id = bookEditMatch[1];
          await execute(`DELETE FROM books WHERE id = ?`, [id]);
          return json({ success: true, message: 'تم حذف الكتاب بنجاح' });
        }

        // GET /api/admin/orders
        if (path === '/api/admin/orders' && method === 'GET') {
          const orders = await queryAll(`
            SELECT o.*, g.name as governorate_name
            FROM orders o
            JOIN shipping_governorates g ON o.governorate_id = g.id
            ORDER BY o.created_at DESC
          `);

          if (orders.length === 0) {
            return json({ success: true, orders: [] });
          }

          const orderIds = orders.map((o: any) => o.id);
          const placeholders = orderIds.map(() => '?').join(',');
          const allItems = await queryAll(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds);

          const itemsByOrderId: Record<string, any[]> = {};
          for (const item of allItems) {
            if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
            itemsByOrderId[item.order_id].push(item);
          }

          const ordersWithItems = orders.map((order: any) => ({
            ...order,
            items: itemsByOrderId[order.id] || [],
          }));

          return json({ success: true, orders: ordersWithItems });
        }

        // PATCH /api/admin/orders/:id/status
        const orderStatusMatch = path.match(/^\/api\/admin\/orders\/([^\/]+)\/status$/);
        if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
          const id = orderStatusMatch[1];
          const { status } = await request.json() as any;
          const validStatuses = ['PENDING_WHATSAPP_CONFIRMATION', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
          if (!validStatuses.includes(status)) {
            return json({ success: false, error: 'حالة الطلب غير صالحة' }, 400);
          }
          await execute(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
          return json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
        }

        // GET /api/admin/shipping-rates
        if (path === '/api/admin/shipping-rates' && method === 'GET') {
          const governorates = await queryAll(`SELECT * FROM shipping_governorates ORDER BY fee ASC, name ASC`);
          return json({ success: true, governorates });
        }

        // PUT /api/admin/shipping-rates/:id
        const shipMatch = path.match(/^\/api\/admin\/shipping-rates\/([^\/]+)$/);
        if (shipMatch && method === 'PUT') {
          const id = shipMatch[1];
          const { fee, delivery_days } = await request.json() as any;
          await execute(`UPDATE shipping_governorates SET fee = ?, delivery_days = ? WHERE id = ?`, [
            parseFloat(fee), delivery_days, id,
          ]);
          return json({ success: true, message: 'تم تحديث سعر الشحن' });
        }

        // GET /api/admin/analytics
        if (path === '/api/admin/analytics' && method === 'GET') {
          const logs = await queryAll(`SELECT * FROM recommendation_logs ORDER BY created_at DESC LIMIT 50`);
          const totalOrders = await queryOne(`SELECT COUNT(*) as count, SUM(final_total) as revenue FROM orders`);
          const lowStockBooks = await queryAll(`SELECT title, stock_quantity FROM books WHERE stock_quantity <= 3`);

          return json({
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
        `);
        return json({ success: true, categories });
      }

      // GET /api/books/shipping-governorates
      if ((path === '/api/books/shipping-governorates' || path === '/api/shipping-governorates') && method === 'GET') {
        const governorates = await queryAll(`SELECT * FROM shipping_governorates ORDER BY fee ASC, name ASC`);
        return json({ success: true, governorates });
      }

      // GET /api/settings
      if (path === '/api/settings' && method === 'GET') {
        const rows = await queryAll(`SELECT key, value FROM site_settings`);
        const settings: Record<string, string> = {};
        rows.forEach((r: any) => { settings[r.key] = r.value; });
        return json({ success: true, settings });
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
        if (minPrice) {
          sql += ` AND b.price >= ?`;
          params.push(Number(minPrice));
        }
        if (maxPrice) {
          sql += ` AND b.price <= ?`;
          params.push(Number(maxPrice));
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

        const books = await queryAll(sql, params);
        return json({ success: true, count: books.length, books });
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
        `, [idOrSlug, idOrSlug]);

        if (!book) {
          return json({ success: false, error: 'الكتاب غير موجود' }, 404);
        }

        let nextBook = null;
        if (book.recommended_next_book_id) {
          nextBook = await queryOne(`
            SELECT id, slug, title, author, price, cover_image, reader_level
            FROM books WHERE id = ?
          `, [book.recommended_next_book_id]);
        }

        const relatedBooks = await queryAll(`
          SELECT id, slug, title, author, price, cover_image, reader_level
          FROM books
          WHERE category_id = ? AND id != ? AND stock_quantity > 0
          LIMIT 3
        `, [book.category_id, book.id]);

        return json({ success: true, book, nextBook, relatedBooks });
      }

      // POST /api/recommend (Smart Book Advisor)
      if ((path === '/api/recommend' || path === '/recommend') && method === 'POST') {
        const body = await request.json() as any;
        const { mode, quiz, query } = body || {};

        if (!mode || (mode !== 'quiz' && mode !== 'natural')) {
          return json({ success: false, error: 'يجب تحديد وضع البحث (quiz أو natural)' }, 400);
        }
        if (mode === 'natural' && (!query || !query.trim())) {
          return json({ success: false, error: 'يرجى كتابة استفسارك أو المجال المطلوب ترشيح كتب فيه' }, 400);
        }

        const recommendation = await getSmartRecommendation({ mode, quiz, query });
        return json({ success: true, ...recommendation });
      }

      // POST /api/orders (Place COD Order)
      if ((path === '/api/orders' || path === '/orders') && method === 'POST') {
        const {
          customer_name, customer_phone, customer_whatsapp,
          governorate_id, street_address, notes, items, is_bundle,
        } = await request.json() as any;

        if (!customer_name || !customer_phone || !governorate_id || !street_address) {
          return json({ success: false, error: 'يرجى استكمال جميع بيانات العميل والعنوان والمحافظة' }, 400);
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
          return json({ success: false, error: 'سلة المشتريات فارغة' }, 400);
        }

        const governorate = await queryOne(`SELECT * FROM shipping_governorates WHERE id = ?`, [governorate_id]);
        if (!governorate) {
          return json({ success: false, error: 'المحافظة المختارة غير صحيحة' }, 400);
        }

        const settingsRows = await queryAll(`SELECT key, value FROM site_settings`);
        const settings: Record<string, string> = {};
        settingsRows.forEach((r: any) => { settings[r.key] = r.value; });

        const merchantPhone = env.MERCHANT_PHONE || settings['merchant_phone'] || '201012345678';
        const freeShippingThreshold = parseFloat(env.FREE_SHIPPING_THRESHOLD || settings['free_shipping_threshold'] || '600');
        const bundleDiscountPercent = parseFloat(env.BUNDLE_DISCOUNT_PERCENT || settings['bundle_discount_percent'] || '10');

        let totalBooksPrice = 0;
        const validatedItems: Array<{ book: any; quantity: number }> = [];

        for (const item of items) {
          const book = await queryOne(`SELECT * FROM books WHERE id = ?`, [item.book_id]);
          if (!book) {
            return json({ success: false, error: `الكتاب المعرف بـ ${item.book_id} غير متوفر في المتجر` }, 400);
          }
          const requestedQty = Math.max(1, parseInt(item.quantity) || 1);
          if (book.stock_quantity < requestedQty) {
            return json({ success: false, error: `الكمية المتاحة من كتاب "${book.title}" هي ${book.stock_quantity} فقط` }, 400);
          }
          totalBooksPrice += book.price * requestedQty;
          validatedItems.push({ book, quantity: requestedQty });
        }

        let discountAmount = 0;
        if (is_bundle) {
          discountAmount = Math.round((totalBooksPrice * bundleDiscountPercent) / 100);
        }

        const priceAfterDiscount = totalBooksPrice - discountAmount;
        let shippingFee = governorate.fee;
        if (priceAfterDiscount >= freeShippingThreshold) {
          shippingFee = 0;
        }

        const finalTotal = priceAfterDiscount + shippingFee;
        const timestampSuffix = Date.now().toString(36).toUpperCase();
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const orderRef = `ORD-${timestampSuffix}-${randomSuffix}`;
        const orderId = `order_${Date.now()}_${randomSuffix}`;

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
          const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          batchStatements.push({
            sql: `INSERT INTO order_items (id, order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [itemId, orderId, v.book.id, v.book.title, v.book.price, v.quantity],
          });
          batchStatements.push({
            sql: `UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`,
            args: [v.quantity, v.book.id, v.quantity],
          });
        }

        try {
          await batch(batchStatements, 'write');
        } catch (batchErr: any) {
          if (batchErr.message && (batchErr.message.includes('INSUFFICIENT_STOCK') || batchErr.message.includes('CONSTRAINT'))) {
            return json({ success: false, error: 'عذراً، نفدت كمية أحد الكتب المطلوبة أثناء تسجيل طلبك' }, 400);
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
          totalBooksPrice,
          shippingFee,
          finalTotal,
          merchantPhone,
        });

        const whatsappUrl = generateWhatsAppUrl(merchantPhone, whatsappMessage);

        return json({
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

      return json({ success: false, error: 'المسار المطلوب غير موجود' }, 404);
    } catch (err: any) {
      console.error('Worker API error:', err);
      return json({ success: false, error: err.message || 'حدث خطأ في الخادم' }, 500);
    }
  },
};

