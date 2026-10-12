import { NavLink } from 'react-router-dom';
import { formatDate } from '../lib/gameSummary.js';
import { SUITS } from '../lib/suits.js';

// An all-time record printed on a pearl playing card: the number is the
// card's rank, the suit pip sits in the corners. Links to the game it
// happened in when there is one.
export default function RecordCard({ label, value, unit, who, note, gameId, createdAt, suit = 'star', index = 0 }) {
  const pip = SUITS.find((s) => s.key === suit) ?? SUITS[4];
  const color = `var(--color-${pip.key})`;
  const body = (
    <>
      <span className="absolute left-2.5 top-2 text-sm leading-none" style={{ color }} aria-hidden="true">{pip.symbol}</span>
      <span className="absolute bottom-2 right-2.5 rotate-180 text-sm leading-none" style={{ color }} aria-hidden="true">{pip.symbol}</span>
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="mt-1 font-display text-5xl font-bold leading-none" style={{ color }}>
        {value}
      </span>
      {unit && <span className="mt-1 text-xs font-semibold text-muted">{unit}</span>}
      <span className="mt-3 text-base font-bold text-ink">{who}</span>
      <span className="text-xs text-muted">{[note, formatDate(createdAt)].filter(Boolean).join(', ')}</span>
    </>
  );
  const className =
    'record-card press relative flex flex-col items-center rounded-2xl bg-pearl px-3 pb-4 pt-5 text-center animate-record-in';
  const style = { animationDelay: `${index * 60}ms` };

  return gameId ? (
    <NavLink to={`/history/${gameId}`} viewTransition className={className} style={style}>
      {body}
    </NavLink>
  ) : (
    <div className={className} style={style}>
      {body}
    </div>
  );
}
