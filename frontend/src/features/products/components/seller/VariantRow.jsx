import { currencySymbol } from "../../constants";
import { ikImage } from "../../../../lib/image";

function VariantRow({ variant, stockValue, isDirty, saving, onStockChange, onSave, onDelete }) {
  const variantImage = variant.images?.[0]?.url;
  const attrs = variant.attributes ? Object.entries(variant.attributes) : [];

  return (
    <div className="flex flex-col gap-5 rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-5 sm:flex-row sm:items-start sm:p-6">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#ede7db]">
        {variantImage ? (
          <img
            src={ikImage(variantImage, { w: 160 })}
            alt={`Variant — ${attrs.map(([k, v]) => `${k}: ${v}`).join(", ") || "no attributes"}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#c9b89a]">
            —
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {attrs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attrs.map(([k, v]) => (
              <span
                key={k}
                className="rounded-full border border-black/8 bg-white px-3 py-1 text-xs text-[#5d5448]"
              >
                <span className="text-[#8a7a64]">{k}:</span> {v}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-[#b5a898]">No attributes</p>
        )}

        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#8a7a64]">Price</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">
              {currencySymbol(variant.price?.currency)}
              {variant.price?.amount?.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#8a7a64]">Stock</p>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                aria-label="Variant stock"
                value={stockValue}
                onChange={(e) => onStockChange(e.target.value)}
                className="w-24 rounded-lg border border-black/8 bg-white px-3 py-2 text-sm font-medium text-[#1f1b17] focus:border-[#8a7a64] focus:outline-none transition-colors"
              />
              {isDirty && (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-[#1f1b17] px-3 py-2 text-xs font-medium text-[#f7f3ec] transition-all hover:bg-[#2b251f] disabled:opacity-50"
                >
                  {saving ? "…" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="self-start rounded-full border border-black/8 bg-white p-2 text-[#b5a898] transition-colors hover:border-red-200 hover:text-red-400"
        aria-label="Delete variant"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default VariantRow;
