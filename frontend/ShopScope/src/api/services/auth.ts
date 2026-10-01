import { api, bareApi } from '../client';
import { endpoints } from '../endpoints';
import { tokenStore } from '../../lib/tokenStore';import type { AuthTokens, LoginResponse, User } from '../../types';
import { store } from '../../store';
import { clearCart } from '../../store/cartSlice';
import { clearWishlist } from '../../store/wishlistSlice';

const TOKEN_LIFETIME_MINS = 1;

interface RequestOptions {
  signal?: AbortSignal;
}


export async function getMe({ signal }: RequestOptions = {}): Promise<User> {
  const { data } = await api.get<User>(endpoints.auth.me(), { signal });
  return data;
}

export async function login({ username, password }: { username: string; password: string }): Promise<User> {
  const { data } = await api.post<LoginResponse>(endpoints.auth.login(), {
    username,
    password,
    expiresInMins: TOKEN_LIFETIME_MINS,
  });

  tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });


  const user = await getMe();
  tokenStore.set({ user });
  return user;
}


export async function refreshTokens(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await bareApi.post<AuthTokens>(endpoints.auth.refresh(), {
    refreshToken,
    expiresInMins: TOKEN_LIFETIME_MINS,
  });


  tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

export function logout() {
  tokenStore.clear();
  store.dispatch(clearCart());
  store.dispatch(clearWishlist());
}