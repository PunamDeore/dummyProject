import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import cartReducer, { syncUserCart } from './cartSlice';
import wishlistReducer, { syncUserWishlist } from './wishlistSlice';
import { AUTH_CHANGED } from '../lib/tokenStore';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGED, () => {
    store.dispatch(syncUserCart());
    store.dispatch(syncUserWishlist());
  });
}


export const selectCartLines = (state: RootState) =>
  Array.isArray(state.cart?.lines) ? state.cart.lines : [];

export const selectCartIsOpen = (state: RootState) =>
  Boolean(state.cart?.isOpen);

export const selectCartCount = (state: RootState) => {
  const lines = selectCartLines(state);
  return lines.reduce((acc, line) => acc + (line.qty || 0), 0);
};

export const selectCartSubtotal = (state: RootState) => {
  const lines = selectCartLines(state);
  return lines.reduce((acc, line) => acc + (line.qty || 0) * (line.price || 0), 0);
};

export const selectWishlistIds = (state: RootState) =>
  Array.isArray(state.wishlist?.ids) ? state.wishlist.ids : [];

export const selectWishlistCount = (state: RootState) =>
  selectWishlistIds(state).length;

export const selectIsSaved = (id: number) => (state: RootState) =>
  selectWishlistIds(state).includes(id);