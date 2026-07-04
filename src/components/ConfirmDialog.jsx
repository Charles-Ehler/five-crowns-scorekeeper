export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="card-elevated w-full max-w-sm animate-pop-in rounded-2xl bg-parchment-panel p-5 dark:bg-ink-panel">
        <h2 className="font-display text-lg text-ink dark:text-cream">{title}</h2>
        {message && <p className="mt-2 text-sm text-muted dark:text-muted-dark">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="press flex-1 rounded-xl border border-parchment-line py-3 font-semibold text-ink dark:border-ink-line dark:text-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="press flex-1 rounded-xl bg-heart py-3 font-semibold text-cream"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
