import { Shuffle } from 'lucide-react';

// icon-only: a compact marker for tight spaces (running totals, scorecard
// cells). Otherwise: a small labeled pill, for the score entry row.
export default function DealerBadge({ iconOnly = false }) {
  if (iconOnly) {
    return (
      <span
        title="Dealer"
        aria-label="Dealer"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-blue dark:border-ink-dark"
      >
        <Shuffle size={11} className="text-ink" />
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-blue px-2 py-1 text-[11px] font-extrabold text-ink dark:border-ink-dark">
      <Shuffle size={12} />
      Dealer
    </span>
  );
}
