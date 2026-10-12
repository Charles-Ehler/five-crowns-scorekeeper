import { useEffect, useRef } from 'react';
import PlayingCard from './PlayingCard.jsx';
import { cardsDealtForRound, wildRankWordForRound } from '../lib/fiveCrowns.js';

const SHOW_MS = 2600;

// The one orchestrated moment: when a round lands, the next wild card is dealt
// onto the table full-screen, with who deals and how many. Tap to skip.
export default function DealInterstitial({ round, dealerName, onDone }) {
  // Parent re-renders pass a fresh onDone; keep the timer from restarting.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const id = setTimeout(() => onDoneRef.current(), SHOW_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Continue"
      className="animate-deal-backdrop fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink-deep/90 px-6 text-center backdrop-blur-md"
    >
      <div className="animate-deal-card">
        <PlayingCard round={round} size="lg" />
      </div>
      <p className="animate-deal-text mt-8 font-display text-5xl font-bold text-cream">{wildRankWordForRound(round)}</p>
      <p className="animate-deal-text mt-1 font-display text-2xl italic text-gold" style={{ animationDelay: '520ms' }}>
        are wild
      </p>
      <p className="animate-deal-text mt-6 text-base text-muted-dark" style={{ animationDelay: '700ms' }}>
        <span className="font-bold text-cream">{dealerName}</span> deals {cardsDealtForRound(round)} cards
      </p>
    </button>
  );
}
