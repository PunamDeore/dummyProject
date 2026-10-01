import { data, redirect, type ActionFunctionArgs } from 'react-router';
import { createOrder } from '../../api/services/orders';
import { createCart } from '../../api/services/carts';
import { ApiError } from '../../lib/ApiError';
import { store, selectCartLines } from '../../store';
import { clearCart } from '../../store/cartSlice';
import { userContext } from '../middleware';
import type { Order } from '../../types';

export type CheckoutResult = { ok: true; order: Order } | { ok: false; error: string };

export async function checkoutAction({ request, context }: ActionFunctionArgs): Promise<CheckoutResult | Response> {
  const user = context.get(userContext);
  if (!user) throw data({ message: 'Sign in to check out.' }, { status: 401 });

  const lines = selectCartLines(store.getState());
  if (lines.length === 0) return { ok: false, error: 'Your cart is empty.' };

  const formData = await request.formData();
  const cardNumber = String(formData.get('cardNumber') ?? '');
  const cardExpiry = String(formData.get('cardExpiry') ?? '');
  const cvv = String(formData.get('cvv') ?? '');
  const paymentOutcome = formData.get('paymentOutcome');
  const paymentSuccess = paymentOutcome === 'FAIL' ? false : cvv !== '000';

  try {
    const products = lines.map((line) => ({ id: line.productId, quantity: line.qty }));

    const order = await createOrder({
      userId: user.id,
      products,
      cardNumber,
      cardExpiry,
      cvv,
      paymentMethod: 'CARD',
      paymentSuccess,
    });

    if (order.status === 'PLACED') {
      await createCart(user.id, products, { cardNumber, cardExpiry, cvv });
      store.dispatch(clearCart());
      return redirect(`/products?flash=${encodeURIComponent('Order placed, thank you!')}`);
    } else {
      return {
        ok: false,
        error: 'Payment failed: The transaction was declined. Your attempt has been logged under Orders.',
      };
    }
  } catch (error) {
    return { ok: false, error: ApiError.from(error).message };
  }
}