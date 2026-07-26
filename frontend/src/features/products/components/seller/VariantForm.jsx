import { CURRENCIES } from "../../constants";

const inputClass =
  "rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors";

function VariantForm({
  form,
  setFormField,
  addAttribute,
  removeAttribute,
  setAttr,
  onSubmit,
  creating,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-10 rounded-[1.75rem] border border-dashed border-[#c9b89a]/60 bg-[#fbf8f3] p-6 sm:p-8"
    >
      <p className="mb-6 text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">New Variant</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="variant-price"
            className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]"
          >
            Price Amount
          </label>
          <input
            id="variant-price"
            type="number"
            min="0"
            required
            value={form.price.amount}
            onChange={(e) => setFormField("price.amount", e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="variant-currency"
            className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]"
          >
            Currency
          </label>
          <select
            id="variant-currency"
            value={form.price.currency}
            onChange={(e) => setFormField("price.currency", e.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="variant-stock"
            className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]"
          >
            Initial Stock
          </label>
          <input
            id="variant-stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setFormField("stock", e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label
            htmlFor="variant-images"
            className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]"
          >
            Variant Images <span className="normal-case text-[#b5a898]">(up to 7 files)</span>
          </label>
          <input
            id="variant-images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFormField("images", Array.from(e.target.files || []))}
            className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-[#1f1b17] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#f7f3ec] hover:file:bg-[#2b251f]"
          />
          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.images.map((file, idx) => (
                <div key={idx} className="group relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected variant image ${idx + 1}`}
                    className="h-16 w-16 rounded-lg border border-black/8 object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove image ${idx + 1}`}
                    onClick={() =>
                      setFormField(
                        "images",
                        form.images.filter((_, i) => i !== idx),
                      )
                    }
                    className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white group-hover:flex"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
            Attributes <span className="normal-case">(e.g. Color, Size)</span>
          </p>
          <button
            type="button"
            onClick={addAttribute}
            className="text-[0.7rem] uppercase tracking-[0.25em] text-[#8a7a64] transition-colors hover:text-[#1f1b17]"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {form.attributes.map((attr, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                aria-label={`Attribute ${i + 1} name`}
                value={attr.key}
                onChange={(e) => setAttr(i, "key", e.target.value)}
                placeholder="Key (e.g. Size)"
                className="flex-1 rounded-xl border border-black/8 bg-white px-4 py-2.5 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
              />
              <input
                type="text"
                aria-label={`Attribute ${i + 1} value`}
                value={attr.value}
                onChange={(e) => setAttr(i, "value", e.target.value)}
                placeholder="Value (e.g. M)"
                className="flex-1 rounded-xl border border-black/8 bg-white px-4 py-2.5 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
              />
              {form.attributes.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove attribute ${i + 1}`}
                  onClick={() => removeAttribute(i)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-black/8 bg-white text-[#b5a898] transition-colors hover:border-red-200 hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-all hover:-translate-y-0.5 hover:bg-[#2b251f] disabled:translate-y-0 disabled:opacity-50"
        >
          {creating ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-[#f7f3ec]/40 border-t-[#f7f3ec]" />
              Creating…
            </>
          ) : (
            "Create Variant"
          )}
        </button>
      </div>
    </form>
  );
}

export default VariantForm;
