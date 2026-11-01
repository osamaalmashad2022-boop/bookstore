-- Schema for Perpetual Zero-Cost Physical Bookstore

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Book'
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  stock_quantity INTEGER NOT NULL DEFAULT 5,
  category_id TEXT NOT NULL,
  sub_topics TEXT NOT NULL, -- comma-separated or JSON list
  reader_level TEXT NOT NULL CHECK(reader_level IN ('beginner', 'intermediate', 'advanced')),
  page_count INTEGER NOT NULL,
  reading_time_hours REAL NOT NULL,
  why_read TEXT NOT NULL,
  excerpt_text TEXT,
  cover_image TEXT NOT NULL,
  is_bestseller INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  recommended_next_book_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS shipping_governorates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fee REAL NOT NULL,
  delivery_days TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  governorate_id TEXT NOT NULL,
  street_address TEXT NOT NULL,
  notes TEXT,
  total_books_price REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  shipping_fee REAL NOT NULL,
  final_total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_WHATSAPP_CONFIRMATION',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (governorate_id) REFERENCES shipping_governorates(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id TEXT PRIMARY KEY,
  query_or_quiz TEXT NOT NULL,
  matched_books TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Trigger to guarantee atomic stock integrity across concurrent orders
CREATE TRIGGER IF NOT EXISTS prevent_negative_book_stock
BEFORE UPDATE OF stock_quantity ON books
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN NEW.stock_quantity < 0 THEN RAISE(ABORT, 'INSUFFICIENT_STOCK: Stock quantity cannot be negative')
  END;
END;


