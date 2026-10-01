const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatPrice(amount: number): string {
  return usd.format(amount);
}

export function discountedPrice(price: number, discountPercentage = 0): number {
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}
