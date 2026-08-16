import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCachedImageUrl, getImageCache } from "lib/local/image-cache";
import { formatImageUrl } from "lib/site-config";
import { updateProductAction, deleteProductAction } from "../../src/actions";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function TableProductImage({ src, alt }: { src: string; alt: string }) {
  const cachedSrc = useCachedImageUrl(src);
  const rawSrc = cachedSrc || getImageCache(src) || src;
  const effectiveSrc = formatImageUrl(rawSrc);
  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs"
      onError={(e) => {
        const cached = getImageCache(src);
        if (cached && e.currentTarget.src !== cached) {
          e.currentTarget.src = formatImageUrl(cached);
        }
      }}
    />
  );
}

export function ProductTable({
  products: initialProducts,
}: {
  products: any[];
}) {
  const [productList, setProductList] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [togglingHandle, setTogglingHandle] = useState<string | null>(null);

  // Single Product Delete Modal State
  const [productToDelete, setProductToDelete] = useState<{
    handle: string;
    title: string;
  } | null>(null);

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setProductList(initialProducts);
  }, [initialProducts]);

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredProducts = productList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const queryClean = removeAccents(searchQuery.toLowerCase().trim());
    const titleClean = removeAccents((p.title || "").toLowerCase());
    const handleClean = removeAccents((p.handle || "").toLowerCase());
    const descClean = removeAccents((p.description || "").toLowerCase());
    return (
      titleClean.includes(queryClean) ||
      handleClean.includes(queryClean) ||
      descClean.includes(queryClean)
    );
  });

  // Select / Deselect All
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedHandles.includes(p.handle));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedHandles([]);
    } else {
      setSelectedHandles(filteredProducts.map((p) => p.handle));
    }
  };

  const toggleSelectOne = (handle: string) => {
    setSelectedHandles((prev) =>
      prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle],
    );
  };

  // Quick Status Toggle Switch
  const handleToggleStatus = async (handle: string, currentAvailable: boolean) => {
    setTogglingHandle(handle);
    const newStatus = !currentAvailable;

    try {
      const res = await updateProductAction(handle, {
        availableForSale: newStatus,
      });

      if (res.success) {
        setProductList((prev) =>
          prev.map((p) =>
            p.handle === handle ? { ...p, availableForSale: newStatus } : p,
          ),
        );
        toast.success(
          newStatus
            ? "🟢 Sản phẩm đã chuyển sang trạng thái HIỂN THỊ!"
            : "🔒 Sản phẩm đã chuyển sang trạng thái TẠM ẨN!",
        );
      } else {
        toast.error(res.error || "Lỗi khi cập nhật trạng thái");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi đổi trạng thái");
    } finally {
      setTogglingHandle(null);
    }
  };

  // Bulk Status Update (Hiển thị / Tạm ẩn hàng loạt)
  const handleBulkStatusChange = async (available: boolean) => {
    if (selectedHandles.length === 0) return;
    setIsProcessing(true);

    try {
      let successCount = 0;
      for (const h of selectedHandles) {
        const res = await updateProductAction(h, { availableForSale: available });
        if (res.success) successCount++;
      }

      setProductList((prev) =>
        prev.map((p) =>
          selectedHandles.includes(p.handle)
            ? { ...p, availableForSale: available }
            : p,
        ),
      );

      toast.success(
        available
          ? `🟢 Đã bật hiển thị cho ${successCount} sản phẩm!`
          : `🔒 Đã tạm ẩn ${successCount} sản phẩm!`,
      );
      setSelectedHandles([]);
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi cập nhật hàng loạt");
    } finally {
      setIsProcessing(false);
    }
  };

  // Single Product Delete Action
  const confirmSingleDelete = async () => {
    if (!productToDelete) return;
    setIsProcessing(true);

    try {
      const { success, error } = await deleteProductAction(
        productToDelete.handle,
      );

      if (success) {
        setProductList((prev) =>
          prev.filter((p) => p.handle !== productToDelete.handle),
        );
        setSelectedHandles((prev) =>
          prev.filter((h) => h !== productToDelete.handle),
        );
        toast.success(`Đã xóa vĩnh viễn sản phẩm "${productToDelete.title}"`);
      } else {
        toast.error(error || "Có lỗi xảy ra khi xóa sản phẩm");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa");
    } finally {
      setIsProcessing(false);
      setProductToDelete(null);
    }
  };

  // Bulk Product Delete Action
  const confirmBulkDelete = async () => {
    if (selectedHandles.length === 0) return;
    setIsProcessing(true);

    try {
      let successCount = 0;
      for (const h of selectedHandles) {
        const res = await deleteProductAction(h);
        if (res.success) successCount++;
      }

      setProductList((prev) =>
        prev.filter((p) => !selectedHandles.includes(p.handle)),
      );
      toast.success(`Đã xóa vĩnh viễn ${successCount} sản phẩm đã chọn!`);
      setSelectedHandles([]);
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa hàng loạt");
    } finally {
      setIsProcessing(false);
      setIsBulkDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-10 py-2.5 text-sm focus:border-orange-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Hiển thị{" "}
          <span className="text-orange-600 dark:text-orange-500 font-bold">
            {filteredProducts.length}
          </span>{" "}
          / {productList.length} sản phẩm
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedHandles.length > 0 && (
        <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black p-3.5 px-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Đã chọn {selectedHandles.length} sản phẩm
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              disabled={isProcessing}
              onClick={() => handleBulkStatusChange(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Hiện đã chọn</span>
            </button>
            <button
              disabled={isProcessing}
              onClick={() => handleBulkStatusChange(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-700 hover:bg-neutral-800 text-white dark:bg-neutral-200 dark:hover:bg-neutral-300 dark:text-black font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <EyeSlashIcon className="w-4 h-4" />
              <span>Ẩn đã chọn</span>
            </button>
            <button
              disabled={isProcessing}
              onClick={() => setIsBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Xóa đã chọn</span>
            </button>
            <button
              onClick={() => setSelectedHandles([])}
              className="text-xs font-bold text-neutral-400 hover:text-white dark:hover:text-black ml-2 transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-bold">Ảnh</th>
                <th className="p-4 font-bold">Tên sản phẩm</th>
                <th className="p-4 font-bold">Giá bán</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
                <th className="p-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-sm text-neutral-500"
                  >
                    {searchQuery ? (
                      <div>
                        Không tìm thấy sản phẩm nào khớp với từ khóa "
                        <strong>{searchQuery}</strong>".
                      </div>
                    ) : (
                      "Chưa có sản phẩm nào."
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isChecked = selectedHandles.includes(product.handle);
                  const isAvailable = product.availableForSale !== false;
                  const isTogglingThis = togglingHandle === product.handle;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isChecked
                          ? "bg-orange-50/50 dark:bg-orange-950/20"
                          : "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(product.handle)}
                          className="w-4 h-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Image Column */}
                      <td className="p-4">
                        <TableProductImage
                          src={product.featuredImage?.url || ""}
                          alt={product.title}
                        />
                      </td>

                      {/* Title & Handle Column */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {product.handle}
                        </div>
                      </td>

                      {/* Price Column */}
                      <td className="p-4 text-sm font-extrabold text-orange-600 dark:text-orange-500 whitespace-nowrap">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          Number(product.priceRange.minVariantPrice.amount),
                        )}
                      </td>

                      {/* Quick Status Toggle Switch Column */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isTogglingThis}
                          onClick={() =>
                            handleToggleStatus(product.handle, isAvailable)
                          }
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs whitespace-nowrap cursor-pointer ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 hover:bg-neutral-200"
                          } ${isTogglingThis ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Bấm để bật/tắt hiển thị sản phẩm"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isAvailable ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                            }`}
                          />
                          <span className="whitespace-nowrap">{isAvailable ? "Hiển thị" : "Tạm ẩn"}</span>
                        </button>
                      </td>

                      {/* Action Column */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 text-xs font-bold whitespace-nowrap">
                          <Link
                            to={`/admin/products/${product.handle}/edit`}
                            className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/60 transition-all whitespace-nowrap"
                          >
                            Sửa ✏️
                          </Link>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-all whitespace-nowrap cursor-pointer"
                            onClick={() =>
                              setProductToDelete({
                                handle: product.handle,
                                title: product.title,
                              })
                            }
                          >
                            Xóa 🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Red Confirmation Modal for Single Product Delete */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-500 flex items-center justify-center flex-none shadow-inner">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                  Xác Nhận Xóa Sản Phẩm
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm:
              <div className="font-bold text-red-600 dark:text-red-400 mt-1 text-base leading-snug">
                "{productToDelete.title}"
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isProcessing}
                onClick={confirmSingleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "Đang xóa..." : "XÓA VĨNH VIỄN 🗑️"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Red Confirmation Modal for Bulk Delete */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-500 flex items-center justify-center flex-none shadow-inner">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                  Xóa Hàng Loạt Sản Phẩm
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Cảnh báo hành động nguy hiểm!
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
              Bạn đang chuẩn bị xóa vĩnh viễn{" "}
              <strong className="text-red-600 dark:text-red-400 font-extrabold text-base">
                {selectedHandles.length} sản phẩm
              </strong>{" "}
              đã chọn khỏi cửa hàng và CSDL Supabase.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setIsBulkDeleteOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isProcessing}
                onClick={confirmBulkDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "Đang xóa hàng loạt..." : "XÁC NHẬN XÓA TẤT CẢ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
