import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SortableProductList from "components/layout/sortable-product-list";
import SearchLayout from "components/layout/search/layout";
import { getCollection, getCollectionProducts, getProducts } from "lib/local";

export default function SearchPage() {
  const { collection } = useParams<{ collection?: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    async function loadData() {
      try {
        if (collection) {
          const col = await getCollection(collection);
          if (!col) {
            if (isMounted) setNotFound(true);
            return;
          }
          document.title = `${col.title} | Chí Toàn Fishing`;
          const data = await getCollectionProducts({ collection });
          if (isMounted) setProducts(data.filter((p: any) => p.availableForSale));
        } else {
          document.title = "Tất cả sản phẩm | Chí Toàn Fishing";
          const data = await getProducts({});
          if (isMounted) setProducts(data.filter((p: any) => p.availableForSale));
        }
      } catch (error) {
        console.error("Error loading search products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [collection]);

  return (
    <SearchLayout>
      {notFound ? (
        <div className="flex h-64 items-center justify-center text-xl font-bold">
          Danh mục không tồn tại
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : (
        <SortableProductList products={products} />
      )}
    </SearchLayout>
  );
}
