export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  sub_topics: string;
  reader_level: 'beginner' | 'intermediate' | 'advanced';
  page_count: number;
  reading_time_hours: number;
  why_read: string;
  excerpt_text?: string;
  cover_image: string;
  is_bestseller: number;
  is_featured: number;
  recommended_next_book_id?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  book_count?: number;
}

export interface Governorate {
  id: string;
  name: string;
  fee: number;
  delivery_days: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface ReadingPathStep {
  step_number: number;
  step_label: string;
  book_id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  cover_image: string;
}

export interface RecommendationResponse {
  success: boolean;
  intent_summary: string;
  reading_path_title: string;
  bundle_discount_percent: number;
  primary_recommendation: {
    book_id: string;
    slug: string;
    title: string;
    author: string;
    price: number;
    original_price?: number;
    cover_image: string;
    reader_level: string;
    page_count: number;
    reading_time_hours: number;
    match_score: number;
    why_recommended: string;
    key_takeaways: string[];
    in_stock: boolean;
  };
  reading_path_steps: ReadingPathStep[];
  engine_mode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  governorate_id: string;
  governorate_name?: string;
  street_address: string;
  notes?: string;
  total_books_price: number;
  discount_amount: number;
  shipping_fee: number;
  final_total: number;
  status: 'PENDING_WHATSAPP_CONFIRMATION' | 'CONFIRMED_WHATSAPP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  items?: OrderItem[];
}
