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

  // A player can join mid-game, which adds them to `players` without
  // remounting this form (same round, same key). `entries` state won't have
  // their id until this backfills it, so every read below goes through this
  // merged view instead of the raw state — the effect keeps state itself in
  // sync for edits, but rendering can't wait for the effect to run first.
  const safeEntries = {};
  players.forEach((p) => {
    safeEntries[p.id] = entries[p.id] ?? { score: '', wentOut: false };
  });

  useEffect(() => {
    setEntries((prev) => {
      const missing = players.filter((p) => !prev[p.id]);
      if (missing.length === 0) return prev;
      const next = { ...prev };
      missing.forEach((p) => {
        next[p.id] = { score: '', wentOut: false };
      });
      return next;
    });
  }, [players]);

  const someoneWentOut = players.some((p) => safeEntries[p.id].wentOut);
  const scoresValid = players.every((p) => {
    const value = safeEntries[p.id].score;
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
      const value = safeEntries[p.id].score;
      scores[p.id] = { score: value === '' ? 0 : Number(value) || 0, wentOut: safeEntries[p.id].wentOut };
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
      const current = (p) => prev[p] ?? { score: '', wentOut: false };
      const turningOn = !current(playerId).wentOut;
      const next = {};
      players.forEach((p) => {
        if (p.id === playerId) {
          next[p.id] = { score: turningOn ? '0' : '', wentOut: turningOn };
        } else {
          next[p.id] = turningOn && current(p.id).wentOut ? { score: '', wentOut: false } : current(p.id);
        }
      });
      return next;
    });
  }

  function focusNextInput(index) {
    for (let i = index + 1; i < players.length; i += 1) {
      const nextPlayer = players[i];
      if (safeEntries[nextPlayer.id].wentOut) continue; // locked field, skip
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
      const value = safeEntries[p.id].score;
      scoresByPlayerId[p.id] = {
        score: value === '' ? 0 : Number(value),
        wentOut: safeEntries[p.id].wentOut,
      };
    });
    onSubmit(scoresByPlayerId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {players.map((p, i) => {
        const wentOut = safeEntries[p.id].wentOut;
        return (
          <div
            key={p.id}
            className="card-elevated flex min-h-[64px] items-center gap-3 rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel"
          >
            <Avatar name={p.name} sizeClass="h-9 w-9 text-sm" />
            <span className="min-w-0 flex-1 truncate font-bold text-ink dark:text-cream">{p.name}</span>
            <button
              type="button"
              onClick={() => toggleWentOut(p.id)}
              className={[
                'press flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold',
                wentOut
                  ? 'bg-heart text-cream'
                  : 'bg-muted/10 text-muted dark:bg-muted-dark/10 dark:text-muted-dark',
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
              value={safeEntries[p.id].score}
              onChange={(e) => updateScore(p.id, e.target.value)}
              onKeyDown={(e) => handleScoreKeyDown(e, i)}
              placeholder="0"
              className={[
                'w-16 shrink-0 rounded-xl border-2 py-2.5 text-center font-display text-xl focus:outline-none',
                wentOut
                  ? 'border-parchment-line bg-parchment text-muted dark:border-ink-line dark:bg-ink-deep dark:text-muted-dark'
                  : 'border-gold/40 bg-gold/10 text-ink focus:border-gold dark:text-cream',
              ].join(' ')}
            />
          </div>
        );
      })}

      {!someoneWentOut && (
        <p className="text-center text-xs font-bold text-heart">
          Mark who went out this round to continue.
        </p>
      )}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="press flex-1 rounded-xl border border-parchment-line py-3 font-semibold text-ink dark:border-ink-line dark:text-cream"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!allValid}
          className="press flex-1 rounded-xl bg-gold py-3 font-bold text-ink disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
