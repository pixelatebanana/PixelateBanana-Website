export default function Marquee() {
  const t = 'WEB ✦ APPS ✦ AI AUTOMATION ✦ BRAND ✦ '.repeat(8);
  return <div className="marquee" aria-hidden="true"><div>{t}</div></div>;
}
