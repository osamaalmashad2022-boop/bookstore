import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem } from '../types';

export const VALID_COUPONS: Record<string, { percent: number; label: string }> = {
  'MAQBARA10': { percent: 10, label: 'كود خصم مقبرة الكتب (10%)' },
  'READ10': { percent: 10, label: 'كود خصم القراءة (10%)' },
  'WARAQ10': { percent: 10, label: 'كود خصم عشاق الورق (10%)' },
};

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  addBundleToCart: (books: Book[]) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isBundleApplied: boolean;
  couponCode: string | null;
  couponError: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountLabel: string;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dar_almaarefa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isBundleApplied, setIsBundleApplied] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dar_almaarefa_bundle');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [couponCode, setCouponCode] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('dar_almaarefa_coupon');
      return saved ? saved.trim().toUpperCase() : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const freeShippingThreshold = 600;

  useEffect(() => {
    try {
      localStorage.setItem('dar_almaarefa_cart', JSON.stringify(items));
      localStorage.setItem('dar_almaarefa_bundle', String(isBundleApplied));
      if (couponCode) {
        localStorage.setItem('dar_almaarefa_coupon', couponCode);
      } else {
        localStorage.removeItem('dar_almaarefa_coupon');
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }, [items, isBundleApplied, couponCode]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setCouponError('يرجى كتابة كود الخصم أولاً');
      return { success: false, message: 'يرجى كتابة كود الخصم أولاً' };
    }
    const matched = VALID_COUPONS[clean];
    if (matched) {
      setCouponCode(clean);
      setCouponError(null);
      return { success: true, message: `تم تفعيل ${matched.label} بنجاح!` };
    } else {
      setCouponError('كود الخصم غير صحيح أو منتهي الصلاحية');
      return { success: false, message: 'كود الخصم غير صحيح أو منتهي الصلاحية' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponError(null);
    try {
      localStorage.removeItem('dar_almaarefa_coupon');
    } catch {}
  };

  const addToCart = (book: Book, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: Math.min(book.stock_quantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { book, quantity: Math.min(book.stock_quantity, quantity) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.book.id !== bookId);
      if (updated.length < 2) {
        setIsBundleApplied(false);
      }
      return updated;
    });
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.book.id === bookId) {
          const validQty = Math.min(item.book.stock_quantity, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const addBundleToCart = (books: Book[]) => {
    setItems(prev => {
      let newItems = [...prev];
      for (const book of books) {
        const index = newItems.findIndex(i => i.book.id === book.id);
        if (index > -1) {
          newItems[index] = { ...newItems[index], quantity: Math.max(1, newItems[index].quantity) };
        } else {
          newItems.push({ book, quantity: 1 });
        }
      }
      return newItems;
    });
    setIsBundleApplied(true);
    setIsCartOpen(true);
  };

  const clearCart = () => {
    setItems([]);
    setIsBundleApplied(false);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  const isBundleDiscount = isBundleApplied && items.length >= 2;
  const activeCoupon = couponCode ? VALID_COUPONS[couponCode] : null;

  let discountPercent = 0;
  if (activeCoupon) {
    discountPercent = Math.max(discountPercent, activeCoupon.percent);
  }
  if (isBundleDiscount) {
    discountPercent = Math.max(discountPercent, 10);
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalPrice = Math.max(0, subtotal - discountAmount);

  let discountLabel = '';
  if (activeCoupon) {
    discountLabel = `كود الخصم (${couponCode} - ${activeCoupon.percent}%):`;
  } else if (isBundleDiscount) {
    discountLabel = 'خصم باقة مسار القراءة (10%):';
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        addBundleToCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isBundleApplied,
        couponCode,
        couponError,
        applyCoupon,
        removeCoupon,
        discountLabel,
        totalItems,
        subtotal,
        discountAmount,
        totalPrice,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

