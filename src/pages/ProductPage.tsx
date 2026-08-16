import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct, getProductRecommendations } from "lib/local";
import { ProductDetailView } from "components/product/product-detail-view";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { SkeletonProductDetail } from "components/skeleton";

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setNotFound(false);

    async function loadData() {
      try {
        const prod = await getProduct(handle!);
        if (!prod) {
          setNotFound(true);
          return;
        }
        
        document.title = prod.seo?.title || prod.title;
        setProduct(prod);
        
        const related = await getProductRecommendations(prod.id);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [handle]);

  if (notFound) {
    return <div className="flex justify-center items-center h-64 text-2xl font-bold">Sản phẩm không tồn tại</div>;
  }

  if (loading || !product) {
    return <SkeletonProductDetail />;
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || "VND",
      highPrice: product.priceRange?.maxVariantPrice?.amount,
      lowPrice: product.priceRange?.minVariantPrice?.amount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <ProductDetailView initialProduct={product} relatedProducts={relatedProducts} handle={handle!} />
    </>
  );
}
