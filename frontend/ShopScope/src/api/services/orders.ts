import { api } from '../client';
import { endpoints } from '../endpoints';
import type { CartItemInput, Order } from '../../types';

export interface CreateOrderPayload {
  userId: number;
  products: CartItemInput[];
  cardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
  paymentMethod?: string;
  paymentSuccess?: boolean;
}

export async function createOrder(
  payload: CreateOrderPayload,
  options: { signal?: AbortSignal } = {},
): Promise<Order> {
  const { data } = await api.post<Order>(endpoints.orders.create(), payload, { signal: options.signal });
  return data;
}

export async function listOrdersForUser(
  userId: number | string,
  status?: string,
  options: { signal?: AbortSignal } = {},
): Promise<Order[]> {
  const { data } = await api.get<Order[]>(endpoints.orders.byUser(userId), {
    params: { status: status || undefined },
    signal: options.signal,
  });
  return data;
}