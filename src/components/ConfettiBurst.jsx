import { SUITS } from '../lib/suits.js';

// Deterministic spread so the burst looks the same every render.
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: 50 + ((i * 37) % 60) - 30,
  drift: ((i * 53) % 160) - 80,
  spin: ((i * 71) % 540) - 270,
  delay: (i % 9) * 45,
  duration: 1100 + (i % 6) * 140,
  size: 12 + (i % 4) * 4,
  suit: SUITS[i % SUITS.length],
}));

// The deck's own five suits rain down in their printed colors when a game
// ends. Pure CSS keyframes (.animate-confetti), no library.
export default function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-72 overflow-hidden" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti absolute top-0 leading-none"
          style={{
            left: `${piece.left}%`,
            color: `var(--color-${piece.suit.key})`,
            fontSize: `${piece.size}px`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            '--drift': `${piece.drift}px`,
            '--spin': `${piece.spin}deg`,
          }}
        >
          {piece.suit.symbol}
        </span>
      ))}
    </div>
  );
}
