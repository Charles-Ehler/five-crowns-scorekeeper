// Simple inline SVG illustration (a stack of blank scorecards) — no image
// assets, just a handful of paths, used for empty History/Stats states.
function CardsIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="18" y="18" width="56" height="72" rx="6" transform="rotate(-8 18 18)" className="fill-red-ink/10 dark:fill-red-ink/20" />
      <rect x="34" y="10" width="56" height="72" rx="6" transform="rotate(6 34 10)" className="fill-ink/10 dark:fill-chalk/10" />
      <rect x="30" y="14" width="56" height="72" rx="6" className="fill-paper-raised stroke-paper-line dark:fill-chalk-board-raised dark:stroke-chalk-board-line" strokeWidth="2" />
      <line x1="38" y1="34" x2="78" y2="34" className="stroke-paper-line dark:stroke-chalk-board-line" strokeWidth="2" />
      <line x1="38" y1="48" x2="78" y2="48" className="stroke-paper-line dark:stroke-chalk-board-line" strokeWidth="2" />
      <line x1="38" y1="62" x2="78" y2="62" className="stroke-paper-line dark:stroke-chalk-board-line" strokeWidth="2" />
    </svg>
  );
}

export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <CardsIllustration />
      <p className="font-semibold text-ink-soft dark:text-chalk-soft">{title}</p>
      {message && <p className="max-w-xs text-sm text-ink-faint dark:text-chalk-faint">{message}</p>}
    </div>
  );
}
