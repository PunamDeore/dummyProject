import type { AxiosInstance } from 'axios';
import { tokenStore } from '../../lib/tokenStore';

const PUBLIC_PATHS = ['/auth/login', '/auth/refresh'];


export function installAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const isPublic = PUBLIC_PATHS.some((path) => config.url?.startsWith(path));
    const token = tokenStore.getAccess();

    if (token && !isPublic) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  });
}
