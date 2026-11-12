/** "Visit website" button for the real website URL added in /login/admin. */
export default function VisitButton({ url, style }: { url: string; style?: React.CSSProperties }) {
  return <a className="btn y" href={url} target="_blank" rel="noopener noreferrer" style={style}>Visit website ↗</a>;
}
