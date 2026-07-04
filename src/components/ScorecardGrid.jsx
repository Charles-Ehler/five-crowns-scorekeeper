import { Shuffle } from 'lucide-react';
import { dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));

  return (
    <div className="nb-shadow overflow-x-auto rounded-2xl border-[3px] border-ink bg-card dark:border-ink-dark dark:bg-card-dark">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b-[3px] border-ink dark:border-ink-dark">
            <th className="sticky left-0 bg-card p-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted dark:bg-card-dark dark:text-muted-dark">
              Round
            </th>
            {players.map((p) => {
              const suit = suitForName(p.name);
              return (
                <th key={p.id} className="p-2.5 text-center font-bold text-ink dark:text-ink-dark">
                  <span className="flex flex-col items-center gap-1">
                    <span className={`h-3 w-3 rounded-full border-2 border-ink dark:border-ink-dark ${suit.bg}`} />
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
                  'border-b-2 border-ink/20 last:border-0 dark:border-ink-dark/20',
                  idx % 2 === 1 ? 'bg-ink/5 dark:bg-ink-dark/5' : '',
                ].join(' ')}
              >
                <td className="sticky left-0 bg-inherit p-2.5 text-muted dark:text-muted-dark">
                  <span className="font-bold text-ink dark:text-ink-dark">{wildRankWordForRound(roundNumber)}</span>
                  <span className="ml-1 text-[10px] text-muted dark:text-muted-dark">R{roundNumber}</span>
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  const isDealer = entry && dealer?.id === p.id;
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 font-bold tabular-nums text-ink dark:text-ink-dark">
                            {isDealer && <Shuffle size={10} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-red">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="nb-press-sm inline-flex w-full items-center justify-center gap-1 rounded-lg border-2 border-transparent px-2 py-1 font-bold tabular-nums text-ink active:border-ink dark:text-ink-dark dark:active:border-ink-dark"
                          >
                            {isDealer && <Shuffle size={10} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-red">●</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-ink/20 dark:text-ink-dark/20">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
