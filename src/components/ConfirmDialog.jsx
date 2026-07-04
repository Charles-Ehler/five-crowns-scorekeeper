export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-paper-raised p-5 shadow-2xl animate-pop-in dark:bg-chalk-board-raised sm:rounded-3xl">
        <h2 className="font-display text-xl text-ink dark:text-chalk">{title}</h2>
        {message && <p className="mt-2 text-sm text-ink-soft dark:text-chalk-soft">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-paper-line py-3 font-medium text-ink transition-colors hover:bg-paper dark:border-chalk-board-line dark:text-chalk dark:hover:bg-chalk-board"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-ink py-3 font-medium text-paper transition active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
