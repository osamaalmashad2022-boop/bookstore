import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { queryAll, queryOne, execute } from '../db/database';
import { searchGoogleBooks, searchBooksMetadata } from '../services/googleBooks';

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_PASSWORD || 'maqbara_gothic_sentinel_2026';
const HMAC_KEY = crypto.createHash('sha256').update(ADMIN_SECRET + '_token_salt').digest();

function generateAdminToken(): string {
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', HMAC_KEY).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function verifyAdminToken(token: string): boolean {
  if (!token) return false;

  // Direct secret match for CLI scripts and development convenience
  if (token.trim() === ADMIN_SECRET.trim()) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, providedHmac] = parts;
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', HMAC_KEY).update(payload).digest('hex');

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

// POST /api/admin/login - Authenticate admin with secret key
router.post('/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (password && String(password).trim() === ADMIN_SECRET.trim()) {
      const token = generateAdminToken();
      return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, error: 'مفتاح الحارس السري غير صحيح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء التحقق من كلمة السر' });
  }
});

// Admin Authorization Middleware - Protects ALL /api/admin/* endpoints
router.use((req: Request, res: Response, next) => {
  const token = (req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '')) as string;
  if (token && verifyAdminToken(token)) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'غير مصرح بالوصول إلى لوحة الإدارة. يرجى إدخال مفتاح الحارس السري.'
  });
});

// GET /api/admin/google-books - 1-Click Smart Auto-Fill metadata
router.get('/google-books', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, error: 'يرجى تقديم اسم الكتاب أو الـ ISBN' });
    }
    const result = await searchBooksMetadata(query);
    res.json({
      success: true,
      results: result.items,
      source: result.source,
      quotaExceeded: result.quotaExceeded,
      message: result.message
    });
  } catch (error: any) {
    console.error('Admin Google Books error:', error);
    res.status(500).json({ success: false, error: 'فشل جلب بيانات الكتاب تلقائياً' });
  }
});

// GET /api/admin/books - List all books for dashboard
router.get('/books', async (_req: Request, res: Response) => {
  try {
    const books = await queryAll(`
      SELECT b.*, c.name as category_name
      FROM books b
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, books });
  } catch (error: any) {
    console.error('Admin get books error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب قائمة الكتب' });
  }
});

// POST /api/admin/books - Add book manually or from auto-fill
router.post('/books', async (req: Request, res: Response) => {
  try {
    const {
      title, author, price, original_price, stock_quantity, category_id,
      sub_topics, reader_level, page_count, reading_time_hours, why_read,
      excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
    } = req.body;

    if (!title || !author || !price || !category_id) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال اسم الكتاب والمؤلف والسعر والتصنيف' });
    }

    const id = 'bk_' + Date.now();
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0600-\u06FF]/gi, '')
      .replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const calcReadingTime = reading_time_hours || (page_count ? (page_count / 50).toFixed(1) : 4);

    await execute(`
      INSERT INTO books (
        id, slug, title, author, price, original_price, stock_quantity,
        category_id, sub_topics, reader_level, page_count, reading_time_hours,
        why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      slug,
      title,
      author,
      parseFloat(price),
      original_price ? parseFloat(original_price) : null,
      parseInt(stock_quantity) || 5,
      category_id,
      sub_topics || '',
      reader_level || 'beginner',
      parseInt(page_count) || 200,
      parseFloat(calcReadingTime),
      why_read || 'كتاب قيم يثري حصيلتك المعرفية وتفكيرك.',
      excerpt_text || '',
      cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      is_bestseller ? 1 : 0,
      is_featured ? 1 : 0,
      recommended_next_book_id || null,
    ]);

    const createdBook = await queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
    res.json({ success: true, book: createdBook });
  } catch (error: any) {
    console.error('Admin add book error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء إضافة الكتاب' });
  }
});

// PUT /api/admin/books/:id - Edit existing book
router.put('/books/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, author, price, original_price, stock_quantity, category_id,
      sub_topics, reader_level, page_count, reading_time_hours, why_read,
      excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
    } = req.body;

    await execute(`
      UPDATE books SET
        title = ?, author = ?, price = ?, original_price = ?, stock_quantity = ?,
        category_id = ?, sub_topics = ?, reader_level = ?, page_count = ?,
        reading_time_hours = ?, why_read = ?, excerpt_text = ?, cover_image = ?,
        is_bestseller = ?, is_featured = ?, recommended_next_book_id = ?
      WHERE id = ?
    `, [
      title, author, parseFloat(price), original_price ? parseFloat(original_price) : null,
      parseInt(stock_quantity), category_id, sub_topics, reader_level,
      parseInt(page_count), parseFloat(reading_time_hours), why_read,
      excerpt_text, cover_image, is_bestseller ? 1 : 0, is_featured ? 1 : 0,
      recommended_next_book_id || null, id
    ]);

    const updated = await queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
    res.json({ success: true, book: updated });
  } catch (error: any) {
    console.error('Admin update book error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء تحديث بيانات الكتاب' });
  }
});

// DELETE /api/admin/books/:id - Delete book
router.delete('/books/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await execute(`DELETE FROM books WHERE id = ?`, [id]);
    res.json({ success: true, message: 'تم حذف الكتاب بنجاح' });
  } catch (error: any) {
    console.error('Admin delete book error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء حذف الكتاب' });
  }
});

// GET /api/admin/orders - View all orders with items
router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await queryAll(`
      SELECT o.*, g.name as governorate_name
      FROM orders o
      JOIN shipping_governorates g ON o.governorate_id = g.id
      ORDER BY o.created_at DESC
    `);

    if (orders.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    // Fetch items for all orders in a single SQL query
    const orderIds = orders.map((o: any) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const allItems = await queryAll(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds);

    const itemsByOrderId: Record<string, any[]> = {};
    for (const item of allItems) {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      itemsByOrderId[item.order_id].push(item);
    }

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    res.json({ success: true, orders: ordersWithItems });
  } catch (error: any) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب قائمة الطلبات' });
  }
});

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'PENDING_WHATSAPP_CONFIRMATION',
      'CONFIRMED_WHATSAPP',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'حالة الطلب غير صالحة' });
    }

    await execute(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (error: any) {
    console.error('Admin update status error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء تحديث حالة الطلب' });
  }
});

// GET /api/admin/analytics - Recommendation insights & content gap
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const logs = await queryAll(`
      SELECT * FROM recommendation_logs
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const totalOrders = await queryOne(`SELECT COUNT(*) as count, SUM(final_total) as revenue FROM orders`);
    const lowStockBooks = await queryAll(`SELECT title, stock_quantity FROM books WHERE stock_quantity <= 3`);

    res.json({
      success: true,
      totalOrders: totalOrders?.count || 0,
      totalRevenue: totalOrders?.revenue || 0,
      lowStockBooks,
      recentQueries: logs,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
});

// PUT /api/admin/shipping-rates - Update shipping fee per governorate
router.put('/shipping-rates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fee, delivery_days } = req.body;
    await execute(`
      UPDATE shipping_governorates
      SET fee = ?, delivery_days = ?
      WHERE id = ?
    `, [parseFloat(fee), delivery_days, id]);
    res.json({ success: true, message: 'تم تحديث سعر الشحن' });
  } catch (error: any) {
    console.error('Admin shipping rate update error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء تحديث سعر الشحن' });
  }
});

export default router;

