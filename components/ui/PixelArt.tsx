export default function PixelArt({ seed, label }: { seed: number; label: string }) {
  const pal = ['#FFE135', '#FFB3D1', '#FBF8EE', '#111'];
  let s = seed * 7 + 1;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cells = [];
  for (let y = 0; y < 15; y++) for (let x = 0; x < 30; x++) cells.push(<rect key={x + '-' + y} x={x} y={y} width={1} height={1} fill={pal[Math.floor(r() * r() * 6.4) % 4]} />);
  return (
    <svg role="img" aria-label={label} viewBox="0 0 30 15" shapeRendering="crispEdges" className="pxl">
      {cells}<rect x="6" y="3" width="18" height="9" fill="#111" /><rect x="6.6" y="3.6" width="16.8" height="7.8" fill={pal[seed % 2]} />
    </svg>
  );
}
