import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const MAX_IMAGES = 7;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'USD',
  });
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const inputClassName =
    'w-full rounded-2xl border border-black/5 bg-white/80 px-5 py-4 text-sm text-[#1f1b17] placeholder:text-[#8a7a64]/60 shadow-[0_10px_30px_rgba(31,27,23,0.03)] transition-all duration-300 focus:border-[#d8c39a] focus:outline-none focus:ring-4 focus:ring-[#d8c39a]/20';

  const labelClassName = 'mb-3 block text-[0.7rem] uppercase tracking-[0.28em] text-[#8a7a64]';

  const panelClassName =
    'rounded-4xl border border-black/5 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,27,23,0.06)] backdrop-blur-xl sm:p-8';

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSlotClick = () => {
    if (images.length >= MAX_IMAGES) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const removeImage = useCallback((index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('priceAmount', formData.priceAmount);
      payload.append('priceCurrency', formData.priceCurrency);
      images.forEach(({ file }) => payload.append('images', file));

      const response = await handleCreateProduct(payload);
      setSuccess(response?.message || 'Product created successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Image slot renderer ─────────────────────────────────────────────────────
  const renderSlot = (index) => {
    if (images[index]) {
      return (
        <div className="relative w-full h-full group">
          <img
            src={images[index].preview}
            alt={`Product image ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1f1b17] opacity-0 backdrop-blur-md transition-opacity duration-200 hover:bg-[#1f1b17] hover:text-[#f7f3ec] group-hover:opacity-100"
            aria-label="Remove image"
          >
            ✕
          </button>
          {index === 0 && (
            <span className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-white/80 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[#1f1b17] backdrop-blur-md">
              Cover
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="text-3xl text-[#b5a38a] transition-colors duration-200 group-hover:text-[#1f1b17]">+</span>
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#8a7a64] transition-colors duration-200">
          {index === 0 ? 'Cover Image' : 'Add Photo'}
        </span>
      </div>
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1f1b17]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#d8c39a]/25 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#efe5d1] blur-3xl" />
      </div>

      <aside className="fixed left-0 top-0 z-10 hidden h-full w-72 border-r border-black/5 bg-[#f7f3ec]/90 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col justify-between p-8">
          <div>
            <div className="mb-14">
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Aveniq</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Create product</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex w-full items-center justify-between rounded-full bg-[#1f1b17] px-4 py-3 text-left text-sm text-[#f7f3ec] transition-colors hover:bg-[#2b251f]"
            >
              <span>Back to products</span>
              <span>↖</span>
            </button>

            <div className="mt-12 rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(31,27,23,0.06)]">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8a7a64]">Guidance</p>
              <p className="mt-3 text-sm leading-6 text-[#5d5448]">
                Keep the form calm, detailed, and easy to scan. Use a clear cover image and simple product copy.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded-3xl border border-[#d6a7a0]/50 bg-[#fff7f5] px-4 py-3 text-sm text-[#8d3b33] shadow-[0_10px_30px_rgba(31,27,23,0.04)]">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-3xl border border-[#b9d7c0]/60 bg-[#f4fbf6] px-4 py-3 text-sm text-[#2f5b3d] shadow-[0_10px_30px_rgba(31,27,23,0.04)]">
                {success}
              </div>
            )}

            <button
              type="submit"
              form="create-product-form"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-transform hover:-translate-y-0.5 hover:bg-[#2b251f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing…' : 'Publish Product'}
            </button>
          </div>
        </div>
      </aside>

      <main className="relative md:ml-72">
        <header className="flex items-center justify-between border-b border-black/5 bg-[#f7f3ec]/90 px-5 py-5 backdrop-blur-xl md:hidden">
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-[#6d6357]">
            Back
          </button>
          <span className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Aveniq</span>
          <div className="w-10" />
        </header>

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <section className={`${panelClassName} mb-8 lg:mb-10`}>
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Seller dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1b17] sm:text-5xl lg:text-6xl">
              Create a product with more breathing room.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6d6357] sm:text-lg">
              Keep the listing process clean and calm. Add the essentials, choose a cover image, and publish when it feels ready.
            </p>
          </section>

          <form id="create-product-form" onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <section className={panelClassName}>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/5 pb-5">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Identity</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17]">Product details</h2>
                </div>
                <span className="hidden text-sm text-[#6d6357] sm:block">Describe the product clearly</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className={labelClassName}>Product Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Midnight Silk Jacket"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClassName}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the silhouette, material, and story behind this piece…"
                    rows={6}
                    className={`${inputClassName} min-h-40 resize-none leading-relaxed`}
                  />
                </div>
              </div>
            </section>

            <section className={panelClassName}>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/5 pb-5">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Pricing</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17]">Set the value</h2>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="priceAmount" className={labelClassName}>Price Amount</label>
                  <input
                    type="number"
                    id="priceAmount"
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className={`${inputClassName} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                </div>

                <div>
                  <label htmlFor="priceCurrency" className={labelClassName}>Currency</label>
                  <div className="relative">
                    <select
                      id="priceCurrency"
                      name="priceCurrency"
                      value={formData.priceCurrency}
                      onChange={handleChange}
                      className={`${inputClassName} appearance-none pr-12 cursor-pointer`}
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="INR">INR — Indian Rupee</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8a7a64]">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className={panelClassName}>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/5 pb-5">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#8a7a64]">Images</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f1b17]">Upload photos</h2>
                </div>
                <p className="hidden text-sm text-[#6d6357] sm:block">First image becomes the cover</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                  const hasImage = !!images[index];
                  const isEmpty = !hasImage;
                  const isDisabledSlot = isEmpty && images.length >= MAX_IMAGES;
                  const slotClasses = [
                    'relative overflow-hidden rounded-3xl transition-all duration-200 group aspect-4/5',
                    index === 0 ? 'md:row-span-2 md:aspect-auto md:min-h-[28rem]' : 'min-h-52',
                    isEmpty
                      ? 'border border-dashed border-black/10 bg-[#fbf8f3] hover:border-black/20 hover:bg-white cursor-pointer'
                      : 'bg-[#efe8de] cursor-default',
                    isDisabledSlot ? 'opacity-25 cursor-not-allowed' : '',
                  ].join(' ');

                  if (isEmpty) {
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={!isDisabledSlot ? handleImageSlotClick : undefined}
                        disabled={isDisabledSlot}
                        className={slotClasses}
                        aria-label={index === 0 ? 'Upload cover image' : 'Add photo'}
                      >
                        {renderSlot(index)}
                      </button>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={slotClasses}
                      aria-label={`Product image ${index + 1}`}
                    >
                      {renderSlot(index)}
                    </div>
                  );
                })}
              </div>

              {images.length > 0 && (
                <p className="mt-4 text-[0.7rem] uppercase tracking-[0.25em] text-[#8a7a64]">
                  {images.length} / {MAX_IMAGES} images added
                </p>
              )}
            </section>

            <div className="lg:hidden pb-12">
              {error && (
                <div className="mb-4 rounded-3xl border border-[#d6a7a0]/50 bg-[#fff7f5] px-4 py-3 text-sm text-[#8d3b33] shadow-[0_10px_30px_rgba(31,27,23,0.04)]">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-3xl border border-[#b9d7c0]/60 bg-[#f4fbf6] px-4 py-3 text-sm text-[#2f5b3d] shadow-[0_10px_30px_rgba(31,27,23,0.04)]">
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-medium text-[#f7f3ec] transition-transform hover:-translate-y-0.5 hover:bg-[#2b251f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing…' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
