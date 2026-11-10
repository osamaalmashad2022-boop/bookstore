import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { queryAll, queryOne, execute } from '../db/database';
import { searchBooksMetadata } from '../services/googleBooks';

const router = Router();

let ephemeralAdminSecret: string | null = null;

export function getAdminSecret(): string {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    return process.env.ADMIN_PASSWORD.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL CONFIGURATION ERROR: ADMIN_PASSWORD environment variable must be set in production. ' +
      'Ephemeral keys are not permitted in production as they break across multi-instance clusters.'
    );
  }
  if (!ephemeralAdminSecret) {
    ephemeralAdminSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ ADMIN_PASSWORD not set in environment. Generated random ephemeral admin secret.');
  }
  return ephemeralAdminSecret;
}

function safeCompareSecret(provided: string, actual: string): boolean {
  if (typeof provided !== 'string' || typeof actual !== 'string') return false;
  const hashProvided = crypto.createHash('sha256').update(provided.trim()).digest();
  const hashActual = crypto.createHash('sha256').update(actual.trim()).digest();
  return crypto.timingSafeEqual(hashProvided, hashActual);
}

function getHmacKey(): Buffer {
  return crypto.createHash('sha256').update(getAdminSecret() + '_token_salt').digest();
}

export function generateAdminToken(): string {
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', getHmacKey()).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, providedHmac] = parts;
    if (!providedHmac || providedHmac.length !== 64 || !/^[0-9a-f]{64}$/i.test(providedHmac)) {
      return false;
    }

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', getHmacKey()).update(payload).digest('hex');

    const providedBuf = Buffer.from(providedHmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return false;
    }

    const [role, timestampStr] = payload.split(':');
    if (role !== 'admin') return false;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    const maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days
    if (Date.now() - timestamp > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

// POST /api/admin/login - Authenticate admin with secret key (Constant-time comparison)
router.post('/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const adminSecret = getAdminSecret();
    if (password && safeCompareSecret(String(password), adminSecret)) {
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

    if (!title || !author || price === undefined || !category_id) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال اسم الكتاب والمؤلف والسعر والتصنيف' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, error: 'سعر الكتاب غير صالح' });
    }

    let parsedOriginalPrice: number | null = null;
    if (original_price !== undefined && original_price !== null && original_price !== '') {
      const parsed = parseFloat(original_price);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, error: 'السعر الأصلي غير صالح' });
      }
      parsedOriginalPrice = parsed;
    }

    let parsedStock = 5;
    if (stock_quantity !== undefined && stock_quantity !== null && stock_quantity !== '') {
      const parsed = parseInt(stock_quantity, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, error: 'كمية المخزون غير صالحة' });
      }
      parsedStock = parsed;
    }

    let parsedPageCount = 200;
    if (page_count !== undefined && page_count !== null && page_count !== '') {
      const parsed = parseInt(page_count, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ success: false, error: 'عدد الصفحات غير صالح' });
      }
      parsedPageCount = parsed;
    }

    let parsedReadingTime = 4;
    if (reading_time_hours !== undefined && reading_time_hours !== null && reading_time_hours !== '') {
      const parsed = parseFloat(reading_time_hours);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ success: false, error: 'وقت القراءة غير صالح' });
      }
      parsedReadingTime = parsed;
    } else {
      parsedReadingTime = parseFloat((parsedPageCount / 50).toFixed(1));
    }

    const uuid = crypto.randomUUID().replace(/-/g, '');
    const id = `bk_${uuid.slice(0, 12)}`;

    const cleanTitle = String(title).trim();
    const slugBase = cleanTitle
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/gi, '')
      .replace(/\s+/g, '-') || 'book';
    const slug = `${slugBase}-${uuid.slice(12, 18)}`;

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const finalReaderLevel = validLevels.includes(reader_level) ? reader_level : 'beginner';

    await execute(`
      INSERT INTO books (
        id, slug, title, author, price, original_price, stock_quantity,
        category_id, sub_topics, reader_level, page_count, reading_time_hours,
        why_read, excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      slug,
      cleanTitle,
      String(author).trim(),
      parsedPrice,
      parsedOriginalPrice,
      parsedStock,
      category_id,
      sub_topics || '',
      finalReaderLevel,
      parsedPageCount,
      parsedReadingTime,
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
    const existingBook = await queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
    if (!existingBook) {
      return res.status(404).json({ success: false, error: 'الكتاب غير موجود' });
    }

    const {
      title, author, price, original_price, stock_quantity, category_id,
      sub_topics, reader_level, page_count, reading_time_hours, why_read,
      excerpt_text, cover_image, is_bestseller, is_featured, recommended_next_book_id
    } = req.body;

    const updates: Record<string, any> = {};

    if (title !== undefined) {
      const cleanTitle = String(title).trim();
      if (!cleanTitle) return res.status(400).json({ success: false, error: 'اسم الكتاب لا يمكن أن يكون فارغاً' });
      updates.title = cleanTitle;
    }

    if (author !== undefined) {
      const cleanAuthor = String(author).trim();
      if (!cleanAuthor) return res.status(400).json({ success: false, error: 'اسم المؤلف لا يمكن أن يكون فارغاً' });
      updates.author = cleanAuthor;
    }

    if (price !== undefined) {
      const p = parseFloat(price);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, error: 'سعر الكتاب غير صالح' });
      updates.price = p;
    }

    if (original_price !== undefined) {
      if (original_price === null || original_price === '') {
        updates.original_price = null;
      } else {
        const op = parseFloat(original_price);
        if (isNaN(op) || op < 0) return res.status(400).json({ success: false, error: 'السعر الأصلي غير صالح' });
        updates.original_price = op;
      }
    }

    if (stock_quantity !== undefined) {
      const sq = parseInt(stock_quantity, 10);
      if (isNaN(sq) || sq < 0) return res.status(400).json({ success: false, error: 'كمية المخزون غير صالحة' });
      updates.stock_quantity = sq;
    }

    if (category_id !== undefined) {
      if (!category_id) return res.status(400).json({ success: false, error: 'التصنيف مطلوب' });
      updates.category_id = category_id;
    }

    if (sub_topics !== undefined) updates.sub_topics = String(sub_topics);

    if (reader_level !== undefined) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(reader_level)) {
        return res.status(400).json({ success: false, error: 'مستوى القارئ غير صالح' });
      }
      updates.reader_level = reader_level;
    }

    if (page_count !== undefined) {
      const pc = parseInt(page_count, 10);
      if (isNaN(pc) || pc <= 0) return res.status(400).json({ success: false, error: 'عدد الصفحات غير صالح' });
      updates.page_count = pc;
    }

    if (reading_time_hours !== undefined) {
      const rt = parseFloat(reading_time_hours);
      if (isNaN(rt) || rt < 0) return res.status(400).json({ success: false, error: 'وقت القراءة غير صالح' });
      updates.reading_time_hours = rt;
    }

    if (why_read !== undefined) updates.why_read = String(why_read);
    if (excerpt_text !== undefined) updates.excerpt_text = String(excerpt_text);
    if (cover_image !== undefined) updates.cover_image = String(cover_image);
    if (is_bestseller !== undefined) updates.is_bestseller = is_bestseller ? 1 : 0;
    if (is_featured !== undefined) updates.is_featured = is_featured ? 1 : 0;
    if (recommended_next_book_id !== undefined) updates.recommended_next_book_id = recommended_next_book_id || null;

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const args = [...Object.values(updates), id];
      await execute(`UPDATE books SET ${setClauses} WHERE id = ?`, args);
    }

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
    await execute(`UPDATE books SET recommended_next_book_id = NULL WHERE recommended_next_book_id = ?`, [id]);
    await execute(`DELETE FROM books WHERE id = ?`, [id]);
    res.json({ success: true, message: 'تم حذف الكتاب بنجاح' });
  } catch (error: any) {
    console.error('Admin delete book error:', error);
    if (error.message?.includes('FOREIGN KEY')) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن حذف هذا الكتاب مباشرة لأنه مرتبط بطلبات شراء مسجلة في سجلات المقبرة.'
      });
    }
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
    const parsedFee = parseFloat(fee);
    if (isNaN(parsedFee) || parsedFee < 0) {
      return res.status(400).json({ success: false, error: 'قيمة الشحن غير صالحة' });
    }
    await execute(`
      UPDATE shipping_governorates
      SET fee = ?, delivery_days = ?
      WHERE id = ?
    `, [parsedFee, delivery_days || '', id]);
    res.json({ success: true, message: 'تم تحديث سعر الشحن' });
  } catch (error: any) {
    console.error('Admin shipping rate update error:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء تحديث سعر الشحن' });
  }
});

export default router;
