import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { formatPrice } from '../lib/format';
import { AUTH_CHANGED, tokenStore } from '../lib/tokenStore';
import type { CartLine, Product } from '../types';

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (product: Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  syncUserCart: () => void;
}
const getUserCartKey = () => {
  const user = tokenStore.getUser();
  return user ? `shopscope.cart.user_${user.id}` : 'shopscope.cart.guest';
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.productId === product.id);
          const lines = existing
            ? state.lines.map((line) => (line.productId === product.id ? { ...line, qty: line.qty + qty } : line))
            : [
                ...state.lines,
                { productId: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail, qty },
              ];
          return { lines, isOpen: true };
        }),
      setQty: (productId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((line) => line.productId !== productId)
              : state.lines.map((line) => (line.productId === productId ? { ...line, qty } : line)),
        })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      syncUserCart: () => {
        try {
          const raw = localStorage.getItem(getUserCartKey());
          if (raw) {
            const parsed = JSON.parse(raw);
            set({ lines: parsed.state?.lines ?? [] });
          } else {
            set({ lines: [] });
          }
        } catch {
          set({ lines: [] });
        }
      },
    }),
    {
      name: 'shopscope.cart',
      storage: createJSONStorage(() => ({
        getItem: () => localStorage.getItem(getUserCartKey()),
        setItem: (_key: string, value: string) => localStorage.setItem(getUserCartKey(), value),
        removeItem: () => localStorage.removeItem(getUserCartKey()),
      })),
      partialize: (state) => ({ lines: state.lines } as CartState),
      version: 1,
    },
  ),
);
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGED, () => {
    useCartStore.getState().syncUserCart();
  });
}
export const selectCount = (state: CartState) => state.lines.reduce((n, line) => n + line.qty, 0);
export const selectSubtotal = (state: CartState) => state.lines.reduce((n, line) => n + line.qty * line.price, 0);
if (env.isDev) {
  useCartStore.subscribe((state, previous) => {
    if (state.lines !== previous.lines) {
      logger.debug(`[cart] ${selectCount(state)} items — ${formatPrice(selectSubtotal(state))}`);
    }
  });
}