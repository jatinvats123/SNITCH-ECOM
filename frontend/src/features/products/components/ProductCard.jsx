import { memo } from "react";
import { ikImage } from "../../../lib/image";

const PLACEHOLDER = "https://placehold.co/400x533/f7f7f5/cccccc/webp?text=";

// Memoized so the catalog grid doesn't re-render on unrelated parent updates
// (e.g. Home's live clock ticking every second). Rendered as a <button> so the
// whole card is keyboard-focusable and activatable.
function ProductCard({ product, onSelect }) {
  const src = product.images?.length > 0 ? ikImage(product.images[0].url, { w: 500 }) : PLACEHOLDER;

  return (
    <button
      type="button"
      onClick={() => onSelect(product._id)}
      className="group block w-full cursor-pointer text-left focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden bg-[#f7f7f5]">
        <img
          src={src}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
          <div className="bg-black py-3.5 text-center text-[10px] uppercase tracking-[0.35em] text-white">
            View Product
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-0.5">
        <h3 className="text-sm font-light leading-snug text-black/80 transition-colors duration-200 group-hover:text-black">
          {product.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-black/60">{product.description}</p>
        <p className="mt-2 text-sm font-light tracking-wide text-black">
          {product.price?.currency === "INR" ? "₹" : "$"}
          {product.price?.amount?.toLocaleString("en-IN")}
        </p>
      </div>
    </button>
  );
}

export default memo(ProductCard);
