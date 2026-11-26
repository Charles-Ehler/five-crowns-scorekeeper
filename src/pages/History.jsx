import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, Play } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import DateCard from '../components/DateCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { TOTAL_ROUNDS } from '../lib/fiveCrowns.js';
import { listGames } from '../lib/games.js';
import { formatDate, summarizeGame, timestampMs } from '../lib/gameSummary.js';
import { playerKey } from '../lib/stats.js';
import { colorVar, onColor, seatColors } from '../lib/suits.js';

// The game's whole race in a thumbnail: cumulative score per player across
// the 11 rounds. The winner's line is drawn last and thicker.
function MiniRace({ game, winnerIds, colors }) {
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
          stroke={colorVar(colors[p.id])}
          strokeWidth={won ? 2.5 : 1.5}
          strokeOpacity={won ? 1 : 0.55}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function GameCard({ game, highlight }) {
  const { ranked, winners, margin } = summarizeGame(game);
  const complete = game.status === 'complete';
  const maxTotal = Math.max(1, ...ranked.map((r) => r.total));
  const winnerIds = complete ? winners.map((w) => w.player.id) : [];
  const winnerNames = winners.map((w) => w.player.name);
  const colors = seatColors(game.players);
  // The card's top band is a solid block in the winner's seat color.
  const band = complete ? colors[winners[0].player.id] : null;

  return (
    <article className="animate-record-in relative overflow-hidden rounded-3xl bg-surface">
      <NavLink to={complete ? `/history/${game.id}` : `/play/${game.id}`} viewTransition className="block pb-4">
        <div
          className={`flex items-center gap-3 p-4 ${band ? '' : 'bg-surface-sunk'}`}
          style={band ? { background: colorVar(band), color: onColor(band) } : undefined}
        >
          <DateCard ts={game.createdAt} />
          {complete ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative shrink-0">
                <Crown size={18} fill="currentColor" className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-accent" />
                <Avatar name={winnerNames[0]} color={band} sizeClass="h-12 w-12 text-base rounded-full ring-2 ring-white/70" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl font-bold">
                  {winnerNames.length > 1 ? `${winnerNames.join(' & ')} tied` : `${winnerNames[0]} won`}
                </p>
                <p className="text-sm font-medium opacity-85">
                  {margin !== null ? `by ${margin} ${margin === 1 ? 'point' : 'points'}` : 'shared crown'}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-fg">Still being played</p>
              <p className="text-sm text-fg-soft">
                Round {game.currentRound} of {TOTAL_ROUNDS}
              </p>
            </div>
          )}
        </div>

        <ol className="space-y-1.5 px-4 pt-4">
          {ranked.map((r) => {
            const isWinner = winnerIds.includes(r.player.id);
            const dim = highlight && playerKey(r.player.name) !== highlight;
            return (
              <li key={r.player.id} className={`flex items-center gap-2 text-sm ${dim ? 'opacity-45' : ''}`}>
                <span className="w-4 shrink-0 text-center font-bold text-fg-soft">{r.place}</span>
                <span className="w-16 shrink-0 truncate font-semibold text-fg">{r.player.name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunk">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (r.total / maxTotal) * 100)}%`,
                      background: colorVar(colors[r.player.id]),
                    }}
                  />
                </span>
                <span className={`w-9 shrink-0 text-right font-display text-base font-bold tabular-nums ${isWinner ? 'text-fg' : 'text-fg-soft'}`}>
                  {r.total}
                </span>
              </li>
            );
          })}
        </ol>

        {game.rounds.length > 1 && (
          <div className="mt-3 px-4">
            <MiniRace game={game} winnerIds={winnerIds} colors={colors} />
          </div>
        )}

        {!complete && (
          <span className="mx-4 mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-fg py-2.5 font-bold text-canvas">
            <Play size={15} fill="currentColor" />
            Continue game
          </span>
        )}
      </NavLink>
      {/* The live screen has no delete, so unfinished games need a way to the
          game page (where Delete lives) for games started by mistake. */}
      {!complete && (
        <NavLink to={`/history/${game.id}`} viewTransition className="-mt-1 block pb-3 text-center text-sm font-semibold text-fg-soft underline-offset-2 hover:underline">
          Details or delete
        </NavLink>
      )}
    </article>
  );
}

export default function History() {
  const [games, setGames] = useState(undefined);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="p-4 font-bold text-heart">Couldn't load history: {error}</div>;
  if (games === undefined) return <Loading />;
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
        <h1 className="font-display text-4xl font-bold text-fg md:text-5xl">History</h1>
        <p className="mt-2 text-fg-soft">
          {player
            ? `${playerName} won ${playerWins} of ${finished.length} finished ${finished.length === 1 ? 'game' : 'games'}.`
            : `${games.length} ${games.length === 1 ? 'game' : 'games'} since ${formatDate(oldest.createdAt)}.`}
        </p>
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button
            type="button"
            onClick={() => setPlayer(null)}
            className={`press shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${!player ? 'bg-fg text-canvas' : 'bg-surface-sunk text-fg'}`}
          >
            Everyone
          </button>
          {chips.map(([key, { name, n }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlayer(player === key ? null : key)}
              aria-pressed={player === key}
              className={`press flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold ${player === key ? 'bg-fg text-canvas' : 'bg-surface-sunk text-fg'}`}
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
          <h2 className="mb-3 font-display text-2xl font-bold text-fg">Unfinished</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {unfinished.map((g) => (
              <GameCard key={g.id} game={g} highlight={player} />
            ))}
          </div>
        </section>
      )}

      {months.map((m) => (
        <section key={m.label}>
          <h2 className="mb-3 flex items-baseline gap-2 font-display text-2xl font-bold text-fg">
            {m.label}
            <span className="font-sans text-sm font-normal text-fg-soft">
              {m.games.length} {m.games.length === 1 ? 'game' : 'games'}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {m.games.map((g) => (
              <GameCard key={g.id} game={g} highlight={player} />
            ))}
          </div>
        </section>
      ))}

      {visible.length === 0 && <p className="text-fg-soft">No games with {playerName} yet.</p>}
    </div>
  );
}
