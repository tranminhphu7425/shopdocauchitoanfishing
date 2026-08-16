import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "lib/local";
import { ProductForm } from "components/admin/product-form";

export default function EditProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) return;
    
    async function loadData() {
      try {
        const data = await getProduct(handle!);
        if (!data) {
          setNotFound(true);
          return;
        }
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [handle]);

  if (notFound) {
    return <div className="p-8">Sản phẩm không tồn tại</div>;
  }

  if (loading || !product) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          to="/admin"
          className="text-neutral-700 hover:text-orange-600 font-medium"
        >
          ← Quay lại
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
      </div>
      <ProductForm initialData={product} />
    </div>
  );
}
