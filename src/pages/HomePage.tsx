import { useEffect, useState } from "react";
import { ThreeItemGrid } from "components/grid/three-items";
import Hero from "components/hero";
import { getProducts, getCollections } from "lib/local";
import { SkeletonThreeItemGrid } from "components/skeleton";
import { CategorySection } from "components/category-section";
import type { Collection } from "lib/local/types";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Chí Toàn Fishing Shop";
    
    async function loadData() {
      try {
        const [prodData, colData] = await Promise.all([
          getProducts({}),
          getCollections()
        ]);
        setProducts(prodData);
        // Lọc bỏ danh mục "Tất cả sản phẩm" (handle rỗng)
        setCollections(colData.filter(c => c.handle !== ""));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <>
      <Hero />
      
      {loading ? (
        <SkeletonThreeItemGrid />
      ) : (
        <ThreeItemGrid initialProducts={products} />
      )}
      
      <div className="space-y-6 md:space-y-12 mb-16">
        {collections.map((collection) => (
          <CategorySection key={collection.handle} collection={collection} />
        ))}
      </div>
    </>
  );
}
