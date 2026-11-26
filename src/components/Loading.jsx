import { Crown } from 'lucide-react';
import { useSlow } from '../hooks/useSlow.js';

// Shown while Firestore answers: a breathing crown instead of bare text, so
// the table never looks broken on a slow connection. After 5 seconds it says
// so and offers a retry.
export default function Loading({ label = 'Shuffling the deck' }) {
  const slow = useSlow(true);
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-fg-soft" role="status">
      <Crown size={40} fill="currentColor" className="animate-crown-breathe text-gold" />
      <p className="font-display text-lg font-semibold">{label}</p>
      {slow && (
        <div className="text-center">
          <p className="text-sm">This is taking longer than usual. Check the Wi-Fi.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="press mt-3 rounded-full bg-fg px-5 py-2 text-sm font-bold text-canvas"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
