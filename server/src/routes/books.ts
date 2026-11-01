import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../db/database';

const router = Router();

// GET /api/books - Catalog with filtering and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, level, minPrice, maxPrice, search, inStock, bestseller, featured } = req.query;

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
    res.json({ success: true, count: books.length, books });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب قائمة الكتب' });
  }
});

// GET /api/categories - All book categories with counts
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await queryAll(`
      SELECT c.*, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب التصنيفات' });
  }
});

// GET /api/shipping-governorates - All shipping rates
router.get('/shipping-governorates', async (_req: Request, res: Response) => {
  try {
    const governorates = await queryAll(`
      SELECT * FROM shipping_governorates
      ORDER BY fee ASC, name ASC
    `);
    res.json({ success: true, governorates });
  } catch (error: any) {
    console.error('Error fetching governorates:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب بيانات المحافظات' });
  }
});

// GET /api/settings - Store settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const rows = await queryAll(`SELECT key, value FROM site_settings`);
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => {
      settings[r.key] = r.value;
    });
    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب إعدادات المتجر' });
  }
});

// GET /api/books/:idOrSlug - Single book details
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const book = await queryOne(`
      SELECT b.*, c.name as category_name, c.slug as category_slug
      FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? OR b.slug = ?
    `, [idOrSlug, idOrSlug]);

    if (!book) {
      return res.status(404).json({ success: false, error: 'الكتاب غير موجود' });
    }

    // Get recommended next book if exists
    let nextBook = null;
    if (book.recommended_next_book_id) {
      nextBook = await queryOne(`
        SELECT id, slug, title, author, price, cover_image, reader_level
        FROM books WHERE id = ?
      `, [book.recommended_next_book_id]);
    }

    // Get related books in same category
    const relatedBooks = await queryAll(`
      SELECT id, slug, title, author, price, cover_image, reader_level
      FROM books
      WHERE category_id = ? AND id != ? AND stock_quantity > 0
      LIMIT 3
    `, [book.category_id, book.id]);

    res.json({ success: true, book, nextBook, relatedBooks });
  } catch (error: any) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب تفاصيل الكتاب' });
  }
});

export default router;

