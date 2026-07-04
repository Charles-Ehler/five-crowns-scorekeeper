export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center">
      <div className="nb-shadow w-full max-w-sm animate-pop-in rounded-2xl border-[3px] border-ink bg-card p-5 dark:border-ink-dark dark:bg-card-dark">
        <h2 className="font-display text-lg text-ink dark:text-ink-dark">{title}</h2>
        {message && <p className="mt-2 text-sm text-muted dark:text-muted-dark">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="nb-press-sm flex-1 rounded-xl border-2 border-ink py-3 font-bold text-ink dark:border-ink-dark dark:text-ink-dark"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="nb-shadow-sm nb-press-sm flex-1 rounded-xl border-2 border-ink bg-red py-3 font-bold text-ink dark:border-ink-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
