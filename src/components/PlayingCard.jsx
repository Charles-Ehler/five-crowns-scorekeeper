import { useRef } from 'react';
import { suitForIndex } from '../lib/suits.js';

const RANK_INDEX = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const MAX_TILT = 14;

// The round's wild card drawn as a real Five Crowns card: pearl stock, corner
// indices, a big center pip in the suit's printed color. It tilts toward your
// finger with a foil glint that follows, and the caller remounts it with
// key={round} so it flips over when the wild rank climbs.
export default function PlayingCard({ round, size = 'md' }) {
  const ref = useRef(null);
  const suit = suitForIndex(round - 1);
  const rank = RANK_INDEX[round - 1];
  const color = `var(--color-${suit.key})`;
  const dims = size === 'lg' ? 'h-[14rem] w-40 text-[1.4rem]' : 'h-[6.65rem] w-[4.75rem] text-[0.8rem]';

  function handleMove(e) {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  return (
    <div className="animate-card-flip shrink-0" style={{ perspective: '700px' }}>
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerUp={handleLeave}
        className={`playing-card relative flex select-none items-center justify-center rounded-[0.6em] bg-pearl ${dims}`}
        role="img"
        aria-label={`${rank} of ${suit.key}s`}
      >
        <span className="absolute left-[0.45em] top-[0.35em] flex flex-col items-center leading-none" style={{ color }}>
          <span className="font-display text-[1.6em] font-bold">{rank}</span>
          <span className="text-[1.05em]">{suit.symbol}</span>
        </span>
        <span className="text-[3.6em] leading-none" style={{ color }} aria-hidden="true">
          {suit.symbol}
        </span>
        <span className="absolute bottom-[0.35em] right-[0.45em] flex rotate-180 flex-col items-center leading-none" style={{ color }}>
          <span className="font-display text-[1.6em] font-bold">{rank}</span>
          <span className="text-[1.05em]">{suit.symbol}</span>
        </span>
        <span className="playing-card-glint pointer-events-none absolute inset-0 rounded-[0.6em]" aria-hidden="true" />
      </div>
    </div>
  );
}
