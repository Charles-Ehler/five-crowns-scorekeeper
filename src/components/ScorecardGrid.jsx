import { Shuffle } from 'lucide-react';
import { computeTotals, dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { colorVar, seatColors } from '../lib/suits.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));
  const totals = computeTotals(players, rounds);
  const colors = seatColors(players);
  const lowest = Math.min(...players.map((p) => totals[p.id]));

  return (
    <div className="card-elevated overflow-x-auto overflow-y-hidden rounded-2xl bg-surface">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 bg-surface p-2.5 text-left text-sm font-semibold text-fg-soft">
              Round
            </th>
            {players.map((p) => {
              return (
                <th key={p.id} className="p-2.5 text-center font-bold text-fg">
                  <span className="flex flex-col items-center gap-1">
                    <span className="h-2 w-8 rounded-full" style={{ background: colorVar(colors[p.id]) }} aria-hidden="true" />
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
                  'border-b border-line last:border-0 border-line/60',
                  idx % 2 === 1 ? 'bg-surface-sunk/50' : '',
                ].join(' ')}
              >
                <td className="sticky left-0 bg-inherit p-2.5 text-fg-soft">
                  <span className="font-bold text-fg">{wildRankWordForRound(roundNumber)}</span>
                  <span className="ml-1 text-[10px] text-fg-soft">R{roundNumber}</span>
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  const isDealer = entry && dealer?.id === p.id;
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 font-bold tabular-nums text-fg">
                            {isDealer && <Shuffle size={10} />}
                            <span className={entry.filled ? 'italic opacity-50' : ''} title={entry.filled ? 'Filled in: joined after this round' : undefined}>{entry.score}</span>
                            {entry.wentOut && <span className="ml-1 text-heart">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="press inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 font-bold tabular-nums text-fg hover:bg-surface-sunk"
                          >
                            {isDealer && <Shuffle size={10} />}
                            <span className={entry.filled ? 'italic opacity-50' : ''} title={entry.filled ? 'Filled in: joined after this round' : undefined}>{entry.score}</span>
                            {entry.wentOut && <span className="ml-1 text-heart">●</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-fg-soft/30">–</span>
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
              <th className="sticky left-0 bg-surface p-2.5 text-left font-display text-base font-bold text-fg">
                Total
              </th>
              {players.map((p) => (
                <td
                  key={p.id}
                  className={`p-2.5 text-center font-display text-lg font-bold tabular-nums ${totals[p.id] === lowest ? 'text-gold-deep dark:text-gold' : 'text-fg'}`}
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
