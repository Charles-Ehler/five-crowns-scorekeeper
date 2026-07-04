import { Delete } from 'lucide-react';
import Avatar from './Avatar.jsx';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

// Full-screen custom keypad instead of the OS numeric keyboard: big chunky
// buttons that match the app's own theme and never cover the rest of the
// score sheet, so entering a round's scores at a table stays fast and
// one-handed. `value` is the digit string being built; every keypress
// reports the next value immediately so the caller's live draft preview
// (leader deltas, etc.) updates as you type, same as a live text input would.
export default function NumberKeypadSheet({ open, playerName, value, onChange, onDone }) {
  if (!open) return null;

  function press(key) {
    if (key === 'back') {
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      onChange('');
    } else if (value.length < 3) {
      onChange(value === '0' ? key : value + key);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60" onClick={onDone}>
      <div
        className="nb-shadow animate-sheet-in w-full max-w-sm rounded-t-3xl border-[3px] border-b-0 border-ink bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-ink-dark dark:bg-card-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={playerName} sizeClass="h-10 w-10 text-sm" />
          <span className="font-bold text-ink dark:text-ink-dark">{playerName}</span>
        </div>

        <div className="nb-shadow-sm mb-4 flex h-20 items-center justify-center rounded-2xl border-[3px] border-ink bg-cream dark:border-ink-dark dark:bg-canvas-dark">
          <span className="font-display text-5xl text-ink dark:text-ink-dark">{value || '0'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={[
                'nb-press-sm nb-shadow-sm flex h-16 items-center justify-center rounded-2xl border-[3px] border-ink text-2xl font-extrabold text-ink dark:border-ink-dark dark:text-ink-dark',
                key === 'clear' || key === 'back' ? 'bg-card text-base dark:bg-card-dark' : 'bg-card dark:bg-card-dark',
              ].join(' ')}
            >
              {key === 'back' ? <Delete size={22} /> : key === 'clear' ? 'CLR' : key}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onDone}
          className="nb-press nb-shadow mt-4 w-full rounded-2xl border-[3px] border-ink bg-green py-3.5 font-display text-lg text-ink dark:border-ink-dark"
        >
          Done
        </button>
      </div>
    </div>
  );
}
