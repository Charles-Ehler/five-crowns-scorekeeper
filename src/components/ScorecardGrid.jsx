import { Shuffle } from 'lucide-react';
import { computeTotals, dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));
  const totals = computeTotals(players, rounds);
  const lowest = Math.min(...players.map((p) => totals[p.id]));

  return (
    <div className="card-elevated overflow-x-auto overflow-y-hidden rounded-2xl bg-parchment-panel dark:bg-ink-panel">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-parchment-line dark:border-ink-line">
            <th className="sticky left-0 bg-parchment-panel p-2.5 text-left text-sm font-semibold text-muted dark:bg-ink-panel dark:text-muted-dark">
              Round
            </th>
            {players.map((p) => {
              const suit = suitForName(p.name);
              return (
                <th key={p.id} className="p-2.5 text-center font-bold text-ink dark:text-cream">
                  <span className="flex flex-col items-center gap-1">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-cream ${suit.bg}`}>
                      {suit.symbol}
                    </span>
                    {p.name}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((roundNumber, idx) => {
            const round = roundsByNumber.get(roundNumber);
            const dealer = dealerForRound(roundNumber, players);
            return (
              <tr
                key={roundNumber}
                className={[
                  'border-b border-parchment-line/60 last:border-0 dark:border-ink-line/60',
                  idx % 2 === 1 ? 'bg-gold/5' : '',
                ].join(' ')}
              >
                <td className="sticky left-0 bg-inherit p-2.5 text-muted dark:text-muted-dark">
                  <span className="font-bold text-ink dark:text-cream">{wildRankWordForRound(roundNumber)}</span>
                  <span className="ml-1 text-[10px] text-muted dark:text-muted-dark">R{roundNumber}</span>
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  const isDealer = entry && dealer?.id === p.id;
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 font-bold tabular-nums text-ink dark:text-cream">
                            {isDealer && <Shuffle size={10} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-heart">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="press inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 font-bold tabular-nums text-ink hover:bg-gold/10 dark:text-cream"
                          >
                            {isDealer && <Shuffle size={10} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-heart">●</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-muted/30 dark:text-muted-dark/30">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        {rounds.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-gold/40">
              <th className="sticky left-0 bg-parchment-panel p-2.5 text-left font-display text-base font-bold text-ink dark:bg-ink-panel dark:text-cream">
                Total
              </th>
              {players.map((p) => (
                <td
                  key={p.id}
                  className={`p-2.5 text-center font-display text-lg font-bold tabular-nums ${totals[p.id] === lowest ? 'text-gold-deep dark:text-gold' : 'text-ink dark:text-cream'}`}
                >
                  {totals[p.id]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
