import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AUTH_CHANGED, tokenStore } from '../lib/tokenStore';

interface WishlistState {
  ids: number[];
  toggle: (id: number) => void;
  clear: () => void;
  syncUserWishlist: () => void;
}
const getUserWishlistKey = () => {
  const user = tokenStore.getUser();
  return user ? `shopscope.wishlist.user_${user.id}` : 'shopscope.wishlist.guest';
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [...state.ids, id],
        })),
      clear: () => set({ ids: [] }),
      syncUserWishlist: () => {
        try {
          const raw = localStorage.getItem(getUserWishlistKey());
          if (raw) {
            const parsed = JSON.parse(raw);
            set({ ids: parsed.state?.ids ?? [] });
          } else {
            set({ ids: [] });
          }
        } catch {
          set({ ids: [] });
        }
      },
    }),
    {
      name: 'shopscope.wishlist',
      storage: createJSONStorage(() => ({
        getItem: () => localStorage.getItem(getUserWishlistKey()),
        setItem: (_key: string, value: string) => localStorage.setItem(getUserWishlistKey(), value),
        removeItem: () => localStorage.removeItem(getUserWishlistKey()),
      })),
      version: 1,
    },
  ),
);
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGED, () => {
    useWishlistStore.getState().syncUserWishlist();
  });
}
export const selectWishlistCount = (state: WishlistState) => state.ids.length;
export const selectIsSaved = (id: number) => (state: WishlistState) => state.ids.includes(id);