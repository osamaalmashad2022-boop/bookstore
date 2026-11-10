import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { queryAll, queryOne, batch } from '../db/database';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../services/whatsapp';
import { verifyAdminToken } from './admin';

const router = Router();

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

// POST /api/orders - Place order and create WhatsApp confirmation payload
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_whatsapp,
      governorate_id,
      street_address,
      notes,
      items,
      is_bundle,
      coupon_code,
    } = req.body;

    if (!customer_name || !customer_phone || !governorate_id || !street_address) {
      return res.status(400).json({
        success: false,
        error: 'يرجى استكمال جميع بيانات العميل والعنوان والمحافظة',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'سلة المشتريات فارغة',
      });
    }

    // 1. Fetch governorate details
    const governorate = await queryOne(`SELECT * FROM shipping_governorates WHERE id = ?`, [governorate_id]);
    if (!governorate) {
      return res.status(400).json({ success: false, error: 'المحافظة المختارة غير صحيحة' });
    }

    // 2. Fetch merchant settings
    const settingsRows = await queryAll(`SELECT key, value FROM site_settings`);
    const settings: Record<string, string> = {};
    settingsRows.forEach((r: any) => {
      settings[r.key] = r.value;
    });

    const merchantPhone = settings['merchant_phone'] || '201555779084';
    const freeShippingThreshold = parseFloat(settings['free_shipping_threshold'] || '600');
    const bundleDiscountPercent = parseFloat(settings['bundle_discount_percent'] || '10');

    // 3. Consolidate cart items by book_id to aggregate quantities and avoid N+1 queries
    const consolidatedMap = new Map<string, number>();
    for (const item of items) {
      if (!item || !item.book_id) continue;
      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      consolidatedMap.set(
        item.book_id,
        (consolidatedMap.get(item.book_id) || 0) + requestedQty
      );
    }

    const bookIds = Array.from(consolidatedMap.keys());
    if (bookIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'سلة المشتريات لا تحتوي على كتب صالحة',
      });
    }

    const placeholders = bookIds.map(() => '?').join(',');
    const books = await queryAll(`SELECT * FROM books WHERE id IN (${placeholders})`, bookIds);
    const booksMap = new Map<string, any>(books.map((b: any) => [b.id, b]));

    let totalBooksPrice = 0;
    const validatedItems: Array<{ book: any; quantity: number }> = [];

    for (const [bookId, requestedQty] of consolidatedMap.entries()) {
      const book = booksMap.get(bookId);
      if (!book) {
        return res.status(400).json({
          success: false,
          error: `الكتاب المعرف بـ ${bookId} غير متوفر في المتجر`,
        });
      }

      if (book.stock_quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          error: `الكمية المتاحة من كتاب "${book.title}" هي ${book.stock_quantity} فقط، والمطلوب ${requestedQty}`,
        });
      }

      totalBooksPrice += book.price * requestedQty;
      validatedItems.push({ book, quantity: requestedQty });
    }

    // 4. Calculate discount & shipping
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
    let shippingFee = governorate.fee;
    if (priceAfterDiscount >= freeShippingThreshold) {
      shippingFee = 0;
    }

    const finalTotal = priceAfterDiscount + shippingFee;

    // 5. Generate Collision-Proof Order Reference & ID using crypto.randomUUID()
    const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
    const timestampSuffix = Date.now().toString(36).toUpperCase();
    const orderRef = `ORD-${timestampSuffix}-${uuid.slice(0, 6)}`;
    const orderId = `order_${crypto.randomUUID()}`;

    // 6. Build atomic transaction batch for order, items, and conditional stock decrements
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
          orderId,
          orderRef,
          customer_name,
          customer_phone,
          customer_whatsapp || customer_phone,
          governorate_id,
          street_address,
          notes || '',
          totalBooksPrice,
          discountAmount,
          shippingFee,
          finalTotal,
        ],
      },
    ];

    for (const v of validatedItems) {
      const itemId = `item_${crypto.randomUUID()}`;
      batchStatements.push({
        sql: `
          INSERT INTO order_items (id, order_id, book_id, title, price, quantity)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
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
      const results = await batch(batchStatements, 'write');
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
        return res.status(400).json({
          success: false,
          error: 'عذراً، نفدت كمية أحد الكتب المطلوبة أثناء تسجيل طلبك',
        });
      }
      throw batchErr;
    }

    // 7. Generate WhatsApp payload
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

    res.json({
      success: true,
      orderRef,
      orderId,
      finalTotal,
      shippingFee,
      discountAmount,
      whatsappUrl,
      whatsappMessage,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى',
    });
  }
});

// GET /api/orders/:orderRef - Track order with privacy masking for unauthorized callers
router.get('/:orderRef', async (req: Request, res: Response) => {
  try {
    const { orderRef } = req.params;
    const order = await queryOne(`
      SELECT o.*, g.name as governorate_name
      FROM orders o
      JOIN shipping_governorates g ON o.governorate_id = g.id
      WHERE o.order_ref = ?
    `, [orderRef]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }

    const items = await queryAll(`
      SELECT id, order_id, book_id, title, price, quantity FROM order_items WHERE order_id = ?
    `, [order.id]);

    const token = (req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '')) as string;
    const isAdmin = verifyAdminToken(token);

    if (isAdmin) {
      return res.json({ success: true, order, items });
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

    res.json({ success: true, order: safeOrder, items });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب بيانات الطلب' });
  }
});

export default router;
