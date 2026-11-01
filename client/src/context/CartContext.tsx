import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem } from '../types';

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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const freeShippingThreshold = 600;

  useEffect(() => {
    try {
      localStorage.setItem('dar_almaarefa_cart', JSON.stringify(items));
      localStorage.setItem('dar_almaarefa_bundle', String(isBundleApplied));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }, [items, isBundleApplied]);

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
  const discountAmount = isBundleApplied && items.length >= 2 ? Math.round(subtotal * 0.1) : 0;
  const totalPrice = subtotal - discountAmount;

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

