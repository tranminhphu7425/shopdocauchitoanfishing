import { useEffect, useState } from "react";
import { Carousel } from "components/carousel";
import Features from "components/features";
import { ThreeItemGrid } from "components/grid/three-items";
import Hero from "components/hero";
import ShopInfo from "components/shop-info";
import { getProducts } from "lib/local";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Chí Toàn Fishing Shop";
    
    async function loadData() {
      try {
        const data = await getProducts({});
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <>
      <Hero />
      <ShopInfo totalProducts={products.length} />
      <Features />
      <ThreeItemGrid initialProducts={products} />
      <Carousel initialProducts={products} />
    </>
  );
}
