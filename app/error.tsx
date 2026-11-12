'use client';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="wrap page-pad"><h1 className="big">Oops 🍌</h1><p>Something slipped on a peel. Please try again.</p><button className="btn" onClick={reset}>Try again</button></div>;
}
