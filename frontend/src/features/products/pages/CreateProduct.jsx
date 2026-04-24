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
            className="absolute top-2 right-2 w-6 h-6 bg-[#131313]/80 backdrop-blur-sm text-[#e5e2e1] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#FFD700] hover:text-[#3a3000] text-xs leading-none"
            aria-label="Remove image"
          >
            ✕
          </button>
          {index === 0 && (
            <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#FFD700] bg-[#131313]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
              Cover
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full">
        <span className="text-2xl text-[#4D4732] group-hover:text-[#FFD700] transition-colors duration-200">+</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#4D4732] group-hover:text-[#D0C6AB] transition-colors duration-200">
          {index === 0 ? 'Cover Image' : 'Add Photo'}
        </span>
      </div>
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#131313] text-[#e5e2e1]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800&display=swap');`}</style>

      {/* ── LEFT SIDEBAR (desktop) ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[35%] min-h-screen bg-[#131313] px-10 py-10 sticky top-0 h-screen">
        {/* Brand */}
        <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFD700]">
          Aveniq
        </span>

        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D0C6AB]/50 hover:text-[#D0C6AB] transition-colors duration-200 w-fit"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Products
        </button>

        {/* Display heading */}
        <div className="mt-14 flex-1">
          <h1 className="text-5xl xl:text-6xl font-light tracking-[-0.02em] leading-[1.05] text-[#e5e2e1]">
            Create<br />
            <span className="text-[#FFD700]">Product</span>
          </h1>
          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#D0C6AB]/50">
            Add a new item to your collection
          </p>
        </div>

        {/* Error (sidebar) */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-[4px] text-[#ffb4ab] text-[10px] font-bold uppercase tracking-[0.1em]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 bg-[#0f5132]/20 border border-[#75dba5]/20 rounded-[4px] text-[#75dba5] text-[10px] font-bold uppercase tracking-[0.1em]">
            {success}
          </div>
        )}

        {/* Publish CTA */}
        <button
          type="submit"
          form="create-product-form"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-br from-[#E9C400] to-[#FFD700] text-[#3a3000] font-bold uppercase tracking-[0.15em] text-[10px] py-4 rounded-[4px] hover:from-[#FFD700] hover:to-[#FFE16D] transition-all duration-300 shadow-[0_4px_32px_-8px_rgba(255,215,0,0.25)] hover:shadow-[0_4px_48px_-4px_rgba(255,215,0,0.35)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Publishing…' : 'Publish Product'}
        </button>
      </aside>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <main className="flex-1 bg-[#1C1B1B] min-h-screen overflow-y-auto">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-6 bg-[#131313]">
          <button type="button" onClick={() => navigate(-1)} className="text-[#D0C6AB]/50 hover:text-[#D0C6AB] transition-colors">
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFD700]">Aveniq</span>
          <div className="w-5" />
        </header>

        {/* Mobile heading */}
        <div className="lg:hidden px-6 pt-2 pb-8 bg-[#131313]">
          <h1 className="text-4xl font-light tracking-[-0.02em] text-[#e5e2e1]">
            Create <span className="text-[#FFD700]">Product</span>
          </h1>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#D0C6AB]/50">
            Add a new item to your collection
          </p>
        </div>

        {/* Form */}
        <form
          id="create-product-form"
          onSubmit={handleSubmit}
          className="px-8 md:px-14 lg:px-16 py-14 lg:py-16 space-y-16"
        >
          {/* ── Section 1: Identity ─────────────────────────────────────────── */}
          <section className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#D0C6AB]/60 mb-3">
                Product Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Midnight Silk Jacket"
                required
                className="w-full bg-[#0E0E0E] border border-[#4D4732]/30 rounded-[4px] px-5 py-4 text-[#e5e2e1] text-sm placeholder-[#D0C6AB]/25 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/20 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#D0C6AB]/60 mb-3">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the silhouette, material, and story behind this piece…"
                rows={5}
                className="w-full bg-[#0E0E0E] border border-[#4D4732]/30 rounded-[4px] px-5 py-4 text-[#e5e2e1] text-sm placeholder-[#D0C6AB]/25 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/20 focus:outline-none transition-all duration-300 resize-none leading-relaxed"
              />
            </div>
          </section>

          {/* ── Section 2: Pricing ──────────────────────────────────────────── */}
          <section className="space-y-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D0C6AB]/40">Pricing</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price Amount */}
              <div>
                <label htmlFor="priceAmount" className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#D0C6AB]/60 mb-3">
                  Price Amount
                </label>
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
                  className="w-full bg-[#0E0E0E] border border-[#4D4732]/30 rounded-[4px] px-5 py-4 text-[#e5e2e1] text-sm placeholder-[#D0C6AB]/25 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/20 focus:outline-none transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="priceCurrency" className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#D0C6AB]/60 mb-3">
                  Currency
                </label>
                <div className="relative">
                  <select
                    id="priceCurrency"
                    name="priceCurrency"
                    value={formData.priceCurrency}
                    onChange={handleChange}
                    className="w-full bg-[#0E0E0E] border border-[#4D4732]/30 rounded-[4px] px-5 py-4 text-[#e5e2e1] text-sm focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/20 focus:outline-none transition-all duration-300 appearance-none pr-10 cursor-pointer"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D0C6AB]/40">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 3: Images ───────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D0C6AB]/40">Product Images</p>
              <p className="mt-1.5 text-xs text-[#D0C6AB]/35">
                Upload up to {MAX_IMAGES} images — first image is the cover
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* 3-column grid — first slot spans 2 rows */}
            <div className="grid grid-cols-3 grid-rows-3 gap-3" style={{ gridAutoRows: '120px' }}>
              {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                const hasImage = !!images[index];
                const isEmpty = !hasImage;
                const isDisabledSlot = isEmpty && images.length >= MAX_IMAGES;
                const slotClasses = [
                  'relative overflow-hidden rounded-[4px] transition-all duration-200 group',
                  index === 0 ? 'row-span-2' : '',
                  isEmpty
                    ? 'border border-dashed border-[#4D4732]/40 bg-[#0E0E0E] hover:border-[#FFD700]/40 hover:bg-[#0E0E0E] cursor-pointer'
                    : 'bg-[#0E0E0E] cursor-default',
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
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#D0C6AB]/35">
                {images.length} / {MAX_IMAGES} images added
              </p>
            )}
          </section>

          {/* ── Mobile publish button ───────────────────────────────────────── */}
          <div className="lg:hidden pt-2 pb-10">
            {error && (
              <div className="mb-4 px-4 py-3 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-[4px] text-[#ffb4ab] text-[10px] font-bold uppercase tracking-[0.1em]">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 bg-[#0f5132]/20 border border-[#75dba5]/20 rounded-[4px] text-[#75dba5] text-[10px] font-bold uppercase tracking-[0.1em]">
                {success}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-[#E9C400] to-[#FFD700] text-[#3a3000] font-bold uppercase tracking-[0.15em] text-[10px] py-4 rounded-[4px] hover:from-[#FFD700] hover:to-[#FFE16D] transition-all duration-300 shadow-[0_4px_32px_-8px_rgba(255,215,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing…' : 'Publish Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProduct;
