export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  availabilityStatus?: string;
  tags?: string[];
  sku?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  images?: string[];
}
export type ProductDraft = Pick<Product, 'title' | 'price' | 'category' | 'stock' | 'description'>;
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
export interface ApiCategory {
  slug: string;
  name: string;
  url: string;
}

export type Density = 'comfortable' | 'compact';

export interface CategoryOption {
  id: string;
  name: string;
  count?: number;
}
export type Role = 'admin' | 'moderator' | 'user';
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export type LoginResponse = AuthTokens & Pick<User, 'id' | 'username' | 'email' | 'firstName' | 'lastName' | 'image'>;
export interface DirectoryUser extends User {
  company?: { title?: string };
}
export interface CartLine {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
  qty: number;
}

export interface CartItemInput {
  id: number;
  quantity: number;
}
export interface Cart {
  id: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
  total: number;
  discountedTotal: number;
}

export type OrderStatus = 'PLACED' | 'FAILED';

export interface OrderItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  status: OrderStatus;
  paymentMethod: string;
  lastFourDigits: string;
  failureReason?: string | null;
  orderPlacedDate: string;
  arrivingDate?: string | null;
  items: OrderItem[];
}