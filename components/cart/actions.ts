// This file is disabled for static export as Server Actions are not supported.
// The cart logic is handled client-side in cart-context.tsx using useCartStore.

export async function addItem() {}
export async function removeItem() {}
export async function updateItemQuantity() {}
export async function redirectToCheckout() {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/shopdocauchitoanfishing";
  window.location.href = `${basePath}/checkout`;
}
export async function createCartAndSetCookie() {}
