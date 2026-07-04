import { usePlayerPhoto } from '../contexts/PlayerPhotosContext.jsx';
import { suitForName } from '../lib/suits.js';

// Photo if the player has uploaded one, otherwise a hash-based initials
// circle — sizeClass is the caller's exact Tailwind size (h-9 w-9 text-sm,
// etc.) so this is a drop-in swap wherever an avatar renders.
export default function Avatar({ name, sizeClass, className = '' }) {
  const photoUrl = usePlayerPhoto(name);
  const suit = suitForName(name);
  const trimmed = name.trim();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={trimmed}
        className={`shrink-0 rounded-full object-cover ring-2 ring-paper dark:ring-chalk-board ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-paper dark:text-chalk-board ${suit.bg} ${sizeClass} ${className}`}
    >
      {trimmed ? trimmed.charAt(0).toUpperCase() : '?'}
    </span>
  );
}
