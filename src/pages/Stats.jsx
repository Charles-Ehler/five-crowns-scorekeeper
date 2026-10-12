import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, Flame } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import CrownTally from '../components/CrownTally.jsx';
import EmptyState from '../components/EmptyState.jsx';
import HeadToHead from '../components/HeadToHead.jsx';
import PlayerTable from '../components/PlayerTable.jsx';
import RecordCard from '../components/RecordCard.jsx';
import SeasonTimeline from '../components/SeasonTimeline.jsx';
import { wildRankWordForRound } from '../lib/fiveCrowns.js';
import { listGames } from '../lib/games.js';
import { formatDate, summarizeGame, timestampMs } from '../lib/gameSummary.js';
import { formatRelativeDate } from '../lib/relativeDate.js';
import { computeStats, playerKey } from '../lib/stats.js';

const SCOPE_KEY = 'fiveCrowns_statsScope';
const REGULAR_MIN_GAMES = 2;

function readScope() {
  try {
    return localStorage.getItem(SCOPE_KEY) === 'everyone' ? 'everyone' : 'regulars';
  } catch {
    return 'regulars';
  }
}

function listNames(names) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function Section({ title, hint, children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink dark:text-cream">{title}</h2>
        {hint && <p className="text-sm text-muted dark:text-muted-dark">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

// Times each player went out, across finished games. stats.js only exposes a
// rate once someone has a full game of rounds; the table wants it for all.
function outRates(completed) {
  const counts = new Map();
  for (const game of completed) {
    for (const p of game.players) {
      const c = counts.get(playerKey(p.name)) ?? { out: 0, rounds: 0 };
      for (const round of game.rounds) {
        const entry = round.scores[p.id];
        if (!entry) continue;
        c.rounds += 1;
        if (entry.wentOut) c.out += 1;
      }
      counts.set(playerKey(p.name), c);
    }
  }
  return counts;
}

function buildRecords(stats, completed, outs) {
  const records = [];
  const summaries = completed.map((g) => ({ game: g, ...summarizeGame(g) })).filter((s) => s.margin !== null);
  if (stats.bestGame) {
    records.push({ label: 'Best game', value: stats.bestGame.total, unit: 'points', who: stats.bestGame.playerName, gameId: stats.bestGame.gameId, createdAt: stats.bestGame.createdAt, suit: 'club' });
  }
  const blowout = [...summaries].sort((a, b) => b.margin - a.margin)[0];
  if (blowout) {
    records.push({ label: 'Biggest win', value: blowout.margin, unit: 'points ahead', who: listNames(blowout.winners.map((w) => w.player.name)), gameId: blowout.game.id, createdAt: blowout.game.createdAt, suit: 'star' });
  }
  const closest = [...summaries].sort((a, b) => a.margin - b.margin)[0];
  if (closest && closest !== blowout) {
    records.push({ label: 'Closest finish', value: closest.margin, unit: closest.margin === 1 ? 'point in it' : 'points in it', who: listNames(closest.winners.map((w) => w.player.name)), gameId: closest.game.id, createdAt: closest.game.createdAt, suit: 'diamond' });
  }
  const streaker = [...stats.players].sort((a, b) => b.longestStreak - a.longestStreak)[0];
  if (streaker?.longestStreak >= 2) {
    records.push({ label: 'Longest streak', value: streaker.longestStreak, unit: 'wins in a row', who: streaker.name, suit: 'heart' });
  }
  const closer = [...outs.entries()].sort((a, b) => b[1].out - a[1].out)[0];
  if (closer && closer[1].out > 0) {
    const name = stats.players.find((p) => playerKey(p.name) === closer[0])?.name ?? closer[0];
    records.push({ label: 'Goes out most', value: closer[1].out, unit: 'rounds gone out', who: name, note: `${Math.round((closer[1].out / closer[1].rounds) * 100)}% of rounds`, suit: 'club' });
  }
  if (stats.bestComeback) {
    records.push({ label: 'Comeback', value: stats.bestComeback.comebackSize, unit: 'points clawed back', who: stats.bestComeback.playerName, note: `From ${wildRankWordForRound(stats.bestComeback.roundNumber)}`, gameId: stats.bestComeback.gameId, createdAt: stats.bestComeback.createdAt, suit: 'diamond' });
  }
  if (stats.worstRound) {
    records.push({ label: 'Roughest round', value: stats.worstRound.score, unit: 'points in one hand', who: stats.worstRound.playerName, note: wildRankWordForRound(stats.worstRound.roundNumber), gameId: stats.worstRound.gameId, createdAt: stats.worstRound.createdAt, suit: 'spade' });
  }
  if (stats.worstGame) {
    records.push({ label: 'Roughest game', value: stats.worstGame.total, unit: 'points', who: stats.worstGame.playerName, gameId: stats.worstGame.gameId, createdAt: stats.worstGame.createdAt, suit: 'spade' });
  }
  return records;
}

export default function Stats() {
  const [games, setGames] = useState(undefined);
  const [error, setError] = useState(null);
  const [scope, setScope] = useState(readScope);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  const data = useMemo(() => {
    if (!games) return null;
    const completed = games.filter((g) => g.status === 'complete').sort((a, b) => timestampMs(a.createdAt) - timestampMs(b.createdAt));
    const stats = computeStats(games);
    const outs = outRates(completed);
    const players = stats.players.map((p) => {
      const o = outs.get(playerKey(p.name));
      return { ...p, outRate: o?.rounds ? o.out / o.rounds : 0 };
    });
    return { completed, stats, players, records: buildRecords(stats, completed, outs) };
  }, [games]);

  function changeScope(next) {
    setScope(next);
    setFocus(null);
    try {
      localStorage.setItem(SCOPE_KEY, next);
    } catch {
      // Private mode: the choice just isn't remembered.
    }
  }

  if (error) return <div className="p-4 font-bold text-heart">Couldn't load stats: {error}</div>;
  if (!data) return <div className="p-4 font-bold text-muted dark:text-muted-dark">Loading…</div>;
  if (data.completed.length === 0) return <EmptyState title="No stats yet" message="Finish a game and the crowns start counting here." />;

  const { completed, stats, players, records } = data;
  const regulars = players.filter((p) => p.gamesPlayed >= REGULAR_MIN_GAMES);
  const shown = scope === 'regulars' && regulars.length >= 2 ? regulars : players;
  const hiddenCount = players.length - shown.length;
  const shownKeys = new Set(shown.map((p) => playerKey(p.name)));

  const topWins = Math.max(...players.map((p) => p.wins));
  const leaders = players.filter((p) => p.wins === topWins);
  const headline =
    leaders.length === 1
      ? `${leaders[0].name} holds the most crowns`
      : `${listNames(leaders.map((p) => p.name))} share the lead`;

  const last = completed[completed.length - 1];
  const lastSummary = summarizeGame(last);
  const champs = lastSummary.winners.map((w) => w.player.name);
  const champStat = players.find((p) => playerKey(p.name) === playerKey(champs[0]));

  return (
    <div className="space-y-10 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-5xl dark:text-cream">{headline}</h1>
          <p className="mt-2 text-muted dark:text-muted-dark">
            {stats.totalGames} {stats.totalGames === 1 ? 'game' : 'games'} played since {formatDate(completed[0].createdAt)}. Last game {formatRelativeDate(last.createdAt)}.
          </p>
        </div>
        <div className="flex rounded-full bg-muted/10 p-1 text-sm font-semibold dark:bg-muted-dark/10" role="group" aria-label="Which players to show">
          {['regulars', 'everyone'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeScope(s)}
              aria-pressed={scope === s}
              className={`press rounded-full px-4 py-1.5 ${scope === s ? 'bg-gold text-ink' : 'text-muted dark:text-muted-dark'}`}
            >
              {s === 'regulars' ? 'Regulars' : 'Everyone'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-stretch">
        <section className="card-elevated rounded-3xl bg-parchment-panel p-4 dark:bg-ink-panel">
          <h2 className="mb-1 px-2 font-display text-2xl font-bold text-ink dark:text-cream">Crowns won</h2>
          <p className="mb-3 px-2 text-sm text-muted dark:text-muted-dark">
            Tap a player to follow them through the page.
            {hiddenCount > 0 && ` ${hiddenCount} one-time ${hiddenCount === 1 ? 'player is' : 'players are'} hidden.`}
          </p>
          <CrownTally players={shown} focus={focus} onFocus={setFocus} />
        </section>

        <NavLink
          to={`/history/${last.id}`}
          viewTransition
          className="press hero-sheen relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-gold/40 bg-parchment-panel p-6 text-center dark:bg-ink-panel"
        >
          <p className="text-sm font-semibold text-gold-deep dark:text-gold">{champs.length > 1 ? 'Reigning champions' : 'Reigning champion'}</p>
          <div className="mt-8 flex justify-center gap-4">
            {champs.map((name, i) => (
              <span key={name} className="relative">
                <Crown
                  size={32}
                  fill="currentColor"
                  className="animate-crown-drop absolute -top-7 left-1/2 text-gold"
                  style={{ animationDelay: `${300 + i * 150}ms` }}
                />
                <Avatar name={name} sizeClass="h-24 w-24 text-4xl rounded-full ring-4 ring-gold" />
              </span>
            ))}
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-ink dark:text-cream">{listNames(champs)}</p>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            Won on {formatDate(last.createdAt, { weekday: 'long', month: 'short', day: 'numeric' })}
            {lastSummary.margin !== null && ` by ${lastSummary.margin} points`}
          </p>
          {champs.length === 1 && champStat?.currentStreak >= 2 && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-heart/15 px-3 py-1 text-sm font-bold text-heart">
              <Flame size={14} fill="currentColor" />
              {champStat.currentStreak} wins in a row
            </p>
          )}
        </NavLink>
      </div>

      <Section title="The table" hint="Tap a column to sort, tap a player to see their page. Gold marks the best in each column.">
        <PlayerTable players={shown} focus={focus} />
      </Section>

      <div className="grid gap-10 md:grid-cols-2 md:gap-6">
        <Section title="Head to head" hint="Row player's record against each opponent in games they shared.">
          <HeadToHead
            key={scope}
            players={shown}
            pairs={stats.pairs.filter((p) => p.names.every((n) => shownKeys.has(playerKey(n))))}
            focus={focus}
          />
        </Section>
        <Section title="Every game" hint="Final totals, best at the top. Gold rings are winners. Tap a game to open it.">
          <SeasonTimeline games={completed} focus={focus} />
        </Section>
      </div>

      <Section title="All-time records" hint="Tap a card to open the game it happened in.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {records.map((r, i) => (
            <RecordCard key={r.label} index={i} {...r} />
          ))}
        </div>
      </Section>
    </div>
  );
}
