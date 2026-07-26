// Append ImageKit transformation params to ik.imagekit.io URLs so we serve
// appropriately-sized, auto-format (WebP/AVIF) images instead of the full original.
// Non-ImageKit URLs (e.g. placeholders) pass through unchanged.
export function ikImage(url, { w, q = 70 } = {}) {
  if (!url || !url.includes("ik.imagekit.io")) return url;
  const tr = [w ? `w-${w}` : null, `q-${q}`, "f-auto"].filter(Boolean).join(",");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=${tr}`;
}
