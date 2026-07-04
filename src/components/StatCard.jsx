export default function StatCard({ icon: Icon, label, accent, value, unit, playerName, context }) {
  return (
    <div className="card-elevated flex flex-col gap-2 rounded-2xl bg-parchment-panel p-4 dark:bg-ink-panel">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.bg}`}>
          <Icon size={16} className="text-cream" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">{label}</p>
      </div>
      <p className="text-3xl font-extrabold tabular-nums text-ink dark:text-cream">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-muted dark:text-muted-dark">{unit}</span>}
      </p>
      {playerName && <p className="truncate text-sm font-bold text-ink dark:text-cream">{playerName}</p>}
      {context && <div className="text-xs text-muted dark:text-muted-dark">{context}</div>}
    </div>
  );
}
