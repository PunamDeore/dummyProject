import { createBrowserRouter, redirect } from 'react-router';
import { RootLayout, rootLoader } from './routes/RootLayout';
import { RootErrorBoundary } from './routes/RootErrorBoundary';
import { AppBootSplash } from './routes/AppBootSplash';
import { ProductsPage, productsAction, productsLoader } from './routes/ProductsPage';
import { ProductDetailPage, productDetailLoader } from './routes/ProductDetailPage';
import { ProductErrorBoundary } from './routes/ProductErrorBoundary';
import { LoginPage, loginAction, loginLoader } from './routes/LoginPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { authMiddleware, requireRole } from './routes/middleware';

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    Component: RootLayout,
    loader: rootLoader,
    ErrorBoundary: RootErrorBoundary,
    HydrateFallback: AppBootSplash,
    children: [
      {
        index: true,
        loader: () => redirect('/products'),
      },
      { path: 'products', Component: ProductsPage, loader: productsLoader, action: productsAction },
      {
        path: 'products/:productId',
        Component: ProductDetailPage,
        loader: productDetailLoader,
        ErrorBoundary: ProductErrorBoundary,
      },
      {
        path: 'about',
        lazy: async () => {
          const { AboutPage } = await import('./routes/AboutPage');
          return { Component: AboutPage };
        },
      },
      { path: 'login', Component: LoginPage, loader: loginLoader, action: loginAction },
      {
        path: 'account',
        middleware: [authMiddleware],
        lazy: async () => {
          const { AccountLayout, accountLoader } = await import('./routes/account/AccountLayout');
          return { Component: AccountLayout, loader: accountLoader };
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const { ProfilePage, profileLoader } = await import('./routes/account/ProfilePage');
              return { Component: ProfilePage, loader: profileLoader };
            },
          },
          {
            path: 'orders',
            lazy: async () => {
              const { OrdersPage, ordersLoader } = await import('./routes/account/OrdersPage');
              return { Component: OrdersPage, loader: ordersLoader };
            },
          },
          {
            path: 'carts',
            lazy: async () => {
              const { CartsPage, cartsLoader } = await import('./routes/account/CartsPage');
              return { Component: CartsPage, loader: cartsLoader };
            },
          },
          {
            path: 'checkout',
            lazy: async () => {
              const { PaymentPage } = await import('./routes/account/PaymentPage');
              const { checkoutAction } = await import('./routes/account/checkout');
              return { Component: PaymentPage, action: checkoutAction };
            },
          },
          {
            path: 'team',
            middleware: [requireRole('admin')],
            lazy: async () => {
              const { TeamPage, teamLoader } = await import('./routes/account/TeamPage');
              return { Component: TeamPage, loader: teamLoader };
            },
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);