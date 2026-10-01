# ShopScope Frontend

ShopScope is a modern e-commerce storefront web application built with **React**, **TypeScript**, **Vite**, **Redux Toolkit**, and **React-Bootstrap**. It features full catalog browsing, real-time catalog updates via WebSockets, an interactive cart system, order workflows, and an integrated AI shopping assistant.

---

## 🚀 Features

- **Product Catalog & Search**: Filter products by category, search by keywords, and sort by price or rating.
- **State Management**:
  - **Redux Toolkit**: Centralized store handling the active shopping cart and user wishlist.
  - **Session Isolation**: Cart and wishlist states are keyed to authenticated user IDs in persistent storage.
- **Authentication & Security**:
  - JWT token management with automatic background token rotation and refresh handling.
  - Graceful session expiry handling: unauthenticated users get prompted with sign-in/register modals when attempting protected actions like adding products to the cart.
- **Real-Time Updates**: STOMP client integration subscribing to live product mutations (`CREATED`, `UPDATED`, `DELETED`) published by the backend.
- **AI Shopping Assistant Widget**: Floating chat assistant powered by backend Spring AI services to search catalog items, add products to the cart, and proceed to checkout.
- **Responsive UI**: Built using React-Bootstrap components and Bootstrap utility classes.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [@reduxjs/toolkit](https://redux-toolkit.js.org/) & [react-redux](https://react-redux.js.org/)
- **Routing**: [React Router](https://reactrouter.com/) (Data APIs & loaders)
- **UI & Icons**: [React-Bootstrap](https://react-bootstrap.netlify.app/), `bootstrap`, `react-bootstrap-icons`
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with custom logging, auth, and refresh interceptors)
- **WebSockets**: [@stomp/stompjs](https://stomp-js.github.io/)

---

## 📋 Prerequisites

- **Node.js**: `v18+` or `v20+`
- **npm** or **yarn** / **pnpm**
- **Backend Service**: ShopScope Spring Boot backend running on `http://localhost:8080`

---

## ⚙️ Environment Variables

Create a `.env` (or `.env.development`) file in the frontend root directory:

```env
VITE_APP_NAME=ShopScope
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT_MS=10000
VITE_LOG_LEVEL=debug
VITE_PAGE_SIZE=12
VITE_FEATURE_UPLOADS=false
VITE_UPLOAD_BASE_URL=[https://httpbin.org](https://httpbin.org)