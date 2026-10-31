import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../db/database';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../services/whatsapp';

const router = Router();

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

    const merchantPhone = settings['merchant_phone'] || '201012345678';
    const freeShippingThreshold = parseFloat(settings['free_shipping_threshold'] || '600');
    const bundleDiscountPercent = parseFloat(settings['bundle_discount_percent'] || '10');

    // 3. Validate stock and calculate items total
    let totalBooksPrice = 0;
    const validatedItems: Array<{ book: any; quantity: number }> = [];

    for (const item of items) {
      const book = await queryOne(`SELECT * FROM books WHERE id = ?`, [item.book_id]);
      if (!book) {
        return res.status(400).json({
          success: false,
          error: `الكتاب المعرف بـ ${item.book_id} غير متوفر في المتجر`,
        });
      }

      const requestedQty = Math.max(1, parseInt(item.quantity) || 1);
      if (book.stock_quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          error: `الكمية المتاحة من كتاب "${book.title}" هي ${book.stock_quantity} فقط`,
        });
      }

      totalBooksPrice += book.price * requestedQty;
      validatedItems.push({ book, quantity: requestedQty });
    }

    // 4. Calculate discount & shipping
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

    // 5. Generate Order Reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `ORD-${randomSuffix}`;
    const orderId = `order_${Date.now()}_${randomSuffix}`;

    // 6. Save order into database
    await execute(`
      INSERT INTO orders (
        id, order_ref, customer_name, customer_phone, customer_whatsapp,
        governorate_id, street_address, notes, total_books_price,
        discount_amount, shipping_fee, final_total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_WHATSAPP_CONFIRMATION')
    `, [
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
    ]);

    // 7. Save order items & decrement stock
    for (const v of validatedItems) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await execute(`
        INSERT INTO order_items (id, order_id, book_id, title, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [itemId, orderId, v.book.id, v.book.title, v.book.price, v.quantity]);

      // Deduct stock
      await execute(`
        UPDATE books
        SET stock_quantity = stock_quantity - ?
        WHERE id = ?
      `, [v.quantity, v.book.id]);
    }

    // 8. Generate WhatsApp payload
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

// GET /api/orders/:orderRef - Track order
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
      SELECT * FROM order_items WHERE order_id = ?
    `, [order.id]);

    res.json({ success: true, order, items });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب بيانات الطلب' });
  }
});

export default router;
