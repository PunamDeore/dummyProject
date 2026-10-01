const enc = (value: string | number) => encodeURIComponent(String(value));

export const endpoints = {
  products: {
    list: () => '/products',
    search: () => '/products/search',
    byCategory: (slug: string) => `/products/category/${enc(slug)}`,
    categories: () => '/products/categories',
    detail: (id: number | string) => `/products/${enc(id)}`,
    create: () => '/products/add',
    update: (id: number | string) => `/products/${enc(id)}`,
    remove: (id: number | string) => `/products/${enc(id)}`,
  },
  auth: {
    login: () => '/auth/login',
    refresh: () => '/auth/refresh',
    me: () => '/auth/me',
  },
  users: {
    list: () => '/users',
    cartsFor: (userId: number | string) => `/carts/user/${enc(userId)}`,
  },
  carts: {
    create: () => '/carts/add',
  },
  orders: {
    create: () => '/orders/create',
    byUser: (userId: number | string) => `/orders/user/${enc(userId)}`,
    detail: (id: number | string) => `/orders/${enc(id)}`,
  },
};