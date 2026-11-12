/* eslint-disable @next/next/no-img-element */
/** An image uploaded through /login/admin. `crop` keeps card thumbnails the same 2:1 shape as the pixel art. */
export default function UploadedImage({ src, label, crop = false }: { src: string; label: string; crop?: boolean }) {
  return <img src={src} alt={label} loading="lazy" className="pxl" style={crop ? { aspectRatio: '2 / 1', objectFit: 'cover' } : undefined} />;
}
