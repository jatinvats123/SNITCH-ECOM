import { currencySymbol } from "../../constants";
import { ikImage } from "../../../../lib/image";

const PLACEHOLDER = "https://placehold.co/400x500/ede7db/a09080/webp?text=";

function ProductSummaryHeader({ product }) {
  const mainImage = product.images?.[0]?.url
    ? ikImage(product.images[0].url, { w: 400 })
    : PLACEHOLDER;
  const totalStock = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <header className="mb-10 flex flex-col gap-8 rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:flex-row lg:items-start lg:p-10">
      <div className="w-full flex-shrink-0 overflow-hidden rounded-2xl bg-[#ede7db] lg:w-52">
        <div className="aspect-[3/4] w-full">
          <img
            src={mainImage}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Product</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6d6357]">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">Base Price</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight">
              {currencySymbol(product.price?.currency)}
              {product.price?.amount?.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">Variants</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight">
              {product.variants?.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">Total Stock</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight">{totalStock}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ProductSummaryHeader;
