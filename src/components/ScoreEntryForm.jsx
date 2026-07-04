import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Avatar from './Avatar.jsx';
import NumberKeypadSheet from './NumberKeypadSheet.jsx';

function initialEntries(players, initialData) {
  const entries = {};
  players.forEach((p) => {
    const existing = initialData?.[p.id];
    entries[p.id] = {
      score: existing ? String(existing.score) : '',
      wentOut: existing?.wentOut ?? false,
    };
  });
  return entries;
}

export default function ScoreEntryForm({
  players,
  initialData,
  submitLabel,
  onSubmit,
  onCancel,
  roundNumber,
  onDraftChange,
}) {
  const [entries, setEntries] = useState(() => initialEntries(players, initialData));
  const [activeIndex, setActiveIndex] = useState(null);

  const someoneWentOut = players.some((p) => entries[p.id].wentOut);
  const scoresValid = players.every((p) => {
    const value = entries[p.id]?.score;
    // A blank score defaults to 0 at submit time, so it's not blocking — only
    // a non-numeric or negative entry is.
    return value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0);
  });
  const allValid = someoneWentOut && scoresValid;

  // Live preview only — lets the parent show leader-delta totals updating as
  // someone types, without writing anything until real submit.
  useEffect(() => {
    if (!onDraftChange || !roundNumber) return;
    const scores = {};
    players.forEach((p) => {
      const value = entries[p.id].score;
      scores[p.id] = { score: value === '' ? 0 : Number(value) || 0, wentOut: entries[p.id].wentOut };
    });
    onDraftChange({ roundNumber, scores });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  function updateScore(playerId, nextValue) {
    setEntries((prev) => ({ ...prev, [playerId]: { ...prev[playerId], score: nextValue } }));
  }

  // Going out is always a 0-point round, and it's a common mis-tap to leave a
  // stale number in the box after toggling this on — so lock the field instead
  // of just defaulting it, and hand control back with a clean slate if toggled
  // off. Only one player can go out per round, so turning it on for someone
  // else clears whoever had it before.
  function toggleWentOut(playerId) {
    setEntries((prev) => {
      const turningOn = !prev[playerId].wentOut;
      const next = {};
      players.forEach((p) => {
        if (p.id === playerId) {
          next[p.id] = { score: turningOn ? '0' : '', wentOut: turningOn };
        } else {
          next[p.id] = turningOn && prev[p.id].wentOut ? { score: '', wentOut: false } : prev[p.id];
        }
      });
      return next;
    });
  }

  // After tapping Done, jump straight to the next player who still needs a
  // score — chains the whole table's entry into one fast pass instead of
  // reopening the sheet per player.
  function openNextKeypad(fromIndex) {
    for (let i = fromIndex + 1; i < players.length; i += 1) {
      if (!entries[players[i].id].wentOut) {
        setActiveIndex(i);
        return;
      }
    }
    setActiveIndex(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) return;
    const scoresByPlayerId = {};
    players.forEach((p) => {
      const value = entries[p.id].score;
      scoresByPlayerId[p.id] = {
        score: value === '' ? 0 : Number(value),
        wentOut: entries[p.id].wentOut,
      };
    });
    onSubmit(scoresByPlayerId);
  }

  const activePlayer = activeIndex !== null ? players[activeIndex] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {players.map((p, i) => {
        const wentOut = entries[p.id].wentOut;
        const score = entries[p.id].score;
        return (
          <div
            key={p.id}
            className="nb-shadow-sm flex min-h-[64px] items-center gap-3 rounded-2xl border-[3px] border-ink bg-card p-3 dark:border-ink-dark dark:bg-card-dark"
          >
            <Avatar name={p.name} sizeClass="h-9 w-9 text-sm" />
            <span className="min-w-0 flex-1 truncate font-bold text-ink dark:text-ink-dark">{p.name}</span>
            <button
              type="button"
              onClick={() => toggleWentOut(p.id)}
              className={[
                'nb-press-sm flex shrink-0 items-center gap-1 rounded-full border-2 px-3 py-2 text-xs font-extrabold',
                wentOut
                  ? 'border-ink bg-red text-ink dark:border-ink-dark'
                  : 'border-ink text-muted dark:border-ink-dark dark:text-muted-dark',
              ].join(' ')}
            >
              {wentOut && <Check size={14} />}
              Went out
            </button>
            {wentOut ? (
              <span className="flex w-16 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink bg-cream py-2.5 text-center font-display text-xl text-muted dark:border-ink-dark dark:bg-canvas-dark dark:text-muted-dark">
                0
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="nb-press-sm nb-shadow-sm flex w-16 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink bg-yellow py-2.5 text-center font-display text-xl text-ink dark:border-ink-dark"
              >
                {score || '0'}
              </button>
            )}
          </div>
        );
      })}

      {!someoneWentOut && (
        <p className="text-center text-xs font-bold text-red">
          Mark who went out this round to continue.
        </p>
      )}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="nb-press flex-1 rounded-xl border-[3px] border-ink py-3 font-extrabold text-ink dark:border-ink-dark dark:text-ink-dark"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!allValid}
          className="nb-press nb-shadow flex-1 rounded-xl border-[3px] border-ink bg-green py-3 font-extrabold text-ink disabled:opacity-40 dark:border-ink-dark"
        >
          {submitLabel}
        </button>
      </div>

      {activePlayer && (
        <NumberKeypadSheet
          open
          playerName={activePlayer.name}
          value={entries[activePlayer.id].score}
          onChange={(next) => updateScore(activePlayer.id, next)}
          onDone={() => openNextKeypad(activeIndex)}
        />
      )}
    </form>
  );
}
