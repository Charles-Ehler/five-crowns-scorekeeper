// The date as a small pearl playing card: day of month as the rank.
export default function DateCard({ ts, size = 'md' }) {
  const d = ts?.toDate ? ts.toDate() : null;
  const lg = size === 'lg';
  return (
    <span
      className={`record-card flex shrink-0 flex-col items-center justify-center rounded-lg bg-pearl leading-none ${lg ? 'h-[5.6rem] w-[4.1rem]' : 'h-[4.2rem] w-[3.1rem]'}`}
    >
      <span className={`font-bold text-heart ${lg ? 'text-xs' : 'text-[10px]'}`}>{d ? d.toLocaleDateString(undefined, { month: 'short' }) : ''}</span>
      <span className={`font-display font-bold text-[#111318] ${lg ? 'text-4xl' : 'text-2xl'}`}>{d ? d.getDate() : '?'}</span>
      <span className={`text-[#565c6b] ${lg ? 'text-xs' : 'text-[10px]'}`}>{d ? d.toLocaleDateString(undefined, { weekday: 'short' }) : ''}</span>
    </span>
  );
}
