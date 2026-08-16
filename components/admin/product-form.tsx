import { createProductAction, updateProductAction } from "../../src/actions";
import { getImageCache, useCachedImageUrl } from "lib/local/image-cache";
import { Collection, Product, ProductOption, ProductVariant } from "lib/local/types";
import { useNavigate } from "react-router-dom";
import { getCollections } from "lib/local";
import { supabase } from "lib/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Drag and Drop Upload Zone Component
function DropZone({
  onFilesSelected,
  multiple = true,
  disabled = false,
  label = "Kéo & thả file ảnh vào đây, hoặc click để chọn file",
  sublabel = "Hỗ trợ định dạng JPG, PNG, WEBP, AVIF",
}: {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragOver(true);
    } else if (e.type === "dragleave") {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (filesArr.length > 0) {
        onFilesSelected(filesArr);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${
        disabled
          ? "opacity-50 cursor-not-allowed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
          : isDragOver
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 scale-[0.99]"
            : "border-neutral-300 dark:border-neutral-700 hover:border-orange-400 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/10"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <div className="w-10 h-10 mb-2 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
          />
        </svg>
      </div>
      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {label}
      </p>
      {sublabel && (
        <p className="text-[11px] text-neutral-400 mt-1">{sublabel}</p>
      )}
    </div>
  );
}

// Image Preview Component with Cache & Fallback
function FormImagePreview({
  src,
  alt,
  className,
  isFeatured = false,
  onSetFeatured,
  onRemove,
}: {
  src: string;
  alt?: string;
  className?: string;
  isFeatured?: boolean;
  onSetFeatured?: () => void;
  onRemove?: () => void;
}) {
  const cachedSrc = useCachedImageUrl(src);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  // Directly resolve Data URL from getImageCache before falling back to raw src
  const displaySrc = fallbackSrc || cachedSrc || getImageCache(src) || src;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl border transition-all ${isFeatured ? "border-orange-500 ring-2 ring-orange-500/30" : "border-neutral-200 dark:border-neutral-700"}`}
    >
      <img
        src={displaySrc}
        alt={alt || "Preview"}
        className={className || "h-24 w-24 object-cover"}
        onError={(e) => {
          const cached = getImageCache(src);
          if (cached && e.currentTarget.src !== cached) {
            setFallbackSrc(cached);
            e.currentTarget.src = cached;
          }
        }}
      />
      {isFeatured && (
        <span className="absolute top-1 left-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          ★ Bìa
        </span>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
        {!isFeatured && onSetFeatured && (
          <button
            type="button"
            onClick={onSetFeatured}
            className="bg-white/90 dark:bg-neutral-800 text-neutral-800 dark:text-white hover:bg-orange-500 hover:text-white text-[10px] font-bold px-1.5 py-1 rounded transition-colors"
            title="Đặt làm ảnh bìa"
          >
            ★ Bìa
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-1 rounded hover:bg-red-600 transition-colors"
            title="Xóa ảnh này"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Pill Tags Preview Component for Options
function OptionPillTags({ valuesStr }: { valuesStr: string }) {
  if (!valuesStr.trim()) return null;
  const values = valuesStr
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  if (values.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {values.map((val, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50"
        >
          {val}
        </span>
      ))}
    </div>
  );
}

// Helper to compress image file and convert to optimized Base64 Data URL
const compressImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82,
): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return compressImageFile(file);
};

// Helper to generate cartesian product of option values
const cartesian = (arrays: string[][]): string[][] => {
  if (arrays.length === 0) return [];
  return arrays.reduce((acc, curr) => {
    if (curr.length === 0) return acc;
    if (acc.length === 0) return curr.map((c) => [c]);
    return acc.flatMap((a) => curr.map((c) => [...a, c]));
  }, [] as string[][]);
};

// Helper to format number string with dots as thousand separators
const formatNumberString = (
  value: string | number | undefined | null,
): string => {
  if (value === undefined || value === null) return "";
  const str = typeof value === "number" ? value.toString() : value;
  const clean = str.replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(clean));
};

// Helper to clean price inputs and strip non-digits
const cleanPriceInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

function MobileStorefrontPreview({
  title,
  imageUrl,
  galleryImages,
  previewMinPrice,
  previewComparePrice,
  previewDiscountPercent,
  availableForSale,
  selectedCollections,
  availableCollections,
  description,
}: {
  title: string;
  imageUrl: string;
  galleryImages: string[];
  previewMinPrice: number;
  previewComparePrice: number;
  previewDiscountPercent: number;
  availableForSale: boolean;
  selectedCollections: string[];
  availableCollections: { title: string; handle: string }[];
  options?: { id: string; name: string; valuesStr: string }[];
  tags?: string[];
  description: string;
}) {
  const allImages = [imageUrl, ...galleryImages].filter(Boolean);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [cartToast, setCartToast] = useState(false);

  const handleNextImg = () => {
    if (allImages.length === 0) return;
    setActiveImgIdx((prev) => (prev + 1 < allImages.length ? prev + 1 : 0));
  };

  const handlePrevImg = () => {
    if (allImages.length === 0) return;
    setActiveImgIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleAddToCartClick = () => {
    setCartToast(true);
    setTimeout(() => setCartToast(false), 2500);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto rounded-[42px] border-[8px] border-neutral-900 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans transition-all">
      {/* Phone Notch / Dynamic Island */}
      <div className="bg-neutral-900 dark:bg-neutral-800 h-6 w-full flex justify-center items-end pb-1 flex-none">
        <div className="w-28 h-4 bg-black rounded-b-2xl flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-900/40"></span>
        </div>
      </div>

      {/* Mini Storefront Top Navigation Bar (Header) */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xs flex-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-neutral-400">←</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
            Chí Toàn Fishing
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-black dark:border-neutral-700 dark:text-white text-xs">
            🛒
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </div>
        </div>
      </div>

      {/* Phone Screen Scrollable Body (Matching /product/[handle]) */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[800px] text-left">
        {/* Gallery Box (Exact replica of components/product/gallery.tsx) */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-xs">
          <img
            src={allImages[activeImgIdx] || "https://placehold.co/800x800.png?text=Anh+San+Pham"}
            alt={title || "Sản phẩm"}
            className="h-full w-full object-contain p-2"
          />

          {/* Discount Badge */}
          {previewDiscountPercent > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-md">
              -{previewDiscountPercent}%
            </div>
          )}

          {/* Availability Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${
                availableForSale
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {availableForSale ? "✓ Đang bán" : "🔒 Tạm ẩn"}
            </span>
          </div>

          {/* Previous / Next Arrow Controls Overlay */}
          {allImages.length > 1 && (
            <div className="absolute bottom-[10%] flex w-full justify-center">
              <div className="mx-auto flex h-9 items-center rounded-full border border-white/80 bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 backdrop-blur-sm shadow-md px-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handlePrevImg}
                  className="px-2 font-bold hover:scale-110 transition-transform cursor-pointer"
                  title="Ảnh trước"
                >
                  ←
                </button>
                <div className="h-4 w-px bg-neutral-400"></div>
                <button
                  type="button"
                  onClick={handleNextImg}
                  className="px-2 font-bold hover:scale-110 transition-transform cursor-pointer"
                  title="Ảnh tiếp"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Thumbnails Strip (GridTileImage style) */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {allImages.map((imgSrc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImgIdx(i)}
                className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all flex-none bg-neutral-50 dark:bg-neutral-900 ${
                  i === activeImgIdx
                    ? "border-orange-500 ring-2 ring-orange-500/50 scale-105 shadow-sm"
                    : "border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={imgSrc} className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}

        {/* Product Title & Price (Exact replica of ProductPrice) */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 space-y-3">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">
            {title || "Tên sản phẩm chưa nhập..."}
          </h1>

          {/* Product Price Bar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="mr-auto flex w-auto items-center gap-2 rounded-full bg-orange-600 p-2 text-sm text-white font-bold">
              <span>{previewMinPrice ? `${formatNumberString(previewMinPrice)} đ` : "0 đ"}</span>
              {previewDiscountPercent > 0 && (
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600">
                  -{previewDiscountPercent}%
                </span>
              )}
            </div>

            {previewComparePrice > previewMinPrice && (
              <div className="text-xs text-neutral-700 line-through dark:text-neutral-400 font-medium">
                {formatNumberString(previewComparePrice)} đ
              </div>
            )}
          </div>
        </div>

        {/* Selected Collections Pills */}
        {selectedCollections.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Danh mục:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCollections.map((colHandle) => {
                const colObj = availableCollections.find((c) => c.handle === colHandle);
                return (
                  <span
                    key={colHandle}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 text-[11px] font-bold border border-orange-200 dark:border-orange-900/50"
                  >
                    📁 {colObj?.title || colHandle}
                  </span>
                );
              })}
            </div>
          </div>
        )}


        {/* Product Description Snippet */}
        {description && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Mô tả chi tiết:
            </span>
            <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 italic whitespace-pre-wrap break-words">
              {description}
            </div>
          </div>
        )}

        {/* Add To Cart Pill Button (Exact replica of AddToCart) */}
        <div className="pt-2">
          {cartToast && (
            <div className="mb-2 p-2 bg-emerald-500 text-white text-[11px] font-bold rounded-xl text-center shadow-md animate-fadeIn">
              ✓ Đã thêm vào giỏ hàng thành công (Mô phỏng)!
            </div>
          )}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="relative flex w-full items-center justify-center rounded-full bg-orange-600 p-3.5 tracking-wide text-white font-bold text-xs shadow-lg shadow-orange-600/30 hover:bg-orange-700 active:scale-98 transition-all cursor-pointer"
          >
            <div className="absolute left-0 ml-4 font-bold text-sm">+</div>
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ initialData }: { initialData?: Product }) {
  const router = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Basic info
  const [title, setTitle] = useState(initialData?.title || "");
  const [handle, setHandle] = useState(initialData?.handle || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [imageUrl, setImageUrl] = useState(
    initialData?.featuredImage?.url || "",
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (!initialData?.images) return [];
    const featUrl = initialData.featuredImage?.url;
    return initialData.images
      .map((img) => img.url)
      .filter((url) => url !== featUrl);
  });
  const [availableForSale, setAvailableForSale] = useState(
    initialData?.availableForSale ?? true,
  );

  // Collections State
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    (initialData as any)?.collections || [],
  );

  // Tags State
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showMobilePreviewDrawer, setShowMobilePreviewDrawer] = useState(false);

  // Validation States
  const [titleError, setTitleError] = useState("");
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});

  // Unsaved Changes Protection (isDirty)
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleAddTag = (tagToAdd?: string) => {
    const targetTag = (tagToAdd || tagInput).trim();
    if (!targetTag) return;
    if (!tags.includes(targetTag)) {
      setTags((prev) => [...prev, targetTag]);
      setIsDirty(true);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    async function loadCollectionsData() {
      try {
        const cols = await getCollections();
        const filteredCols = cols.filter(
          (c) =>
            c.handle !== "all" &&
            c.handle !== "tat-ca-san-pham" &&
            c.title.toLowerCase() !== "tất cả sản phẩm" &&
            c.title.toLowerCase() !== "tất cả",
        );
        setAvailableCollections(filteredCols);
      } catch (err) {
        console.error("Lỗi khi tải danh sách danh mục:", err);
      }
    }
    loadCollectionsData();
  }, []);

  const toggleCollection = (colHandle: string) => {
    setIsDirty(true);
    setSelectedCollections((prev) =>
      prev.includes(colHandle)
        ? prev.filter((h) => h !== colHandle)
        : [...prev, colHandle],
    );
  };


  // Options
  const [options, setOptions] = useState<
    { id: string; name: string; valuesStr: string }[]
  >(
    initialData?.options &&
      initialData.options.length > 0 &&
      initialData.options[0]?.name !== "Title"
      ? initialData.options.map((o, i) => ({
          id: o.id || `opt-${i}`,
          name: o.name,
          valuesStr: o.values.join(", "),
        }))
      : [],
  );

  // Variants
  const [variantsData, setVariantsData] = useState<Record<string, any>>(() => {
    const vData: Record<string, any> = {};
    if (initialData?.variants) {
      initialData.variants.forEach((v) => {
        vData[v.title] = {
          price: v.price?.amount || "",
          compareAtPrice: v.compareAtPrice?.amount || "",
          availableForSale: v.availableForSale ?? true,
          images:
            v.images?.map((img) => img.url) || (v.image ? [v.image.url] : []),
        };
      });
    }
    return vData;
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData) {
      const newHandle = newTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setHandle(newHandle);
    }
  };

  // Process files for featured or variant images
  const processUploadedFiles = async (files: File[], variantTitle?: string) => {
    if (!files || files.length === 0) return;

    const generatedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const timestamp = Date.now();
        const cleanFileName = file.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9.]+/g, "-");
        const filename = `${timestamp}-${cleanFileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("products")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          toast.error(`Lỗi tải ảnh: ${error.message}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filename);

        generatedUrls.push(publicUrlData.publicUrl);
      }
    }

    if (variantTitle) {
      setVariantsData((prev) => {
        const current = prev[variantTitle] || {};
        return {
          ...prev,
          [variantTitle]: {
            ...current,
            images: [...(current.images || []), ...generatedUrls],
          },
        };
      });
    } else {
      if (generatedUrls.length > 0 && generatedUrls[0]) {
        setImageUrl(generatedUrls[0]);
      }
    }

    toast.success(`Đã tải lên ${generatedUrls.length} ảnh thành công!`);
  };

  // Process gallery files
  const processGalleryFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const generatedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const timestamp = Date.now();
        const cleanFileName = file.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9.]+/g, "-");
        const filename = `${timestamp}-${cleanFileName}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from("products")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          toast.error(`Lỗi tải ảnh: ${error.message}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filename);

        generatedUrls.push(publicUrlData.publicUrl);
      }
    }

    setGalleryImages((prev) => [...prev, ...generatedUrls]);
    toast.success(
      `Đã tải lên ${generatedUrls.length} ảnh bộ sưu tập thành công`,
    );
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsFeaturedImage = (targetUrl: string) => {
    if (targetUrl === imageUrl) return;
    const oldFeatured = imageUrl;
    setImageUrl(targetUrl);

    // Swap old featured into gallery if exists
    if (oldFeatured) {
      setGalleryImages((prev) => {
        const filtered = prev.filter((u) => u !== targetUrl);
        return [oldFeatured, ...filtered];
      });
    } else {
      setGalleryImages((prev) => prev.filter((u) => u !== targetUrl));
    }
    toast.success("★ Đã đặt làm ảnh bìa chính sản phẩm!");
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: `opt-${Date.now()}`, name: "", valuesStr: "" },
    ]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (
    index: number,
    field: "name" | "valuesStr",
    value: string,
  ) => {
    const newOptions = [...options];
    if (newOptions[index]) {
      newOptions[index][field] = value;
      setOptions(newOptions);
    }
  };

  const variantList = useMemo(() => {
    const validOptions = options.filter(
      (o) => o.name.trim() !== "" && o.valuesStr.trim() !== "",
    );
    if (validOptions.length === 0) return [];

    const arrays = validOptions.map((o) =>
      o.valuesStr
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    );
    const isAnyEmpty = arrays.some((a) => a.length === 0);
    if (isAnyEmpty) return [];

    const combinations = cartesian(arrays);
    return combinations.map((combo) => {
      const title = combo.join(" / ");
      const selectedOptions = combo.map((val, idx) => ({
        name: validOptions[idx]?.name.trim() || "",
        value: val,
      }));
      return { title, selectedOptions };
    });
  }, [options]);

  const handleVariantChange = (title: string, field: string, value: any) => {
    setVariantsData((prev) => ({
      ...prev,
      [title]: {
        ...(prev[title] || {}),
        [field]: value,
      },
    }));
  };

  const removeVariantImage = (title: string, imgIndex: number) => {
    setVariantsData((prev) => {
      const current = prev[title] || {};
      const newImages = [...(current.images || [])];
      newImages.splice(imgIndex, 1);
      return {
        ...prev,
        [title]: {
          ...current,
          images: newImages,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Vui lòng nhập tên sản phẩm");
      toast.error("Vui lòng điền Tên sản phẩm.");
      scrollToSection("sec-basic");
      return;
    }

    if (!imageUrl) {
      toast.error("Vui lòng chọn hoặc tải ảnh bìa sản phẩm!");
      scrollToSection("sec-gallery");
      return;
    }
    setIsSubmitting(true);

    try {
      const validOptions = options.filter(
        (o) => o.name.trim() !== "" && o.valuesStr.trim() !== "",
      );

      const finalOptions: ProductOption[] =
        validOptions.length > 0
          ? validOptions.map((o) => ({
              id: o.id,
              name: o.name.trim(),
              values: o.valuesStr
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            }))
          : [
              {
                id: `opt-default`,
                name: "Title",
                values: ["Default Title"],
              },
            ];

      const variantsToSave: ProductVariant[] = [];
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      const allImages: string[] = imageUrl ? [imageUrl] : [];
      galleryImages.forEach((url) => {
        if (url && !allImages.includes(url)) allImages.push(url);
      });

      if (validOptions.length > 0 && variantList.length > 0) {
        variantList.forEach((v, idx) => {
          const vData = variantsData[v.title] || {};
          const priceAmt = vData.price || "0";
          const p = Number(priceAmt);
          if (p < minPrice) minPrice = p;
          if (p > maxPrice) maxPrice = p;

          const images = (vData.images || []).map((imgUrl: string) => ({
            url: imgUrl,
            altText: v.title,
            width: 800,
            height: 800,
          }));

          images.forEach((img: any) => {
            if (!allImages.includes(img.url)) allImages.push(img.url);
          });

          variantsToSave.push({
            id: `var-${Date.now()}-${idx}`,
            title: v.title,
            availableForSale: vData.availableForSale !== false,
            selectedOptions: v.selectedOptions,
            price: { amount: priceAmt, currencyCode: "VND" },
            compareAtPrice: vData.compareAtPrice
              ? { amount: vData.compareAtPrice, currencyCode: "VND" }
              : undefined,
            image: images.length > 0 ? images[0] : undefined,
            images: images.length > 0 ? images : undefined,
          });
        });
      } else {
        // Default variant
        const defaultTitle = "Default Title";
        const vData = variantsData[defaultTitle] || {};
        const priceAmt = vData.price || "0";
        minPrice = Number(priceAmt);
        maxPrice = Number(priceAmt);

        variantsToSave.push({
          id: `var-${Date.now()}`,
          title: defaultTitle,
          availableForSale: vData.availableForSale !== false,
          selectedOptions: [{ name: "Title", value: "Default Title" }],
          price: { amount: priceAmt, currencyCode: "VND" },
          compareAtPrice: vData.compareAtPrice
            ? { amount: vData.compareAtPrice, currencyCode: "VND" }
            : undefined,
        });
      }

      if (minPrice === Infinity) minPrice = 0;
      if (maxPrice === -Infinity) maxPrice = 0;

      const featuredImageObj = {
        url: imageUrl || "https://placehold.co/800x800.png",
        altText: title,
        width: 800,
        height: 800,
      };

      const finalImages = [
        featuredImageObj,
        ...allImages
          .filter((url) => url !== featuredImageObj.url)
          .map((url) => ({
            url,
            altText: title,
            width: 800,
            height: 800,
          })),
      ];

      // Find the cheapest variant based on selling price (price.amount)
      let cheapestVar = variantsToSave[0];
      if (variantsToSave.length > 1) {
        variantsToSave.forEach((v) => {
          if (parseFloat(v.price.amount) < parseFloat(cheapestVar.price.amount)) {
            cheapestVar = v;
          }
        });
      }

      const productData: Product & { collections?: string[] } = {
        id: initialData?.id || `prod-${Date.now()}`,
        handle: handle,
        title: title,
        availableForSale: availableForSale,
        description: description,
        descriptionHtml: description
          ? description
              .split("\n")
              .map((line) => line.trim())
              .map((line) => (line ? `<p>${line}</p>` : "<br />"))
              .join("")
          : "",
        options: finalOptions,
        priceRange: {
          minVariantPrice: {
            amount: cheapestVar ? cheapestVar.price.amount : "0",
            currencyCode: "VND",
          },
          maxVariantPrice: {
            amount: cheapestVar
              ? cheapestVar.compareAtPrice?.amount || cheapestVar.price.amount
              : "0",
            currencyCode: "VND",
          },
        },
        variants: variantsToSave,
        featuredImage: featuredImageObj,
        images: finalImages,
        seo: {
          title: title,
          description: description,
        },
        tags: tags,
        updatedAt: new Date().toISOString(),
        collections: selectedCollections,
      };

      if (initialData) {
        await updateProductAction(initialData.handle, productData);
      } else {
        await createProductAction(productData);
      }

      setIsDirty(false);
      toast.success(
        `🎉 Đã lưu sản phẩm "${title}" thành công!`,
      );

      router("/admin");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi hệ thống khi lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed values for Real-time Live Preview
  const { previewMinPrice, previewComparePrice, previewDiscountPercent } = useMemo(() => {
    let minP = Infinity;
    let compP = 0;

    if (options.length > 0 && variantList.length > 0) {
      variantList.forEach((v) => {
        const vData = variantsData[v.title] || {};
        const priceNum = Number(vData.price || 0);
        if (priceNum > 0 && priceNum < minP) minP = priceNum;
        const compareNum = Number(vData.compareAtPrice || 0);
        if (compareNum > compP) compP = compareNum;
      });
    } else {
      const defData = variantsData["Default Title"] || {};
      minP = Number(defData.price || 0);
      compP = Number(defData.compareAtPrice || 0);
    }

    if (minP === Infinity) minP = 0;
    const discount =
      compP > minP && minP > 0 ? Math.round(((compP - minP) / compP) * 100) : 0;

    return {
      previewMinPrice: minP,
      previewComparePrice: compP,
      previewDiscountPercent: discount,
    };
  }, [options, variantList, variantsData]);

  const handleCancel = () => {
    if (isDirty) {
      if (confirm("Dữ liệu chưa được lưu, bạn có chắc chắn muốn thoát không?")) {
        router(-1);
      }
    } else {
      router(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {initialData ? "Chỉnh Sửa Sản Phẩm" : "Tạo Sản Phẩm Mới"}
          </h1>
          <p className="text-xs text-neutral-700 dark:text-neutral-400 mt-1">
            {initialData
              ? `Cập nhật thông tin và hình ảnh cho "${initialData.title}"`
              : "Thêm sản phẩm mới vào cửa hàng của bạn"}
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 dark:bg-neutral-800 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Trạng thái bán:
          </span>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={availableForSale}
              onChange={(e) => setAvailableForSale(e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-empty after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
          </div>
          <span
            className={`text-xs font-bold w-16 ${
              availableForSale
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-400"
            }`}
          >
            {availableForSale ? "Hiển thị" : "Đã ẩn"}
          </span>
        </label>
      </div>

      {/* Sticky Quick Jump Tab Bar */}
      <div className="sticky top-20 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 flex-none">
          Nhảy nhanh:
        </span>
        <button
          type="button"
          onClick={() => scrollToSection("sec-basic")}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
        >
          1. Cơ Bản
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("sec-collections")}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
        >
          2. Danh Mục
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("sec-gallery")}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
        >
          3. Hình Ảnh
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("sec-options-prices")}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
        >
        4. Tùy Chọn & Giá
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("sec-tags")}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
        >
          5. Thẻ Tags
        </button>
      </div>

      {/* Responsive Grid: Left Column = Editor Cards, Right Column = Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (xl:col-span-7) */}
        <div className="xl:col-span-8 space-y-9">
          {/* Card 1: Thông tin cơ bản */}
          <div id="sec-basic" className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Thông Tin Cơ Bản
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Tên sản phẩm *
                </label>
                <input
                  required
                  type="text"
                  className={`w-full p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none transition-colors ${
                    titleError
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/20"
                      : "border-neutral-200 dark:border-neutral-700 focus:border-orange-500"
                  }`}
                  value={title}
                  onChange={(e) => {
                    handleTitleChange(e);
                    if (titleError) setTitleError("");
                  }}
                  onBlur={() => {
                    if (!title.trim()) setTitleError("Vui lòng nhập tên sản phẩm");
                  }}
                  placeholder="Ví dụ: Máy đứng Titan Special 3000"
                />
                {titleError && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">{titleError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Đường dẫn (URL Handle) *
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  value={handle}
                  onChange={(e) => {
                    setIsDirty(true);
                    setHandle(e.target.value);
                  }}
                  placeholder="may-dung-titan-special-3000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  value={description}
                  onChange={(e) => {
                    setIsDirty(true);
                    setDescription(e.target.value);
                  }}
                  placeholder="Nhập mô tả chi tiết về thông số kỹ thuật, chất liệu, ứng dụng của sản phẩm..."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Danh mục sản phẩm (Collections) */}
          <div id="sec-collections" className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Danh Mục Sản Phẩm (Collections)
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Chọn một hoặc nhiều danh mục để sản phẩm này xuất hiện khi khách chọn danh mục tương ứng
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Collections Badges */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Chọn danh mục sản phẩm:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableCollections.length === 0 ? (
                  <span className="text-xs text-neutral-400">Đang tải danh mục...</span>
                ) : (
                  availableCollections.map((col) => {
                    const isSelected = selectedCollections.includes(col.handle);
                    return (
                      <button
                        key={col.handle}
                        type="button"
                        onClick={() => toggleCollection(col.handle)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20 scale-[1.02]"
                            : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{col.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Thư viện hình ảnh */}
          <div id="sec-gallery" className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Bộ Sưu Tập Hình Ảnh
                  </h2>
                  <p className="text-xs text-neutral-700 dark:text-neutral-400">
                    Kéo thả file để tải ảnh lên. Nhấp vào ảnh bất kỳ để đặt làm
                    **Ảnh Bìa Chính**.
                  </p>
                </div>
              </div>
            </div>

            {uploadStatus && !isUploadingImage && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-xl text-xs flex items-center gap-2">
                <span>✓</span> {uploadStatus}
              </div>
            )}

            <DropZone
              onFilesSelected={(files) => {
                setIsDirty(true);
                processGalleryFiles(files);
              }}
              disabled={isUploadingImage}
              label="Kéo & thả file ảnh vào đây, hoặc click để tải lên bộ sưu tập"
              sublabel="Tải lên ảnh chính và ảnh các góc độ khác (mặt sau, chi tiết...)"
            />

            {/* Gallery Grid Display */}
            {(imageUrl || galleryImages.length > 0) && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Danh sách ảnh đã tải ({(imageUrl ? 1 : 0) + galleryImages.length}{" "}
                  ảnh)
                </label>
                <div className="flex flex-wrap gap-4">
                  {/* Featured Main Cover Image */}
                  {imageUrl && (
                    <FormImagePreview
                      src={imageUrl}
                      alt="Ảnh Bìa Chính"
                      isFeatured={true}
                      className="h-28 w-28 object-cover rounded-xl"
                      onRemove={() => {
                        setIsDirty(true);
                        if (galleryImages.length > 0) {
                          const newFeat = galleryImages[0]!;
                          setImageUrl(newFeat);
                          setGalleryImages((prev) => prev.slice(1));
                        } else {
                          setImageUrl("");
                        }
                      }}
                    />
                  )}

                  {/* Gallery Images */}
                  {galleryImages.map((imgUrl, imgIdx) => (
                    <FormImagePreview
                      key={imgIdx}
                      src={imgUrl}
                      alt={`Ảnh ${imgIdx + 1}`}
                      isFeatured={false}
                      className="h-28 w-28 object-cover rounded-xl cursor-pointer"
                      onSetFeatured={() => {
                        setIsDirty(true);
                        setAsFeaturedImage(imgUrl);
                      }}
                      onRemove={() => {
                        setIsDirty(true);
                        removeGalleryImage(imgIdx);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Phân loại sản phẩm (Options) */}
          <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Phân Loại Sản Phẩm (Options)
                  </h2>
                  <p className="text-xs text-neutral-700 dark:text-neutral-400">
                    Tạo các tùy chọn như Kích cỡ (S, M, L) hoặc Màu sắc (Đỏ, Xanh)
                    để sinh ra biến thể.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDirty(true);
                  addOption();
                }}
                className="px-4 py-2 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-900/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Thêm phân loại
              </button>
            </div>

            <div className="space-y-4">
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex flex-col sm:flex-row gap-4 items-start bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700/60"
                >
                  <div className="w-full sm:w-1/3 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      Tên phân loại
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      value={opt.name}
                      onChange={(e) => {
                        setIsDirty(true);
                        updateOption(idx, "name", e.target.value);
                      }}
                      placeholder="VD: Kích thước, Màu sắc..."
                    />
                  </div>
                  <div className="w-full sm:flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      Các giá trị (Phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      value={opt.valuesStr}
                      onChange={(e) => {
                        setIsDirty(true);
                        updateOption(idx, "valuesStr", e.target.value);
                      }}
                      placeholder="VD: 3000, 4000, 5000"
                    />
                    <OptionPillTags valuesStr={opt.valuesStr} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDirty(true);
                      removeOption(idx);
                    }}
                    className="self-end sm:self-center mt-2 sm:mt-5 p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Xóa phân loại này"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {options.length === 0 && (
                <div className="p-6 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-400 text-xs space-y-2">
                  <p className="font-semibold">
                    Sản phẩm chưa có phân loại (Ví dụ: Size, Màu sắc).
                  </p>
                  <p className="text-neutral-400">
                    Nếu sản phẩm có nhiều biến thể, hãy nhấn nút{" "}
                    <strong>"+ Thêm phân loại"</strong> ở trên.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Giá bán & Biến thể */}
          <div id="sec-options-prices" className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                4
              </span>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Giá Bán & Các Biến Thể (Variants)
              </h2>
            </div>

            {variantList.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 whitespace-nowrap">Biến thể</th>
                      <th className="px-4 py-3.5 min-w-[130px]">Giá bán (VND) *</th>
                      <th className="px-4 py-3.5 min-w-[130px]">Giá gốc (VND)</th>
                      <th className="px-4 py-3.5 text-center min-w-[120px]">Trạng thái kho</th>
                      <th className="px-4 py-3.5 min-w-[200px]">
                        Ảnh riêng cho biến thể
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {variantList.map((v) => {
                      const vData = variantsData[v.title] || {};
                      const isVariantInStock = vData.availableForSale !== false;
                      return (
                        <tr
                          key={v.title}
                          className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="px-4 py-3.5 font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                            {v.title}
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              required
                              type="text"
                              inputMode="numeric"
                              className={`w-full p-2.5 rounded-lg border bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold focus:outline-none transition-colors ${
                                priceErrors[v.title]
                                  ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/20"
                                  : "border-neutral-200 dark:border-neutral-700 focus:border-orange-500"
                              }`}
                              value={formatNumberString(vData.price || "")}
                              onChange={(e) => {
                                setIsDirty(true);
                                handleVariantChange(
                                  v.title,
                                  "price",
                                  cleanPriceInput(e.target.value),
                                );
                                if (priceErrors[v.title]) {
                                  setPriceErrors(prev => ({ ...prev, [v.title]: "" }));
                                }
                              }}
                              onBlur={(e) => {
                                if (!e.target.value.trim() || e.target.value.trim() === "0") {
                                  setPriceErrors(prev => ({ ...prev, [v.title]: "Nhập giá bán" }));
                                }
                              }}
                              placeholder="Giá bán *"
                            />
                            {priceErrors[v.title] && (
                              <p className="text-red-500 text-[10px] mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">{priceErrors[v.title]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                              value={formatNumberString(vData.compareAtPrice || "")}
                              onChange={(e) => {
                                setIsDirty(true);
                                handleVariantChange(
                                  v.title,
                                  "compareAtPrice",
                                  cleanPriceInput(e.target.value),
                                );
                              }}
                              placeholder="Giá gốc"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setIsDirty(true);
                                handleVariantChange(
                                  v.title,
                                  "availableForSale",
                                  !isVariantInStock,
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer whitespace-nowrap ${
                                isVariantInStock
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 hover:bg-red-100"
                              }`}
                              title="Bấm để bật/tắt trạng thái Còn hàng / Hết hàng"
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isVariantInStock
                                    ? "bg-emerald-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              />
                              <span>{isVariantInStock ? "Còn hàng" : "Hết hàng"}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="space-y-2">
                              <DropZone
                                onFilesSelected={(files) => {
                                  setIsDirty(true);
                                  processUploadedFiles(files, v.title);
                                }}
                                disabled={isUploadingImage}
                                label="Tải ảnh biến thể"
                                sublabel=""
                              />
                              {vData.images && vData.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {vData.images.map(
                                    (imgUrl: string, imgIdx: number) => (
                                      <div key={imgIdx} className="relative group">
                                        <FormImagePreview
                                          src={imgUrl}
                                          alt={`Ảnh biến thể ${imgIdx + 1}`}
                                          className="h-12 w-12 object-cover rounded-lg"
                                          onRemove={() => {
                                            setIsDirty(true);
                                            removeVariantImage(v.title, imgIdx);
                                          }}
                                        />
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-4">
                  Sản phẩm chưa có phân loại. Vui lòng nhập giá bán cho sản phẩm mặc định:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Giá bán (VND) *
                    </label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className={`w-full mt-1.5 p-3 rounded-xl border bg-white dark:bg-neutral-900 text-sm font-bold text-orange-600 dark:text-orange-400 focus:outline-none transition-colors ${
                        priceErrors["default"]
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/20"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-orange-500"
                      }`}
                      value={formatNumberString(
                        variantsData["Default Title"]?.price || "",
                      )}
                      onChange={(e) => {
                        setIsDirty(true);
                        handleVariantChange(
                          "Default Title",
                          "price",
                          cleanPriceInput(e.target.value),
                        );
                        if (priceErrors["default"]) {
                          setPriceErrors(prev => ({ ...prev, "default": "" }));
                        }
                      }}
                      onBlur={(e) => {
                        if (!e.target.value.trim() || e.target.value.trim() === "0") {
                          setPriceErrors(prev => ({ ...prev, "default": "Vui lòng nhập giá bán hợp lệ" }));
                        }
                      }}
                      placeholder="0"
                    />
                    {priceErrors["default"] && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">{priceErrors["default"]}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Giá gốc niêm yết (VND)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full mt-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      value={formatNumberString(
                        variantsData["Default Title"]?.compareAtPrice || "",
                      )}
                      onChange={(e) => {
                        setIsDirty(true);
                        handleVariantChange(
                          "Default Title",
                          "compareAtPrice",
                          cleanPriceInput(e.target.value),
                        );
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

      {/* Card 5: Thẻ Tags Sản Phẩm */}
      <div id="sec-tags" className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
              5
            </span>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Thẻ Tags Từ Khóa (Product Tags)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Thêm từ khóa phân loại nổi bật (Ví dụ: bán chạy, hàng mới, giảm giá...)
              </p>
            </div>
          </div>
        </div>

        {/* Input & Add Tag */}
        <div className="space-y-4">
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Nhập thẻ tag mới và nhấn Enter..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setIsDirty(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => handleAddTag()}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              + Thêm Tag
            </button>
          </div>

          {/* Quick Tag Suggestions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Gợi ý từ khóa phổ biến:
            </span>
            <div className="flex flex-wrap gap-2">
              {["bán chạy", "mới về", "giảm giá", "hàng hot", "miễn phí vận chuyển", "chính hãng"].map(
                (suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    + {suggested}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Active Tags Display */}
          <div className="pt-2">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-2">
              Các thẻ Tag đã chọn ({tags.length}):
            </span>
            {tags.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Chưa có thẻ tag nào được gắn.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 text-xs font-bold shadow-2xs"
                  >
                    🏷️ {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-orange-200 dark:hover:bg-orange-800 p-0.5 rounded-full text-orange-600 dark:text-orange-300 transition-colors ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* End Left Column */}
      </div>

      {/* Right Column: Real-time Live Preview Card (xl:col-span-5) */}
      <div className="hidden xl:block xl:col-span-4 sticky top-24 space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 px-5 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
              XEM TRƯỚC GIAO DIỆN (/product/{handle || "handle"})
            </h3>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
            Realtime
          </span>
        </div>

        {/* Smartphone Frame Container */}
        <MobileStorefrontPreview
          title={title}
          imageUrl={imageUrl}
          galleryImages={galleryImages}
          previewMinPrice={previewMinPrice}
          previewComparePrice={previewComparePrice}
          previewDiscountPercent={previewDiscountPercent}
          availableForSale={availableForSale}
          selectedCollections={selectedCollections}
          availableCollections={availableCollections}
          options={options}
          tags={tags}
          description={description}
        />
      </div>
      {/* End Right Column */}
      </div>
      {/* End Grid */}

      {/* Mobile Screen Floating Toggle Button for Mobile Preview Modal */}
      <div className="xl:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setShowMobilePreviewDrawer(true)}
          className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all border border-neutral-700 dark:border-neutral-200 cursor-pointer"
        >
          <span>📱</span>
          <span>Xem trước Mobile</span>
        </button>
      </div>

      {/* Mobile Screen Preview Modal Drawer */}
      {showMobilePreviewDrawer && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Xem trước Mobile (/product/{handle || "handle"})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreviewDrawer(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <MobileStorefrontPreview
              title={title}
              imageUrl={imageUrl}
              galleryImages={galleryImages}
              previewMinPrice={previewMinPrice}
              previewComparePrice={previewComparePrice}
              previewDiscountPercent={previewDiscountPercent}
              availableForSale={availableForSale}
              selectedCollections={selectedCollections}
              availableCollections={availableCollections}
              options={options}
              tags={tags}
              description={description}
            />

            <button
              type="button"
              onClick={() => setShowMobilePreviewDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Đóng Xem Trước
            </button>
          </div>
        </div>
      )}

      {/* Floating / Sticky Action Bar */}
      <div className="flex justify-center mt-12 pointer-events-none">
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 p-3 px-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] rounded-2xl flex items-center justify-between gap-6 md:gap-12 w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-5 pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all cursor-pointer whitespace-nowrap"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span className="text-lg leading-none mt-[-2px]">✓</span>
            )}
            {initialData ? "Lưu Thay Đổi" : "Tạo Sản Phẩm Mới"}
          </button>
        </div>
      </div>
    </form>
  );
}
