import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCollections } from "lib/local";
import { ProductTable } from "components/admin/product-table";
import {
  Square3Stack3DIcon,
  CheckCircleIcon,
  EyeSlashIcon,
  FolderIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { SkeletonAdminDashboard } from "components/skeleton";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [collectionsCount, setCollectionsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Quản lý sản phẩm - Chí Toàn Fishing";

    async function loadData() {
      try {
        const [prodsData, colsData] = await Promise.all([
          getProducts({}),
          getCollections(),
        ]);
        setProducts(prodsData);
        setCollectionsCount(colsData.length);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => p.availableForSale !== false,
  ).length;
  const hiddenProducts = products.filter(
    (p) => p.availableForSale === false,
  ).length;

  if (loading) {
    return <SkeletonAdminDashboard />;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Tổng quan kho hàng, phân loại và trạng thái hiển thị của cửa hàng Chí Toàn Fishing
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* 4 KPI Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng sản phẩm */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-none">
            <Square3Stack3DIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
              Tổng sản phẩm
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">
              {totalProducts}
            </span>
          </div>
        </div>

        {/* Card 2: Đang hiển thị bán */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
              Đang hiển thị bán
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeProducts}
            </span>
          </div>
        </div>

        {/* Card 3: Đã tạm ẩn */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center flex-none">
            <EyeSlashIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
              Đã tạm ẩn
            </span>
            <span className="text-2xl font-black text-neutral-700 dark:text-neutral-300">
              {hiddenProducts}
            </span>
          </div>
        </div>

        {/* Card 4: Tổng danh mục */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-none">
            <FolderIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
              Danh mục
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {collectionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ProductTable products={products} />
    </div>
  );
}
