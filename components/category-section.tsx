import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GridTileImage } from "components/grid/tile";
import { getCollectionProducts } from "lib/local";
import { Product, Collection } from "lib/local/types";
import { getCheapestVariantDiscount } from "lib/local/discount";

export function CategorySection({ collection }: { collection: Collection }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollectionProducts({
          collection: collection.handle,
        });
        // Display up to 5 products per category row (or you could use a carousel here if preferred)
        setProducts(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [collection.handle]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>
          {collection.title}
        </h2>
        <Link
          to={collection.path}
          className="text-xs md:text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-4 py-2 rounded-full transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const { discountPercent, minPrice, compareAtAmount } =
              getCheapestVariantDiscount(product);
            return (
              <div key={product.handle} className="group">
                <Link
                  className="relative block aspect-square h-full w-full"
                  to={`/product/${product.handle}`}
                >
                  <GridTileImage
                    src={product.featuredImage?.url}
                    alt={product.title}
                    label={{
                      title: product.title,
                      amount: minPrice,
                      currencyCode:
                        product.priceRange.minVariantPrice.currencyCode,
                      compareAtAmount: compareAtAmount,
                      position: "bottom",
                    }}
                    discountPercent={discountPercent}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
