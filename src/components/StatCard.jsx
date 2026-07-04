export default function StatCard({ icon: Icon, label, accent, value, unit, playerName, context }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-paper-line bg-paper-raised p-4 shadow-sm transition-shadow hover:shadow-md dark:border-chalk-board-line dark:bg-chalk-board-raised">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${accent.soft}`}>
          <Icon size={16} className={accent.text} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-chalk-faint">{label}</p>
      </div>
      <p className="font-mono text-3xl font-bold tabular-nums text-ink dark:text-chalk">
        {value}
        {unit && <span className="ml-1 font-sans text-base font-medium text-ink-faint dark:text-chalk-faint">{unit}</span>}
      </p>
      {playerName && <p className="truncate text-sm font-semibold text-ink dark:text-chalk">{playerName}</p>}
      {context && <div className="text-xs text-ink-faint dark:text-chalk-faint">{context}</div>}
    </div>
  );
}
