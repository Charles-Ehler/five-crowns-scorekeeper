import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import Avatar from './Avatar.jsx';

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
  const inputRefs = useRef({});

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

  function updateScore(playerId, rawValue) {
    const score = rawValue.replace(/[^0-9]/g, '');
    setEntries((prev) => ({ ...prev, [playerId]: { ...prev[playerId], score } }));
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

  function focusNextInput(index) {
    for (let i = index + 1; i < players.length; i += 1) {
      const nextPlayer = players[i];
      if (entries[nextPlayer.id].wentOut) continue; // locked field, skip
      inputRefs.current[nextPlayer.id]?.focus();
      inputRefs.current[nextPlayer.id]?.select();
      return;
    }
    inputRefs.current[players[index].id]?.blur();
  }

  function handleScoreKeyDown(e, index) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    focusNextInput(index);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {players.map((p, i) => {
        const wentOut = entries[p.id].wentOut;
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
            <input
              ref={(el) => {
                inputRefs.current[p.id] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="next"
              readOnly={wentOut}
              value={entries[p.id].score}
              onChange={(e) => updateScore(p.id, e.target.value)}
              onKeyDown={(e) => handleScoreKeyDown(e, i)}
              placeholder="0"
              className={[
                'w-16 shrink-0 rounded-xl border-[3px] border-ink py-2.5 text-center font-display text-xl focus:outline-none dark:border-ink-dark',
                wentOut
                  ? 'bg-cream text-muted dark:bg-canvas-dark dark:text-muted-dark'
                  : 'nb-shadow-sm bg-yellow text-ink',
              ].join(' ')}
            />
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
    </form>
  );
}
