import { Shuffle } from 'lucide-react';
import { dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));

  return (
    <div className="overflow-x-auto rounded-2xl border border-paper-line bg-paper-raised shadow-sm dark:border-chalk-board-line dark:bg-chalk-board-raised">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-paper-line dark:border-chalk-board-line">
            <th className="sticky left-0 bg-paper-raised p-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint dark:bg-chalk-board-raised dark:text-chalk-faint">
              Round
            </th>
            {players.map((p) => {
              const suit = suitForName(p.name);
              return (
                <th key={p.id} className="p-2.5 text-center font-semibold text-ink dark:text-chalk">
                  <span className="flex flex-col items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${suit.bg}`} />
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
                  'border-b border-paper-line/60 last:border-0 dark:border-chalk-board-line/60',
                  idx % 2 === 1 ? 'bg-paper/60 dark:bg-chalk-board/40' : '',
                ].join(' ')}
              >
                <td className="sticky left-0 bg-inherit p-2.5 text-ink-soft dark:text-chalk-soft">
                  <span className="font-display text-base text-ink dark:text-chalk">{wildRankWordForRound(roundNumber)}</span>
                  <span className="ml-1 text-[10px] text-ink-faint dark:text-chalk-faint">R{roundNumber}</span>
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  const isDealer = entry && dealer?.id === p.id;
                  const suit = suitForName(p.name);
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 font-semibold font-mono text-ink dark:text-chalk">
                            {isDealer && <Shuffle size={10} className={suit.text} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-red-ink">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 font-semibold font-mono text-ink transition-colors hover:bg-red-ink/10 dark:text-chalk dark:hover:bg-red-ink/20"
                          >
                            {isDealer && <Shuffle size={10} className={suit.text} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-red-ink">●</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-paper-line dark:text-chalk-board-line">–</span>
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
