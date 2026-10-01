import { createContext, data, redirect, type MiddlewareFunction } from 'react-router';
import { getMe } from '../api/services/auth';
import { tokenStore } from '../lib/tokenStore';
import { logger } from '../config/logger';
import type { Role, User } from '../types';


export const userContext = createContext<User | null>(null);

export const authMiddleware: MiddlewareFunction = async ({ request, context }) => {
  if (!tokenStore.isAuthenticated()) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  let user = tokenStore.getUser();
  if (!user) {
    try {
      user = await getMe({ signal: request.signal });
      tokenStore.set({ user });
    } catch {

      tokenStore.clear();
      throw redirect('/login?expired=1');
    }
  }

  context.set(userContext, user);
};

export function requireRole(...allowed: Role[]): MiddlewareFunction {
  return async ({ context }) => {
    const user = context.get(userContext);
    if (!user || !allowed.includes(user.role)) {
      logger.warn(`[auth] role denied: ${user?.role ?? 'anonymous'} needs ${allowed.join('|')}`);
      throw data(
        { message: `This area needs the ${allowed.join(' or ')} role. You're signed in as ${user?.role ?? 'a guest'}.` },
        { status: 403, statusText: 'Forbidden' },
      );
    }
  };
}
