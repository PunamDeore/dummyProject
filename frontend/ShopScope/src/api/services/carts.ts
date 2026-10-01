import { api } from '../client';
import { endpoints } from '../endpoints';
import type { Cart, CartItemInput } from '../../types';

export interface PaymentDetails {
  cardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
}

export async function createCart(
  userId: number,
  products: CartItemInput[],
  payment?: PaymentDetails,
): Promise<Cart> {
  const { data } = await api.post<Cart>(endpoints.carts.create(), {
    userId,
    products,
    ...payment,
  });
  return data;
}