import type { Cart, CartItem, Collection, Menu, Page, Product } from "./types";
import { createClient } from "@supabase/supabase-js";

// Re-export all types so other files can import from "lib/local"
export type {
  Cart,
  CartItem,
  Collection,
  Menu,
  Page,
  Product,
  Image,
  Money,
  ProductOption,
  ProductVariant,
  SEO,
  CartProduct,
  Connection,
  Edge,
} from "./types";

// Helper to get Supabase client lazily
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

// --- Products ---

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  let queryBuilder = getSupabase().from("products").select("*");

  if (query) {
    const q = query.toLowerCase();
    queryBuilder = queryBuilder.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Sort
  let orderColumn = "updated_at";
  let orderAsc = !reverse;

  if (sortKey) {
    switch (sortKey) {
      case "PRICE":
        // Sort by price requires a more complex query in Supabase if stored as JSONB
        // For simplicity, we fetch all and sort in memory if sortKey=PRICE
        break;
      case "CREATED_AT":
        orderColumn = "updated_at";
        break;
      case "BEST_SELLING":
      case "RELEVANCE":
      default:
        break;
    }
  }

  if (sortKey !== "PRICE") {
    queryBuilder = queryBuilder.order(orderColumn, { ascending: orderAsc });
  }

  const { data: products, error } = await queryBuilder;

  if (error || !products) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Map to Product type
  let mappedProducts = products.map((p) => ({
    id: p.id,
    handle: p.handle,
    availableForSale: p.available_for_sale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.description_html,
    options: p.options || [],
    priceRange: p.price_range || {
      maxVariantPrice: { amount: "0", currencyCode: "VND" },
      minVariantPrice: { amount: "0", currencyCode: "VND" },
    },
    variants: p.variants || [],
    featuredImage: p.featured_image || { url: "", altText: "", width: 0, height: 0 },
    images: p.images || [],
    seo: p.seo || { title: "", description: "" },
    tags: p.tags || [],
    updatedAt: p.updated_at,
  }));

  if (sortKey === "PRICE") {
    mappedProducts.sort((a, b) => {
      const priceA = Number(a.priceRange.minVariantPrice.amount);
      const priceB = Number(b.priceRange.minVariantPrice.amount);
      return reverse ? priceB - priceA : priceA - priceB;
    });
  }

  return mappedProducts;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const { data: p, error } = await getSupabase()
    .from("products")
    .select("*, product_collections(collections(handle))")
    .eq("handle", handle)
    .single();

  if (error || !p) return undefined;

  const collections = p.product_collections?.map((pc: any) => pc.collections?.handle).filter(Boolean) || [];

  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.available_for_sale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.description_html,
    options: p.options || [],
    priceRange: p.price_range || {
      maxVariantPrice: { amount: "0", currencyCode: "VND" },
      minVariantPrice: { amount: "0", currencyCode: "VND" },
    },
    variants: p.variants || [],
    featuredImage: p.featured_image || { url: "", altText: "", width: 0, height: 0 },
    images: p.images || [],
    seo: p.seo || { title: "", description: "" },
    tags: p.tags || [],
    updatedAt: p.updated_at,
    collections, // Add collections for internal usage if needed
  } as Product & { collections?: string[] };
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const { data: currentProduct, error } = await getSupabase()
    .from("products")
    .select("id, product_collections(collection_id)")
    .eq("id", productId)
    .single();

  if (error || !currentProduct || !currentProduct.product_collections?.length) {
    return [];
  }

  const collectionIds = currentProduct.product_collections.map((pc: any) => pc.collection_id);

  const { data: recommended } = await getSupabase()
    .from("product_collections")
    .select("products(*)")
    .in("collection_id", collectionIds)
    .neq("product_id", productId)
    .limit(4);

  if (!recommended) return [];

  const uniqueProductsMap = new Map();
  recommended.forEach((r: any) => {
    if (r.products && !uniqueProductsMap.has(r.products.id)) {
      uniqueProductsMap.set(r.products.id, r.products);
    }
  });

  const products = Array.from(uniqueProductsMap.values());

  return products.map((p: any) => ({
    id: p.id,
    handle: p.handle,
    availableForSale: p.available_for_sale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.description_html,
    options: p.options || [],
    priceRange: p.price_range || {
      maxVariantPrice: { amount: "0", currencyCode: "VND" },
      minVariantPrice: { amount: "0", currencyCode: "VND" },
    },
    variants: p.variants || [],
    featuredImage: p.featured_image || { url: "", altText: "", width: 0, height: 0 },
    images: p.images || [],
    seo: p.seo || { title: "", description: "" },
    tags: p.tags || [],
    updatedAt: p.updated_at,
  }));
}

// --- Collections ---

export async function getCollections(): Promise<Collection[]> {
  const { data: collections, error } = await getSupabase().from("collections").select("*");
  
  const allCollection: Collection = {
    handle: "",
    title: "Tất cả",
    description: "Tất cả sản phẩm",
    seo: { title: "Tất cả", description: "Tất cả sản phẩm" },
    path: "/search",
    updatedAt: new Date().toISOString(),
  };

  if (error || !collections) {
    return [allCollection];
  }

  return [
    allCollection,
    ...collections.map((c) => ({
      handle: c.handle,
      title: c.title,
      description: c.description,
      seo: c.seo || { title: c.title, description: c.description },
      path: `/search/${c.handle}`,
      updatedAt: c.updated_at,
    })),
  ];
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const { data: c, error } = await getSupabase().from("collections").select("*").eq("handle", handle).single();

  if (error || !c) return undefined;

  return {
    handle: c.handle,
    title: c.title,
    description: c.description,
    seo: c.seo || { title: c.title, description: c.description },
    path: `/search/${c.handle}`,
    updatedAt: c.updated_at,
  };
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  // First get the collection ID
  const { data: c } = await getSupabase().from("collections").select("id").eq("handle", collection).single();
  
  if (!c) return [];

  // Then get all products in this collection
  const { data: pcs } = await getSupabase()
    .from("product_collections")
    .select("products(*)")
    .eq("collection_id", c.id);

  if (!pcs) return [];

  let products = pcs.map((pc: any) => pc.products).filter(Boolean);

  let mappedProducts = products.map((p: any) => ({
    id: p.id,
    handle: p.handle,
    availableForSale: p.available_for_sale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.description_html,
    options: p.options || [],
    priceRange: p.price_range || {
      maxVariantPrice: { amount: "0", currencyCode: "VND" },
      minVariantPrice: { amount: "0", currencyCode: "VND" },
    },
    variants: p.variants || [],
    featuredImage: p.featured_image || { url: "", altText: "", width: 0, height: 0 },
    images: p.images || [],
    seo: p.seo || { title: "", description: "" },
    tags: p.tags || [],
    updatedAt: p.updated_at,
  }));

  // Sort
  if (sortKey) {
    switch (sortKey) {
      case "PRICE":
        mappedProducts.sort((a, b) => {
          const priceA = Number(a.priceRange.minVariantPrice.amount);
          const priceB = Number(b.priceRange.minVariantPrice.amount);
          return priceA - priceB;
        });
        break;
      case "CREATED_AT":
        mappedProducts.sort(
          (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
        break;
      default:
        break;
    }
  }

  if (reverse) {
    mappedProducts.reverse();
  }

  return mappedProducts;
}

// --- Menu ---

export async function getMenu(handle: string): Promise<Menu[]> {
  // Keep the hardcoded menu or return empty as before
  if (handle.includes("header")) {
    return []; // Fallback to empty if not fetched from store.json
  }
  if (handle.includes("footer")) {
    return [];
  }
  return [];
}

// --- Pages ---

export async function getPage(handle: string): Promise<Page> {
  return {
    id: handle,
    title: handle.charAt(0).toUpperCase() + handle.slice(1),
    handle,
    body: "",
    bodySummary: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getPages(): Promise<Page[]> {
  return [];
}

// --- Cart (server-side helpers for cookie-based cart) ---

export async function createCart(): Promise<Cart> {
  return {
    id: `cart-${Date.now()}`,
    checkoutUrl: "/checkout",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "VND" },
      totalAmount: { amount: "0", currencyCode: "VND" },
    },
  };
}

export async function getCart(): Promise<Cart | undefined> {
  return undefined;
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  return createCart();
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  return createCart();
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  return createCart();
}

// --- Admin: CRUD operations for products ---
// These are deprecated for the client side now that we have direct Supabase calls
// but we keep the stubs so we don't break existing imports immediately
export function getAllProductsSync(): (Product & { collections?: string[] })[] {
  return [];
}
export function addProduct(product: Product & { collections?: string[] }): void {}
export function updateProduct(
  handle: string,
  updates: Partial<Product & { collections?: string[] }>,
): Product | undefined {
  return undefined;
}
export function deleteProduct(handle: string): boolean { return false; }
export function addCollection(collection: Omit<Collection, "path">): void {}
export function deleteCollection(handle: string): boolean { return false; }
