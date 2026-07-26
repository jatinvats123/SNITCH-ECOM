// Placeholder card shown while the catalog loads — keeps layout stable (no CLS).
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-6 aspect-[3/4] w-full bg-black/5" />
      <div className="mb-2 h-3 w-3/4 bg-black/5" />
      <div className="mb-2 h-3 w-1/2 bg-black/5" />
      <div className="mt-2 h-3 w-1/4 bg-black/10" />
    </div>
  );
}

export default ProductCardSkeleton;
