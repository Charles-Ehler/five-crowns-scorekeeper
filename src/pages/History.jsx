import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, Play, Trash2 } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { TOTAL_ROUNDS } from '../lib/fiveCrowns.js';
import { deleteGame, listGames } from '../lib/games.js';
import { formatDate, summarizeGame, timestampMs } from '../lib/gameSummary.js';
import { playerKey } from '../lib/stats.js';
import { suitForName } from '../lib/suits.js';

// The game's whole race in a thumbnail: cumulative score per player across
// the 11 rounds. The winner's line is drawn last and thicker.
function MiniRace({ game, winnerIds }) {
  const W = 300;
  const H = 54;
  const byNumber = new Map(game.rounds.map((r) => [r.roundNumber, r]));
  const lines = game.players.map((p) => {
    let total = 0;
    const pts = [0];
    for (let r = 1; r <= TOTAL_ROUNDS; r += 1) {
      if (!byNumber.has(r)) break;
      total += byNumber.get(r).scores?.[p.id]?.score ?? 0;
      pts.push(total);
    }
    return { p, pts, won: winnerIds.includes(p.id) };
  });
  const max = Math.max(10, ...lines.flatMap((l) => l.pts));
  const x = (i) => 2 + (i / TOTAL_ROUNDS) * (W - 4);
  const y = (v) => H - 3 - (v / max) * (H - 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
      {[...lines].sort((a, b) => a.won - b.won).map(({ p, pts, won }) => (
        <polyline
          key={p.id}
          points={pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke={won ? 'var(--color-gold)' : `var(--color-${suitForName(p.name).key})`}
          strokeWidth={won ? 2.5 : 1.5}
          strokeOpacity={won ? 1 : 0.6}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// The date as a small pearl playing card: day of month as the rank.
function DateCard({ ts }) {
  const d = ts?.toDate ? ts.toDate() : null;
  return (
    <span className="record-card flex h-[4.2rem] w-[3.1rem] shrink-0 flex-col items-center justify-center rounded-lg bg-pearl leading-none">
      <span className="text-[10px] font-bold text-heart">{d ? d.toLocaleDateString(undefined, { month: 'short' }) : ''}</span>
      <span className="font-display text-2xl font-bold text-ink">{d ? d.getDate() : '?'}</span>
      <span className="text-[10px] text-muted">{d ? d.toLocaleDateString(undefined, { weekday: 'short' }) : ''}</span>
    </span>
  );
}

function GameCard({ game, onDelete, highlight }) {
  const { ranked, winners, margin } = summarizeGame(game);
  const complete = game.status === 'complete';
  const maxTotal = Math.max(1, ...ranked.map((r) => r.total));
  const winnerIds = complete ? winners.map((w) => w.player.id) : [];
  const winnerNames = winners.map((w) => w.player.name);

  return (
    <article className="card-elevated animate-record-in relative rounded-3xl bg-parchment-panel p-4 dark:bg-ink-panel">
      <button
        type="button"
        onClick={() => onDelete(game.id)}
        aria-label="Delete game"
        className="press absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-heart/10 hover:text-heart dark:text-muted-dark"
      >
        <Trash2 size={15} />
      </button>

      <NavLink to={complete ? `/history/${game.id}` : `/play/${game.id}`} viewTransition className="block">
        <div className="flex items-center gap-3 pr-8">
          <DateCard ts={game.createdAt} />
          {complete ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative shrink-0">
                <Crown size={16} fill="currentColor" className="absolute -top-3 left-1/2 -translate-x-1/2 text-gold" />
                <Avatar name={winnerNames[0]} sizeClass="h-11 w-11 text-base rounded-full ring-2 ring-gold" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-bold text-ink dark:text-cream">
                  {winnerNames.length > 1 ? `${winnerNames.join(' & ')} tied` : `${winnerNames[0]} won`}
                </p>
                <p className="text-sm text-muted dark:text-muted-dark">
                  {margin !== null ? `by ${margin} ${margin === 1 ? 'point' : 'points'}` : 'shared crown'}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-ink dark:text-cream">Still being played</p>
              <p className="text-sm text-muted dark:text-muted-dark">
                Round {game.currentRound} of {TOTAL_ROUNDS}
              </p>
            </div>
          )}
        </div>

        <ol className="mt-4 space-y-1.5">
          {ranked.map((r) => {
            const isWinner = winnerIds.includes(r.player.id);
            const dim = highlight && playerKey(r.player.name) !== highlight;
            return (
              <li key={r.player.id} className={`flex items-center gap-2 text-sm ${dim ? 'opacity-45' : ''}`}>
                <span className="w-4 shrink-0 text-center font-bold text-muted dark:text-muted-dark">{r.place}</span>
                <span className="w-16 shrink-0 truncate font-semibold text-ink dark:text-cream">{r.player.name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted/10 dark:bg-muted-dark/10">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (r.total / maxTotal) * 100)}%`,
                      background: isWinner ? 'var(--color-gold)' : `var(--color-${suitForName(r.player.name).key})`,
                      opacity: isWinner ? 1 : 0.7,
                    }}
                  />
                </span>
                <span className={`w-9 shrink-0 text-right font-bold tabular-nums ${isWinner ? 'text-gold-deep dark:text-gold' : 'text-ink dark:text-cream'}`}>
                  {r.total}
                </span>
              </li>
            );
          })}
        </ol>

        {game.rounds.length > 1 && (
          <div className="mt-3">
            <MiniRace game={game} winnerIds={winnerIds} />
          </div>
        )}

        {!complete && (
          <span className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gold py-2.5 font-bold text-ink">
            <Play size={15} fill="currentColor" />
            Continue game
          </span>
        )}
      </NavLink>
    </article>
  );
}

export default function History() {
  const [games, setGames] = useState(undefined);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  async function handleDelete() {
    await deleteGame(deletingId);
    setGames((prev) => prev.filter((g) => g.id !== deletingId));
    setDeletingId(null);
  }

  if (error) return <div className="p-4 font-bold text-heart">Couldn't load history: {error}</div>;
  if (games === undefined) return <div className="p-4 font-bold text-muted dark:text-muted-dark">Loading…</div>;
  if (games.length === 0) return <EmptyState title="No games yet" message="Start a game on the Play tab and it lands here." />;

  // Players ordered by how often they play, for the filter chips.
  const counts = new Map();
  games.forEach((g) =>
    g.players.forEach((p) => {
      const k = playerKey(p.name);
      counts.set(k, { name: p.name, n: (counts.get(k)?.n ?? 0) + 1 });
    }),
  );
  const chips = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);

  const visible = games.filter((g) => !player || g.players.some((p) => playerKey(p.name) === player));
  const unfinished = visible.filter((g) => g.status !== 'complete');
  const finished = visible.filter((g) => g.status === 'complete');
  const months = [];
  for (const g of finished) {
    const label = formatDate(g.createdAt, { month: 'long', year: 'numeric' }) || 'Undated';
    if (months[months.length - 1]?.label !== label) months.push({ label, games: [] });
    months[months.length - 1].games.push(g);
  }
  const oldest = [...games].sort((a, b) => timestampMs(a.createdAt) - timestampMs(b.createdAt))[0];
  const playerName = player ? counts.get(player).name : null;
  const playerWins = player
    ? finished.filter((g) => summarizeGame(g).winners.some((w) => playerKey(w.player.name) === player)).length
    : 0;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header>
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl dark:text-cream">History</h1>
        <p className="mt-2 text-muted dark:text-muted-dark">
          {player
            ? `${playerName} won ${playerWins} of ${finished.length} finished ${finished.length === 1 ? 'game' : 'games'}.`
            : `${games.length} ${games.length === 1 ? 'game' : 'games'} since ${formatDate(oldest.createdAt)}.`}
        </p>
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button
            type="button"
            onClick={() => setPlayer(null)}
            className={`press shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${!player ? 'bg-gold text-ink' : 'bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream'}`}
          >
            Everyone
          </button>
          {chips.map(([key, { name, n }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlayer(player === key ? null : key)}
              aria-pressed={player === key}
              className={`press flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold ${player === key ? 'bg-gold text-ink' : 'bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream'}`}
            >
              <Avatar name={name} sizeClass="h-7 w-7 text-[11px]" />
              {name}
              <span className="text-xs opacity-60">{n}</span>
            </button>
          ))}
        </div>
      </header>

      {unfinished.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl font-bold text-ink dark:text-cream">Unfinished</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {unfinished.map((g) => (
              <GameCard key={g.id} game={g} onDelete={setDeletingId} highlight={player} />
            ))}
          </div>
        </section>
      )}

      {months.map((m) => (
        <section key={m.label}>
          <h2 className="mb-3 flex items-baseline gap-2 font-display text-2xl font-bold text-ink dark:text-cream">
            {m.label}
            <span className="font-sans text-sm font-normal text-muted dark:text-muted-dark">
              {m.games.length} {m.games.length === 1 ? 'game' : 'games'}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {m.games.map((g) => (
              <GameCard key={g.id} game={g} onDelete={setDeletingId} highlight={player} />
            ))}
          </div>
        </section>
      ))}

      {visible.length === 0 && <p className="text-muted dark:text-muted-dark">No games with {playerName} yet.</p>}

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete this game?"
        message="This permanently removes the game and its scores from History and Stats."
        confirmLabel="Delete"
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
