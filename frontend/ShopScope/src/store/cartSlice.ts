import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStore } from '../lib/tokenStore';
import type { CartLine, Product } from '../types';

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
}

const getUserCartKey = () => {
  const user = tokenStore.getUser();
  return user ? `shopscope.cart.user_${user.id}` : 'shopscope.cart.guest';
};

const loadInitialLines = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(getUserCartKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.state?.lines)) {
      return parsed.state.lines;
    }
    return [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  lines: loadInitialLines(),
  isOpen: false,
};

const persistCart = (lines: CartLine[]) => {
  try {
    localStorage.setItem(getUserCartKey(), JSON.stringify(lines));
  } catch (err) {
    console.error('Failed to persist cart:', err);
  }
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>; qty?: number }>,
    ) => {
      const { product, qty = 1 } = action.payload;
      if (!Array.isArray(state.lines)) state.lines = [];
      const existing = state.lines.find((line) => line.productId === product.id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.lines.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          qty,
        });
      }
      state.isOpen = true;
      persistCart(state.lines);
    },
    setQuantity: (state, action: PayloadAction<{ productId: number; qty: number }>) => {
      if (!Array.isArray(state.lines)) state.lines = [];
      const { productId, qty } = action.payload;
      if (qty <= 0) {
        state.lines = state.lines.filter((line) => line.productId !== productId);
      } else {
        const item = state.lines.find((line) => line.productId === productId);
        if (item) item.qty = qty;
      }
      persistCart(state.lines);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      if (!Array.isArray(state.lines)) state.lines = [];
      state.lines = state.lines.filter((line) => line.productId !== action.payload);
      persistCart(state.lines);
    },
    clearCart: (state) => {
      state.lines = [];
      persistCart(state.lines);
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    syncUserCart: (state) => {
      state.lines = loadInitialLines();
    },
  },
});

export const {
  addToCart,
  setQuantity,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  syncUserCart,
} = cartSlice.actions;

export default cartSlice.reducer;