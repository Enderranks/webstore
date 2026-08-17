const STOREFRONT_BASE = "https://storefront-api.fourthwall.com/v1";

function storefrontUrl(path: string) {
  const token = process.env.FOURTHWALL_STOREFRONT_TOKEN;
  if (!token) throw new Error("FOURTHWALL_STOREFRONT_TOKEN is not configured");
  const url = new URL(`${STOREFRONT_BASE}${path}`);
  url.searchParams.set("storefront_token", token);
  return url;
}

export async function fourthwallFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(storefrontUrl(path), { ...init, next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`Fourthwall request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type FourthwallProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  variants?: Array<{ id: string; name: string; unitPrice?: { value: number; currency: string }; attributes?: Record<string, string> }>;
  images?: Array<{ url: string; alt?: string }>;
};

export async function getProducts(collection = "all") {
  return fourthwallFetch<{ results: FourthwallProduct[]; paging?: { hasNextPage: boolean } }>(`/collections/${collection}/products?size=50`);
}

export async function createCart(employeeId: string, internalCartId: string, currency = "USD") {
  return fourthwallFetch<{ id: string }>(`/carts?currency=${currency}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currency }),
    cache: "no-store",
  });
}

export async function addCartItem(cartId: string, variantId: string, quantity = 1) {
  return fourthwallFetch<{ id: string; items?: unknown[] }>(`/carts/${encodeURIComponent(cartId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId, quantity }),
    cache: "no-store",
  });
}

export async function getCart(cartId: string) {
  return fourthwallFetch<{ id: string; items?: unknown[]; totals?: unknown }>(`/carts/${encodeURIComponent(cartId)}`);
}

export function checkoutUrl(cartId: string, currency = "USD") {
  const domain = process.env.FOURTHWALL_SHOP_DOMAIN;
  if (!domain) throw new Error("FOURTHWALL_SHOP_DOMAIN is not configured");
  return `https://${domain}/checkout/?cartCurrency=${encodeURIComponent(currency)}&cartId=${encodeURIComponent(cartId)}`;
}
