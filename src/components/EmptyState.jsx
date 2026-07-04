// Simple inline SVG illustration (a stack of blocky cards) — no image
// assets, just a handful of paths, used for empty History/Stats states.
function CardsIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="18" y="18" width="56" height="72" rx="6" transform="rotate(-8 18 18)" className="fill-red stroke-ink dark:stroke-ink-dark" strokeWidth="2" />
      <rect x="34" y="10" width="56" height="72" rx="6" transform="rotate(6 34 10)" className="fill-blue stroke-ink dark:stroke-ink-dark" strokeWidth="2" />
      <rect x="30" y="14" width="56" height="72" rx="6" className="fill-yellow stroke-ink dark:stroke-ink-dark" strokeWidth="3" />
      <line x1="38" y1="34" x2="78" y2="34" className="stroke-ink dark:stroke-ink-dark" strokeWidth="2" />
      <line x1="38" y1="48" x2="78" y2="48" className="stroke-ink dark:stroke-ink-dark" strokeWidth="2" />
      <line x1="38" y1="62" x2="78" y2="62" className="stroke-ink dark:stroke-ink-dark" strokeWidth="2" />
    </svg>
  );
}

export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <CardsIllustration />
      <p className="font-display text-lg text-ink dark:text-ink-dark">{title}</p>
      {message && <p className="max-w-xs text-sm text-muted dark:text-muted-dark">{message}</p>}
    </div>
  );
}
