import { useEffect, useRef, useState } from 'react';
import { Check, Delete } from 'lucide-react';
import Avatar from './Avatar.jsx';
import HandCounter from './HandCounter.jsx';
import { seatColors } from '../lib/suits.js';

const MAX_DIGITS = 3;

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

// The app's own number pad. Score cells are buttons, not text fields, so the
// iPad keyboard can never open: there is nothing for iOS to focus. Docked to
// the bottom of the screen like a keyboard on the live game, inline inside
// the Edit round sheet.
function ScorePad({ player, color, value, wentOut, roundNumber, isLast, docked, onDigit, onBackspace, onClear, onToggleOut, onUse, onNext, onClose }) {
  const [mode, setMode] = useState('number');

  return (
    <div
      role="group"
      data-score-pad
      aria-label={`Score pad for ${player.name}`}
      className={
        docked
          ? 'animate-sheet-up fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.18)] md:inset-x-auto md:right-4 md:w-[27rem] md:rounded-t-3xl md:border-x'
          : 'mt-3 rounded-2xl border border-line bg-surface p-3'
      }
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-2.5 flex items-center gap-3">
          <Avatar name={player.name} color={color} sizeClass="h-9 w-9 text-sm" />
          <span className="min-w-0 flex-1 truncate font-display text-lg font-bold text-fg">{player.name}</span>
          <span className={`min-w-14 rounded-lg px-2 text-right font-display text-3xl font-bold tabular-nums ${wentOut ? 'text-club' : 'text-fg'}`}>
            {wentOut ? 'Out' : value || '0'}
          </span>
        </div>

        <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-xl bg-surface-sunk p-1 text-sm font-semibold" role="tablist">
          {[
            ['number', 'Type number'],
            ['cards', 'Count cards'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              disabled={wentOut && key === 'cards'}
              className={`rounded-lg py-2 disabled:opacity-35 ${mode === key ? 'bg-surface text-fg shadow-sm' : 'text-fg-soft'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'cards' && !wentOut ? (
          <HandCounter
            key={player.id}
            roundNumber={roundNumber}
            onUse={(total) => {
              onUse(total);
              setMode('number');
            }}
          />
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {['1', '2', '3'].map((d) => (
              <button key={d} type="button" disabled={wentOut} onClick={() => onDigit(d)} className="pad-key h-14 text-2xl">{d}</button>
            ))}
            <button type="button" disabled={wentOut} onClick={onBackspace} aria-label="Backspace" className="pad-key h-14"><Delete size={22} /></button>
            {['4', '5', '6'].map((d) => (
              <button key={d} type="button" disabled={wentOut} onClick={() => onDigit(d)} className="pad-key h-14 text-2xl">{d}</button>
            ))}
            <button type="button" disabled={wentOut} onClick={onClear} className="pad-key h-14 text-base">Clear</button>
            {['7', '8', '9'].map((d) => (
              <button key={d} type="button" disabled={wentOut} onClick={() => onDigit(d)} className="pad-key h-14 text-2xl">{d}</button>
            ))}
            <button
              type="button"
              onClick={onToggleOut}
              aria-pressed={wentOut}
              className={`pad-key h-14 text-sm leading-tight ${wentOut ? 'bg-club text-white' : ''}`}
            >
              {wentOut ? <><Check size={16} className="mr-0.5" />Out</> : 'Went out'}
            </button>
            <button type="button" disabled={wentOut} onClick={() => onDigit('0')} className="pad-key col-span-2 h-14 text-2xl">0</button>
            <button type="button" onClick={isLast ? onClose : onNext} className="pad-key col-span-2 h-14 bg-fg text-canvas">
              {isLast ? 'Done' : 'Next player'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScoreEntryForm({
  players,
  initialData,
  submitLabel,
  onSubmit,
  onCancel,
  roundNumber,
  onDraftChange,
  docked = true,
}) {
  const [entries, setEntries] = useState(() => initialEntries(players, initialData));
  const [activeId, setActiveId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const rowRefs = useRef({});
  const colors = seatColors(players);

  // A player can join mid-game, which adds them to `players` without
  // remounting this form (same round, same key). `entries` state won't have
  // their id until this backfills it, so every read below goes through this
  // merged view instead of the raw state.
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

  // A removed player can't stay selected.
  const active = players.find((p) => p.id === activeId) ?? null;

  const someoneWentOut = players.some((p) => safeEntries[p.id].wentOut);
  const allValid = someoneWentOut;

  // Live preview only: the parent shows standings and the race updating as
  // scores go in, without writing anything until a real submit.
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

  // Keep the selected row fully visible: below the pinned round header and
  // above the docked pad (which is fixed, so the browser can't account for
  // it on its own). Effects run after the pad is in the DOM, so measuring
  // here is accurate without waiting a frame.
  useEffect(() => {
    const row = activeId && rowRefs.current[activeId];
    if (!row) return;
    if (!docked) {
      // Edit round sheet: row and pad sit together; show the pad's bottom.
      row.parentElement?.querySelector('[data-score-pad]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    const scroller = row.closest('main');
    const pad = document.querySelector('[data-score-pad]');
    const header = document.querySelector('[data-round-header]');
    if (!scroller || !pad) return;
    const margin = 12;
    const r = row.getBoundingClientRect();
    const floor = pad.getBoundingClientRect().top - margin;
    const ceiling = (header?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top) + margin;
    let delta = 0;
    if (r.bottom > floor) delta = r.bottom - floor;
    else if (r.top < ceiling) delta = r.top - ceiling;
    if (delta) scroller.scrollBy({ top: delta, behavior: 'smooth' });
  }, [activeId, docked]);

  function setScore(playerId, score) {
    setEntries((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] ?? { wentOut: false }), score } }));
  }

  // Functional updates, so fast taps or a hardware keyboard never drop a digit.
  function typeDigit(playerId, digit) {
    setEntries((prev) => {
      const entry = prev[playerId] ?? { score: '', wentOut: false };
      const base = entry.score === '0' ? '' : entry.score;
      if (entry.wentOut || base.length >= MAX_DIGITS) return prev;
      return { ...prev, [playerId]: { ...entry, score: base + digit } };
    });
  }

  function backspace(playerId) {
    setEntries((prev) => {
      const entry = prev[playerId] ?? { score: '', wentOut: false };
      return { ...prev, [playerId]: { ...entry, score: entry.score.slice(0, -1) } };
    });
  }

  // Going out is always a 0-point round, and only one player can go out, so
  // turning it on for someone clears whoever had it before. Turning it off
  // hands back a clean, empty score.
  function toggleWentOut(playerId) {
    setEntries((prev) => {
      const current = (id) => prev[id] ?? { score: '', wentOut: false };
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

  // The next player still to score, skipping whoever went out.
  function nextPlayerAfter(playerId) {
    const start = players.findIndex((p) => p.id === playerId);
    for (let i = start + 1; i < players.length; i += 1) {
      if (!safeEntries[players[i].id].wentOut) return players[i];
    }
    return null;
  }

  // A hardware keyboard (iPad Magic Keyboard) works too: digits, Backspace,
  // Enter for next, Escape to close.
  useEffect(() => {
    if (!active) return undefined;
    function onKey(e) {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      if (/^[0-9]$/.test(e.key)) typeDigit(active.id, e.key);
      else if (e.key === 'Backspace') backspace(active.id);
      else if (e.key === 'Enter') setActiveId(nextPlayerAfter(active.id)?.id ?? null);
      else if (e.key === 'Escape') setActiveId(null);
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Stays on screen with the numbers intact if the save fails (no Wi-Fi at
  // the table), and can't be double-tapped while a save is in flight.
  async function handleSubmit(e) {
    e.preventDefault();
    if (!allValid || submitting) return;
    const scoresByPlayerId = {};
    players.forEach((p) => {
      const value = safeEntries[p.id].score;
      const score = value === '' ? 0 : Number(value);
      const original = initialData?.[p.id];
      scoresByPlayerId[p.id] = { score, wentOut: safeEntries[p.id].wentOut };
      // Re-saving a round keeps the filled-in marker unless the score changed.
      if (original?.filled && original.score === score && !safeEntries[p.id].wentOut) {
        scoresByPlayerId[p.id].filled = true;
      }
    });
    setActiveId(null);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(scoresByPlayerId);
    } catch (err) {
      setSubmitError(err?.message ?? 'Could not save this round');
    } finally {
      setSubmitting(false);
    }
  }

  function renderPad() {
    return (
            <ScorePad
              player={active}
              color={colors[active.id]}
              value={safeEntries[active.id].score}
              wentOut={safeEntries[active.id].wentOut}
              roundNumber={roundNumber}
              isLast={!nextPlayerAfter(active.id)}
              docked={docked}
              onDigit={(d) => typeDigit(active.id, d)}
              onBackspace={() => backspace(active.id)}
              onClear={() => setScore(active.id, '')}
              onToggleOut={() => toggleWentOut(active.id)}
              onUse={(total) => setScore(active.id, String(total))}
              onNext={() => setActiveId(nextPlayerAfter(active.id)?.id ?? null)}
              onClose={() => setActiveId(null)}
            />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {players.map((p) => {
        const { score, wentOut } = safeEntries[p.id];
        const isActive = active?.id === p.id;
        return (
          <div key={p.id}>
          <div
            ref={(el) => {
              rowRefs.current[p.id] = el;
            }}
            className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 bg-surface p-2.5 transition-colors ${isActive ? 'border-fg' : 'border-transparent'}`}
          >
            <Avatar name={p.name} color={colors[p.id]} sizeClass="h-10 w-10 text-sm" />
            <span className="min-w-0 flex-1 truncate text-lg font-semibold text-fg">{p.name}</span>
            <button
              type="button"
              onClick={() => toggleWentOut(p.id)}
              aria-pressed={wentOut}
              className={`press flex h-11 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-bold ${wentOut ? 'bg-club text-white' : 'bg-surface-sunk text-fg-soft'}`}
            >
              {wentOut && <Check size={15} />}
              Out
            </button>
            <button
              type="button"
              onClick={() => setActiveId(isActive ? null : p.id)}
              aria-label={`${p.name}'s score: ${wentOut ? 'went out' : score || 'not entered'}. Tap to enter.`}
              aria-expanded={isActive}
              className={`press h-12 w-20 shrink-0 rounded-xl font-display text-2xl font-bold tabular-nums ${
                wentOut ? 'bg-surface-sunk text-fg-soft' : isActive ? 'bg-fg text-canvas' : 'bg-surface-sunk text-fg'
              }`}
            >
              {wentOut ? '0' : score === '' ? <span className="opacity-30">0</span> : score}
            </button>
          </div>
          {/* In the Edit round sheet the pad opens right under the tapped row. */}
          {isActive && !docked && renderPad()}
          </div>
        );
      })}

      {!someoneWentOut && <p className="text-center text-sm font-semibold text-heart">Tap Out next to whoever went out.</p>}

      {submitError && (
        <p role="alert" className="rounded-xl bg-heart/10 px-3 py-2 text-center text-sm font-bold text-heart">
          Not saved: {submitError}. Check the connection and try again.
        </p>
      )}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="press h-14 flex-1 rounded-2xl border-2 border-line font-semibold text-fg">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!allValid || submitting}
          className="press h-14 flex-1 rounded-2xl bg-fg font-display text-lg font-bold text-canvas disabled:opacity-30"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>

      {active && docked && (
        <>
          {/* Room to scroll the last rows above the docked pad. */}
          <div aria-hidden="true" className="h-[22rem]" />
          {renderPad()}
        </>
      )}
    </form>
  );
}
