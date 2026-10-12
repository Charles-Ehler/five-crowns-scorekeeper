import { Crown } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { computeTotals } from '../lib/fiveCrowns.js';

// End-of-game moment: the crown drops onto the winner (or co-winners).
export default function WinnerReveal({ game }) {
  const totals = computeTotals(game.players, game.rounds);
  const winners = game.players.filter((p) => game.winnerIds?.includes(p.id));
  if (!winners.length) return null;

  return (
    <div className="relative flex flex-col items-center py-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep dark:text-gold">
        {winners.length > 1 ? 'Shared crown' : 'Wears the crown'}
      </p>
      <div className="mt-9 flex justify-center gap-6">
        {winners.map((w, i) => (
          <div key={w.id} className="flex flex-col items-center">
            <div className="relative">
              <Crown
                size={34}
                fill="currentColor"
                className="animate-crown-drop absolute -top-7 left-1/2 -translate-x-1/2 text-gold drop-shadow-[0_2px_6px_rgba(212,169,74,0.6)]"
                style={{ animationDelay: `${300 + i * 150}ms` }}
              />
              <Avatar name={w.name} sizeClass="h-20 w-20 text-3xl ring-4 ring-gold rounded-full" className="animate-pop-in" />
            </div>
            <p className="mt-3 font-display text-2xl text-ink dark:text-cream">{w.name}</p>
            <p className="text-sm font-bold text-muted dark:text-muted-dark">{totals[w.id]} points</p>
          </div>
        ))}
      </div>
    </div>
  );
}
