import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as fpixel from '../lib/fpixel';

const CartContext = createContext(null);

export function formatPrice(priceInINR, targetCurrency) {
  return `₹${priceInINR}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [lang, setLang] = useState('EN');

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amata-cart');
      if (saved) setItems(JSON.parse(saved));
      const savedCurrency = localStorage.getItem('amata-currency');
      if (savedCurrency) setCurrency(savedCurrency);
      const savedLang = localStorage.getItem('amata-lang');
      if (savedLang) setLang(savedLang);
    } catch (_) {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('amata-cart', JSON.stringify(items));
  }, [items]);

  const changeCurrency = useCallback((cur) => {
    setCurrency(cur);
    localStorage.setItem('amata-currency', cur);
  }, []);

  const changeLang = useCallback((l) => {
    setLang(l);
    localStorage.setItem('amata-lang', l);
    if (typeof window !== 'undefined') {
      if (l === 'JP') {
        document.cookie = "googtrans=/en/ja; path=/;";
        document.cookie = "googtrans=/en/ja; path=/; domain=" + window.location.hostname;
        
        // Also set on apex/parent domain if applicable
        const parts = window.location.hostname.split('.');
        if (parts.length > 2) {
          const parentDomain = parts.slice(-2).join('.');
          document.cookie = "googtrans=/en/ja; path=/; domain=." + parentDomain;
          document.cookie = "googtrans=/en/ja; path=/; domain=" + parentDomain;
        }
      } else {
        // Clear googtrans cookie for all possible domains and paths
        const hostname = window.location.hostname;
        const domains = ['', hostname, '.' + hostname];
        
        const parts = hostname.split('.');
        if (parts.length > 2) {
          const parentDomain = parts.slice(-2).join('.');
          domains.push(parentDomain);
          domains.push('.' + parentDomain);
        }
        
        domains.forEach(domain => {
          const domainStr = domain ? `; domain=${domain}` : '';
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${domainStr}`;
        });
      }
      window.location.reload();
    }
  }, []);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    // Fire Meta Pixel AddToCart Event
    fpixel.event('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.price || 455,
      currency: 'INR',
    });

    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        count,
        isOpen,
        setIsOpen,
        currency,
        setCurrency: changeCurrency,
        lang,
        setLang: changeLang
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
