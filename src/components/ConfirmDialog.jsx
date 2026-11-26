export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="card-elevated w-full max-w-sm animate-pop-in rounded-2xl bg-surface p-5">
        <h2 className="font-display text-lg text-fg">{title}</h2>
        {message && <p className="mt-2 text-sm text-fg-soft">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="press flex-1 rounded-xl border border-line py-3 font-semibold text-fg border-line"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="press flex-1 rounded-xl bg-heart py-3 font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
