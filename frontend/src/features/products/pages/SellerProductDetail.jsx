import { useParams, useNavigate } from "react-router";
import { useSellerProductDetail } from "../hooks/useSellerProductDetail";
import SellerSidebar from "../components/seller/SellerSidebar";
import ProductSummaryHeader from "../components/seller/ProductSummaryHeader";
import VariantForm from "../components/seller/VariantForm";
import VariantRow from "../components/seller/VariantRow";

const SellerProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    product,
    loading,
    form,
    creating,
    showForm,
    stockEdits,
    savingStock,
    setShowForm,
    setStockEdits,
    setFormField,
    addAttribute,
    removeAttribute,
    setAttr,
    handleSubmit,
    saveStock,
    removeVariant,
  } = useSellerProductDetail(productId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea]" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border border-[#c9b89a] border-t-[#1f1b17]" />
        <span className="sr-only">Loading product…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f5f1ea]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8a7a64]">Product not found</p>
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="text-xs uppercase tracking-[0.3em] text-[#8a7a64] underline underline-offset-4 hover:text-[#1f1b17]"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const variants = product.variants || [];

  return (
    <div className="min-h-screen bg-[#f5f1ea] font-['Manrope'] text-[#1f1b17] selection:bg-[#1f1b17] selection:text-[#f5f1ea]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#d8c39a]/25 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#efe5d1] blur-3xl" />
      </div>

      <SellerSidebar />

      <main className="relative md:ml-72">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <ProductSummaryHeader product={product} />

          <section className="rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-black/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">
                  Inventory
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Product Variants</h2>
              </div>
              <button
                onClick={() => setShowForm((f) => !f)}
                aria-expanded={showForm}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-5 py-2.5 text-sm font-medium text-[#f7f3ec] transition-all hover:-translate-y-0.5 hover:bg-[#2b251f]"
              >
                <span className="text-base leading-none">{showForm ? "×" : "+"}</span>
                {showForm ? "Cancel" : "Add Variant"}
              </button>
            </div>

            {showForm && (
              <VariantForm
                form={form}
                setFormField={setFormField}
                addAttribute={addAttribute}
                removeAttribute={removeAttribute}
                setAttr={setAttr}
                onSubmit={handleSubmit}
                creating={creating}
              />
            )}

            {variants.length > 0 ? (
              <div className="flex flex-col gap-4">
                {variants.map((variant, idx) => (
                  <VariantRow
                    key={variant._id || idx}
                    variant={variant}
                    stockValue={stockEdits[variant._id] ?? variant.stock ?? 0}
                    isDirty={stockEdits[variant._id] !== undefined}
                    saving={!!savingStock[variant._id]}
                    onStockChange={(v) => setStockEdits((s) => ({ ...s, [variant._id]: v }))}
                    onSave={() => saveStock(variant._id)}
                    onDelete={() => removeVariant(variant._id)}
                  />
                ))}
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
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-transform hover:-translate-y-0.5"
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
