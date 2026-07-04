import { usePlayerPhoto } from '../contexts/PlayerPhotosContext.jsx';
import { suitForName } from '../lib/suits.js';

// Photo if the player has uploaded one, otherwise a hash-based initials
// circle — sizeClass is the caller's exact Tailwind size (h-9 w-9 text-sm,
// etc.) so this is a drop-in swap wherever an avatar renders. The small suit
// pip in the corner is the player's fixed identity mark (deck suit, not an
// arbitrary color), visible even on an uploaded photo.
export default function Avatar({ name, sizeClass, className = '' }) {
  const photoUrl = usePlayerPhoto(name);
  const suit = suitForName(name);
  const trimmed = name.trim();

  return (
    <span className={`relative inline-flex shrink-0 ${sizeClass} ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={trimmed}
          className="h-full w-full rounded-full object-cover ring-2 ring-parchment dark:ring-ink-deep"
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full font-bold text-cream ${suit.bg}`}
        >
          {trimmed ? trimmed.charAt(0).toUpperCase() : '?'}
        </span>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex h-[0.6em] w-[0.6em] items-center justify-center rounded-full text-[0.4em] leading-none text-cream ring-2 ring-parchment dark:ring-ink-deep ${suit.bg}`}
        aria-hidden="true"
      >
        {suit.symbol}
      </span>
    </span>
  );
}
