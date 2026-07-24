import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProduct } from "../hooks/useProduct";

const CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "SEK",
  "NZD",
  "MXN",
  "SGD",
  "HKD",
  "NOK",
  "KRW",
  "TRY",
  "RUB",
  "BRL",
  "ZAR",
];

const currencySymbol = (c) =>
  ({ INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CAD: "C$" })[c] ?? c;

/* ─── Sidebar nav items ─── */
const NAV = ["Overview", "Products", "Orders", "Analytics", "Settings"];

/* ─── Empty variant form state ─── */
const emptyForm = () => ({
  price: { amount: "", currency: "INR" },
  stock: "",
  images: [],
  attributes: [{ key: "", value: "" }],
});

const SellerProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    handleGetProductById,
    handleCreateVariant,
    handleUpdateVariantStock,
    handleDeleteVariant,
  } = useProduct();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stockEdits, setStockEdits] = useState({}); // variantId -> draft stock value
  const [savingStock, setSavingStock] = useState({}); // variantId -> bool

  const fetchProduct = async () => {
    setLoading(true);
    const data = await handleGetProductById(productId);
    setProduct(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  /* ── Form helpers ── */
  const setFormField = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addAttribute = () =>
    setForm((f) => ({ ...f, attributes: [...f.attributes, { key: "", value: "" }] }));
  const removeAttribute = (i) =>
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));
  const setAttr = (i, field, val) =>
    setForm((f) => {
      const attrs = [...f.attributes];
      attrs[i] = { ...attrs[i], [field]: val };
      return { ...f, attributes: attrs };
    });

  /* ── Submit variant ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    const attrMap = {};
    form.attributes.forEach(({ key, value }) => {
      if (key.trim()) attrMap[key.trim()] = value.trim();
    });

    const formData = new FormData();
    formData.append("price[amount]", form.price.amount);
    formData.append("price[currency]", form.price.currency);
    formData.append("stock", Number(form.stock) || 0);

    // Add attributes as JSON string
    formData.append("attributes", JSON.stringify(attrMap));

    // Add image files
    form.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await handleCreateVariant(productId, formData);
      setForm(emptyForm());
      setShowForm(false);
      await fetchProduct();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  /* ── Stock edit ── */
  const saveStock = async (variantId) => {
    const val = stockEdits[variantId];
    if (val === undefined || val === "") return;
    setSavingStock((s) => ({ ...s, [variantId]: true }));
    try {
      await handleUpdateVariantStock(productId, variantId, Number(val));
      await fetchProduct();
      setStockEdits((s) => {
        const n = { ...s };
        delete n[variantId];
        return n;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStock((s) => ({ ...s, [variantId]: false }));
    }
  };

  /* ── Delete variant ── */
  const removeVariant = async (variantId) => {
    try {
      await handleDeleteVariant(productId, variantId);
      await fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Loading / error ── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#f5f1ea] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-[#c9b89a] border-t-[#1f1b17] animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-[#f5f1ea] flex flex-col items-center justify-center gap-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8a7a64]">Product not found</p>
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="text-xs uppercase tracking-[0.3em] underline underline-offset-4 text-[#8a7a64] hover:text-[#1f1b17]"
        >
          Back to Dashboard
        </button>
      </div>
    );

  const mainImage =
    product.images?.[0]?.url || "https://placehold.co/400x500/ede7db/a09080/webp?text=";

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1f1b17] font-['Manrope'] selection:bg-[#1f1b17] selection:text-[#f5f1ea]">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#d8c39a]/25 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#efe5d1] blur-3xl" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 z-10 hidden h-full w-72 border-r border-black/5 bg-[#f7f3ec]/90 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col justify-between p-8">
          <div>
            <div className="mb-14">
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Aveniq</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Seller Studio</h2>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => (
                <button
                  key={item}
                  onClick={() => item === "Products" && navigate("/seller/dashboard")}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm transition-colors ${
                    item === "Products"
                      ? "bg-[#1f1b17] text-[#f7f3ec]"
                      : "text-[#6d6357] hover:bg-black/5 hover:text-[#1f1b17]"
                  }`}
                >
                  <span>{item}</span>
                  {item === "Products" && <span className="h-2 w-2 rounded-full bg-[#d8c39a]" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Back link */}
          <div>
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8a7a64] hover:text-[#1f1b17] transition-colors group"
            >
              <span className="block w-4 h-px bg-current transition-all duration-300 group-hover:w-7" />
              All Products
            </button>
            <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(31,27,23,0.06)]">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Workspace</p>
              <p className="mt-3 text-sm leading-6 text-[#5d5448]">
                Manage variants, control stock, and keep listings sharp.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="relative md:ml-72">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          {/* ── Product header card ── */}
          <header className="mb-10 flex flex-col gap-8 rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:flex-row lg:items-start lg:p-10">
            {/* Image */}
            <div className="w-full flex-shrink-0 overflow-hidden rounded-2xl bg-[#ede7db] lg:w-52">
              <div className="aspect-[3/4] w-full">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between gap-6">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Product</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {product.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#6d6357]">
                  {product.description}
                </p>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-6">
                <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                    Base Price
                  </p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight">
                    {currencySymbol(product.price?.currency)}
                    {product.price?.amount?.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                    Variants
                  </p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight">
                    {product.variants?.length || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#f7f3ec] px-5 py-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                    Total Stock
                  </p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight">
                    {(product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* ── Variants section ── */}
          <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
            {/* Section header */}
            <div className="mb-8 flex flex-col gap-4 border-b border-black/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">
                  Inventory
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Product Variants</h2>
              </div>
              <button
                onClick={() => setShowForm((f) => !f)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-5 py-2.5 text-sm font-medium text-[#f7f3ec] transition-all hover:-translate-y-0.5 hover:bg-[#2b251f]"
              >
                <span className="text-base leading-none">{showForm ? "×" : "+"}</span>
                {showForm ? "Cancel" : "Add Variant"}
              </button>
            </div>

            {/* ── Create variant form ── */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-10 rounded-[1.75rem] border border-dashed border-[#c9b89a]/60 bg-[#fbf8f3] p-6 sm:p-8"
              >
                <p className="mb-6 text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">
                  New Variant
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Price amount */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                      Price Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.price.amount}
                      onChange={(e) => setFormField("price.amount", e.target.value)}
                      placeholder="0"
                      className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Currency */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                      Currency
                    </label>
                    <select
                      value={form.price.currency}
                      onChange={(e) => setFormField("price.currency", e.target.value)}
                      className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] focus:border-[#8a7a64] focus:outline-none transition-colors"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setFormField("stock", e.target.value)}
                      placeholder="0"
                      className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                      Variant Images{" "}
                      <span className="normal-case text-[#b5a898]">(up to 7 files)</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFormField("images", Array.from(e.target.files || []))}
                      className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#1f1b17] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1f1b17] file:text-[#f7f3ec] hover:file:bg-[#2b251f] transition-colors"
                    />
                    {form.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.images.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview-${idx}`}
                              className="h-16 w-16 object-cover rounded-lg border border-black/8"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormField(
                                  "images",
                                  form.images.filter((_, i) => i !== idx),
                                )
                              }
                              className="absolute -top-2 -right-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attributes */}
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]">
                      Attributes <span className="normal-case">(e.g. Color, Size)</span>
                    </p>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="text-[0.7rem] uppercase tracking-[0.25em] text-[#8a7a64] hover:text-[#1f1b17] transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {form.attributes.map((attr, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={attr.key}
                          onChange={(e) => setAttr(i, "key", e.target.value)}
                          placeholder="Key (e.g. Size)"
                          className="flex-1 rounded-xl border border-black/8 bg-white px-4 py-2.5 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
                        />
                        <input
                          type="text"
                          value={attr.value}
                          onChange={(e) => setAttr(i, "value", e.target.value)}
                          placeholder="Value (e.g. M)"
                          className="flex-1 rounded-xl border border-black/8 bg-white px-4 py-2.5 text-sm text-[#1f1b17] placeholder:text-[#b5a898] focus:border-[#8a7a64] focus:outline-none transition-colors"
                        />
                        {form.attributes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAttribute(i)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-black/8 bg-white text-[#b5a898] hover:border-red-200 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-all hover:-translate-y-0.5 hover:bg-[#2b251f] disabled:opacity-50 disabled:translate-y-0"
                  >
                    {creating ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border border-[#f7f3ec]/40 border-t-[#f7f3ec] animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create Variant"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── Variant list ── */}
            {product.variants && product.variants.length > 0 ? (
              <div className="flex flex-col gap-4">
                {product.variants.map((variant, idx) => {
                  const stockDraft = stockEdits[variant._id] ?? variant.stock ?? 0;
                  const isDirty = stockEdits[variant._id] !== undefined;
                  const variantImage = variant.images?.[0]?.url;
                  const attrs = variant.attributes ? Object.entries(variant.attributes) : [];

                  return (
                    <div
                      key={variant._id || idx}
                      className="flex flex-col gap-5 rounded-[1.75rem] border border-black/5 bg-[#fbf8f3] p-5 sm:flex-row sm:items-start sm:p-6"
                    >
                      {/* Variant image */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#ede7db]">
                        {variantImage ? (
                          <img
                            src={variantImage}
                            alt="variant"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#c9b89a] text-xs">
                            —
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col gap-4">
                        {/* Attributes */}
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
                          <p className="text-xs text-[#b5a898] italic">No attributes</p>
                        )}

                        {/* Price + stock row */}
                        <div className="flex flex-wrap items-end gap-6">
                          {/* Price */}
                          <div>
                            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#8a7a64]">
                              Price
                            </p>
                            <p className="mt-1 text-lg font-semibold tracking-tight">
                              {currencySymbol(variant.price?.currency)}
                              {variant.price?.amount?.toLocaleString()}
                            </p>
                          </div>

                          {/* Stock editor */}
                          <div>
                            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#8a7a64]">
                              Stock
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={stockDraft}
                                onChange={(e) =>
                                  setStockEdits((s) => ({ ...s, [variant._id]: e.target.value }))
                                }
                                className="w-24 rounded-lg border border-black/8 bg-white px-3 py-2 text-sm font-medium text-[#1f1b17] focus:border-[#8a7a64] focus:outline-none transition-colors"
                              />
                              {isDirty && (
                                <button
                                  onClick={() => saveStock(variant._id)}
                                  disabled={savingStock[variant._id]}
                                  className="rounded-lg bg-[#1f1b17] px-3 py-2 text-xs font-medium text-[#f7f3ec] transition-all hover:bg-[#2b251f] disabled:opacity-50"
                                >
                                  {savingStock[variant._id] ? "…" : "Save"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeVariant(variant._id)}
                        className="self-start rounded-full border border-black/8 bg-white p-2 text-[#b5a898] transition-colors hover:border-red-200 hover:text-red-400"
                        aria-label="Delete variant"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
                })}
              </div>
            ) : (
              !showForm && (
                <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#fbf8f3] px-6 py-16 text-center sm:px-10">
                  <p className="text-sm uppercase tracking-[0.3em] text-[#8a7a64]">
                    No variants yet
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    Add your first variant
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6d6357]">
                    Create variants to offer different sizes, colours or configurations — each with
                    its own price and stock.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] hover:-translate-y-0.5 transition-transform"
                  >
                    + Add Variant
                  </button>
                </div>
              )
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default SellerProductDetail;
