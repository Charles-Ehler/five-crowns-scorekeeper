// Simple inline SVG illustration (a fanned hand of cards) — no image
// assets, just a handful of paths, used for empty History/Stats states.
function CardsIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="18" y="18" width="56" height="72" rx="6" transform="rotate(-10 18 18)" className="fill-heart/25 stroke-heart/40" strokeWidth="1.5" />
      <rect x="34" y="10" width="56" height="72" rx="6" transform="rotate(8 34 10)" className="fill-spade/25 stroke-spade/40" strokeWidth="1.5" />
      <rect x="30" y="14" width="56" height="72" rx="6" className="fill-parchment-panel stroke-gold dark:fill-ink-panel" strokeWidth="2" />
      <text x="58" y="58" textAnchor="middle" fontSize="28" className="fill-gold" fontFamily="Cinzel, serif">
        ?
      </text>
    </svg>
  );
}

export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <CardsIllustration />
      <p className="font-display text-lg text-ink dark:text-cream">{title}</p>
      {message && <p className="max-w-xs text-sm text-muted dark:text-muted-dark">{message}</p>}
    </div>
  );
}
