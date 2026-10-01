import axios, { type AxiosInstance } from 'axios';
import { api } from '../client';
import { refreshTokens } from '../services/auth';
import { tokenStore } from '../../lib/tokenStore';
import { logger } from '../../config/logger';

let refreshPromise: Promise<string> | null = null;

export function installRefreshInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);
      const original = error.config;
      const shouldTryRefresh =
        error.response?.status === 401 &&
        original !== undefined &&
        !original._retry &&
        !original.url?.startsWith('/auth/');

      if (!shouldTryRefresh) {

        if (error.response?.status === 401 && !original?.url?.includes('/auth/login')) {
          tokenStore.emitUnauthorized();
        }
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null;
        });

        const accessToken = await refreshPromise;
        logger.info('[auth] token refreshed; replaying request', original.url);
        original.headers.set('Authorization', `Bearer ${accessToken}`);
        return api(original);
      } catch {
        logger.warn('[auth] refresh failed; notifying unauthorized session');
  
        tokenStore.emitUnauthorized();
        return Promise.reject(error);
      }
    },
  );
}