import { useState } from 'react';
import { usePlayerPhoto } from '../contexts/PlayerPhotosContext.jsx';
import { colorVar, onColor, suitForName } from '../lib/suits.js';

// Photo if the player has uploaded one, otherwise a hash-based initials
// circle, sizeClass is the caller's exact Tailwind size (h-9 w-9 text-sm,
// etc.) so this is a drop-in swap wherever an avatar renders. The small suit
// pip in the corner is the player's fixed identity mark (deck suit, not an
// arbitrary color), visible even on an uploaded photo.
// color: optional seat color key for this game (see seatColors), so no two
// players at one table share a color.
export default function Avatar({ name, sizeClass, className = '', color }) {
  const photoUrl = usePlayerPhoto(name);
  const suit = suitForName(name);
  const trimmed = name.trim();
  // A stale photo URL (e.g. from an old storage bucket) falls back to initials
  // instead of a broken-image icon.
  const [failedUrl, setFailedUrl] = useState(null);
  const showPhoto = photoUrl && photoUrl !== failedUrl;

  return (
    <span className={`relative inline-flex shrink-0 ${sizeClass} ${className}`}>
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={trimmed}
          onError={() => setFailedUrl(photoUrl)}
          className="h-full w-full rounded-full object-cover ring-2 ring-canvas"
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full font-display font-bold ${color ? '' : `${suit.key === 'star' ? 'text-fg' : 'text-white'} ${suit.bg}`}`}
          style={color ? { background: colorVar(color), color: onColor(color) } : undefined}
        >
          {trimmed ? trimmed.charAt(0).toUpperCase() : '?'}
        </span>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex h-[0.6em] w-[0.6em] items-center justify-center rounded-full text-[0.4em] leading-none text-white ring-2 ring-canvas ${suit.bg}`}
        aria-hidden="true"
      >
        {suit.symbol}
      </span>
    </span>
  );
}
