import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStore } from '../lib/tokenStore';

interface WishlistState {
  ids: number[];
}

const getUserWishlistKey = () => {
  const user = tokenStore.getUser();
  return user ? `shopscope.wishlist.user_${user.id}` : 'shopscope.wishlist.guest';
};

const loadInitialWishlist = (): number[] => {
  try {
    const raw = localStorage.getItem(getUserWishlistKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialState: WishlistState = {
  ids: loadInitialWishlist(),
};

const persistWishlist = (ids: number[]) => {
  try {
    localStorage.setItem(getUserWishlistKey(), JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to persist wishlist:', err);
  }
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((item) => item !== id);
      } else {
        state.ids.push(id);
      }
      persistWishlist(state.ids);
    },
    clearWishlist: (state) => {
      state.ids = [];
      persistWishlist(state.ids);
    },
    syncUserWishlist: (state) => {
      state.ids = loadInitialWishlist();
    },
  },
});

export const { toggleWishlist, clearWishlist, syncUserWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;