import type { User } from '../types';

const KEYS = {
  access: 'shopscope.accessToken',
  refresh: 'shopscope.refreshToken',
  user: 'shopscope.user',
} as const;
export const AUTH_CHANGED = 'shopscope:auth-changed';
export const AUTH_UNAUTHORIZED = 'shopscope:unauthorized';

function emit(eventName: string) {
  window.dispatchEvent(new Event(eventName));
}

export interface TokenStore {
  getAccess(): string | null;
  getRefresh(): string | null;
  getUser(): User | null;
  isAuthenticated(): boolean;
  set(values: { accessToken?: string; refreshToken?: string; user?: User }): void;
  clear(): void;
  emitUnauthorized(): void;
}

export const tokenStore: TokenStore = {
  getAccess: () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.user) ?? 'null') as User | null;
    } catch {
      return null;
    }
  },
  isAuthenticated() {
    return Boolean(localStorage.getItem(KEYS.access));
  },
  set({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem(KEYS.access, accessToken);
    if (refreshToken) localStorage.setItem(KEYS.refresh, refreshToken);
    if (user) localStorage.setItem(KEYS.user, JSON.stringify(user));
    emit(AUTH_CHANGED);
  },
  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    emit(AUTH_CHANGED);
  },
  emitUnauthorized() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    emit(AUTH_UNAUTHORIZED);
  },
};