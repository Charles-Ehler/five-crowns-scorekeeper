import { Crown } from 'lucide-react';

// Shown while Firestore answers: a breathing crown instead of bare text, so
// the table never looks broken on a slow connection.
export default function Loading({ label = 'Shuffling the deck' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-fg-soft" role="status">
      <Crown size={40} fill="currentColor" className="animate-crown-breathe text-gold" />
      <p className="font-display text-lg font-semibold">{label}</p>
    </div>
  );
}
