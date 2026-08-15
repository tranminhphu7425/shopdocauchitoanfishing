import { getProducts } from "lib/local";
import Link from "next/link";
import { ProductTable } from "components/admin/product-table";

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Link
          href="/admin/products/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium text-sm"
        >
          + Thêm sản phẩm mới
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
