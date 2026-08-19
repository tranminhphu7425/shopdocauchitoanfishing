import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { AddToCart } from "components/cart/add-to-cart";
import Prose from "components/prose";
import { Product } from "lib/local/types";
import { useIsAdmin } from "lib/use-admin";
import { ProductPrice } from "./product-price";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  product,
  selectedOptions,
  onOptionChange,
}: {
  product: Product;
  selectedOptions: Record<string, string>;
  onOptionChange: (name: string, value: string) => void;
}) {
  const isAdmin = useIsAdmin();

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        {isAdmin && (
          <div className="mb-3">
            <Link
              to={`/admin/products/${product.handle}/edit`}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-md font-semibold text-orange-700 transition-colors hover:bg-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-900/80"
              title="Chuyển tới trang chỉnh sửa thông tin sản phẩm"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span>Chỉnh sửa sản phẩm này</span>
            </Link>
          </div>
        )}
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <ProductPrice product={product} selectedOptions={selectedOptions} />
      </div>
      <VariantSelector
        options={product.options}
        variants={product.variants}
        selectedOptions={selectedOptions}
        onOptionChange={onOptionChange}
      />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-relaxed dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : product.description ? (
        <div className="mb-6 text-sm leading-relaxed whitespace-pre-wrap break-words text-neutral-700 dark:text-neutral-300">
          {product.description}
        </div>
      ) : null}
      <AddToCart product={product} selectedOptions={selectedOptions} />
    </>
  );
}
