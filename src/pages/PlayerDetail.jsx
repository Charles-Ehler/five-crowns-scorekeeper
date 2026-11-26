import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Crown, Flame, Loader2, X } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import PhotoCropModal from '../components/PhotoCropModal.jsx';
import RecordCard from '../components/RecordCard.jsx';
import TrendChart from '../components/TrendChart.jsx';
import { usePlayerPhoto } from '../contexts/PlayerPhotosContext.jsx';
import { wildRankWordForRound } from '../lib/fiveCrowns.js';
import { formatDate, outRates } from '../lib/gameSummary.js';
import { getCroppedImageBlob } from '../lib/imageCrop.js';
import { listGames } from '../lib/games.js';
import { removePlayerPhoto, uploadPlayerPhoto } from '../lib/photos.js';
import { computeStats, playerKey } from '../lib/stats.js';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function Section({ title, hint, children }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink dark:text-cream">{title}</h2>
        {hint && <p className="text-sm text-muted dark:text-muted-dark">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-4">
      <span className="font-display text-3xl font-bold tabular-nums text-ink md:text-4xl dark:text-cream">{value}</span>
      <span className="text-xs font-semibold text-muted dark:text-muted-dark">{label}</span>
    </div>
  );
}

export default function PlayerDetail() {
  const { playerName } = useParams();
  const [games, setGames] = useState(undefined);
  const [error, setError] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const fileInputRef = useRef(null);
  const decodedName = decodeURIComponent(playerName);
  const photoUrl = usePlayerPhoto(decodedName);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  const data = useMemo(() => {
    if (!games) return null;
    const stats = computeStats(games);
    const outs = outRates(games.filter((g) => g.status === 'complete')).get(playerKey(decodedName));
    return { stats, outs };
  }, [games, decodedName]);

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;
    setPhotoError(null);
    setCropImageSrc(URL.createObjectURL(file));
  }

  function handleCropCancel() {
    URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
  }

  async function handleCropConfirm(croppedAreaPixels) {
    const src = cropImageSrc;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const croppedBlob = await getCroppedImageBlob(src, croppedAreaPixels);
      await uploadPlayerPhoto(decodedName, croppedBlob);
    } catch (err) {
      setPhotoError(err.message ?? 'Failed to upload photo');
    } finally {
      URL.revokeObjectURL(src);
      setCropImageSrc(null);
      setPhotoBusy(false);
    }
  }

  async function handlePhotoRemove() {
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      await removePlayerPhoto(decodedName);
    } catch (err) {
      setPhotoError(err.message ?? 'Failed to remove photo');
    } finally {
      setPhotoBusy(false);
    }
  }

  const backLink = (
    <NavLink to="/stats" viewTransition className="inline-flex items-center gap-1 text-sm font-bold text-ink dark:text-cream">
      <ArrowLeft size={16} />
      Back to stats
    </NavLink>
  );

  if (error) return <div className="p-4 font-bold text-heart">Couldn't load stats: {error}</div>;
  if (!data) return <Loading />;

  const { stats, outs } = data;
  const player = stats.players.find((p) => playerKey(p.name) === playerKey(decodedName));

  if (!player) {
    return (
      <div className="p-4">
        {backLink}
        <EmptyState title="Player not found" message={`No finished games for "${decodedName}" yet.`} />
      </div>
    );
  }

  const winRate = player.gamesPlayed ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;
  const outRate = outs?.rounds ? Math.round((outs.out / outs.rounds) * 100) : 0;
  const placementCounts = [];
  player.history.forEach((g) => {
    placementCounts[g.placement - 1] = (placementCounts[g.placement - 1] ?? 0) + 1;
  });
  const maxPlacementCount = Math.max(1, ...placementCounts.map((c) => c ?? 0));

  // Every opponent they've shared a finished game with, busiest rivalry first.
  const rivals = stats.pairs
    .filter((pair) => pair.names.some((n) => playerKey(n) === playerKey(player.name)))
    .map((pair) => {
      const opponent = pair.names.find((n) => playerKey(n) !== playerKey(player.name));
      const mine = pair.wins.find((w) => playerKey(w.name) === playerKey(player.name))?.wins ?? 0;
      const theirs = pair.wins.find((w) => playerKey(w.name) === playerKey(opponent))?.wins ?? 0;
      return { opponent, mine, theirs, games: pair.games };
    })
    .sort((a, b) => b.games - a.games || b.theirs - b.mine - (a.theirs - a.mine));
  const toughest = [...rivals].filter((r) => r.theirs > r.mine).sort((a, b) => b.theirs - b.mine - (a.theirs - a.mine))[0];

  const records = [];
  if (player.bestGame) {
    records.push({ label: 'Best game', value: player.bestGame.total, unit: 'points', gameId: player.bestGame.gameId, createdAt: player.bestGame.createdAt, suit: 'club' });
  }
  if (player.worstGame && player.gamesPlayed > 1) {
    records.push({ label: 'Roughest game', value: player.worstGame.total, unit: 'points', gameId: player.worstGame.gameId, createdAt: player.worstGame.createdAt, suit: 'spade' });
  }
  if (player.worstRound) {
    records.push({ label: 'Roughest round', value: player.worstRound.score, unit: 'points in one hand', note: wildRankWordForRound(player.worstRound.roundNumber), gameId: player.worstRound.gameId, createdAt: player.worstRound.createdAt, suit: 'heart' });
  }
  if (outs?.out) {
    records.push({ label: 'Went out', value: outs.out, unit: outs.out === 1 ? 'round' : 'rounds', note: `${outRate}% of rounds played`, suit: 'diamond' });
  }
  if (player.longestStreak >= 2) {
    records.push({ label: 'Longest streak', value: player.longestStreak, unit: 'wins in a row', suit: 'star' });
  }
  if (player.improvement !== null && player.improvement > 0) {
    records.push({ label: 'On the rise', value: player.improvement.toFixed(1), unit: 'points better lately', note: 'Last 3 games vs overall', suit: 'club' });
  }

  const summary =
    player.wins === 0
      ? `Still chasing a first crown after ${player.gamesPlayed} ${player.gamesPlayed === 1 ? 'game' : 'games'}.`
      : `${player.wins} ${player.wins === 1 ? 'crown' : 'crowns'} in ${player.gamesPlayed} ${player.gamesPlayed === 1 ? 'game' : 'games'}.`;

  return (
    <div className="space-y-10 p-4 md:p-6">
      <div className="space-y-6">
        {backLink}

        <header className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            {player.wins > 0 && (
              <Crown size={34} fill="currentColor" className="animate-crown-drop absolute -top-8 left-1/2 z-10 text-gold" />
            )}
            <Avatar name={player.name} sizeClass="h-28 w-28 text-5xl rounded-full ring-4 ring-gold/60" />
            {photoBusy ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-deep/50">
                <Loader2 size={24} className="animate-spin text-cream" />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={photoUrl ? 'Change photo' : 'Add photo'}
                className="press absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink ring-4 ring-parchment dark:ring-ink-deep"
              >
                <Camera size={16} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-5xl font-bold leading-none text-ink dark:text-cream">{player.name}</h1>
            <p className="mt-2 text-lg text-muted dark:text-muted-dark">{summary}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {player.currentStreak >= 2 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-heart/15 px-3 py-1 text-sm font-bold text-heart">
                  <Flame size={14} fill="currentColor" />
                  {player.currentStreak} wins in a row
                </span>
              )}
              {photoUrl && !photoBusy && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="press inline-flex items-center gap-1 rounded-full bg-muted/10 px-3 py-1 text-sm font-semibold text-muted dark:bg-muted-dark/10 dark:text-muted-dark"
                >
                  <X size={13} />
                  Remove photo
                </button>
              )}
            </div>
            {photoError && <p className="mt-2 text-sm font-bold text-heart">{photoError}</p>}
          </div>
        </header>

        <div className="card-elevated grid grid-cols-2 divide-parchment-line rounded-3xl bg-parchment-panel sm:grid-cols-4 sm:divide-x dark:divide-ink-line dark:bg-ink-panel">
          <Stat value={player.wins} label={player.wins === 1 ? 'Crown' : 'Crowns'} />
          <Stat value={`${winRate}%`} label="Win rate" />
          <Stat value={player.average.toFixed(1)} label="Avg score" />
          <Stat value={`${outRate}%`} label="Goes out" />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-6">
        {player.history.length >= 2 && (
          <Section title="Score trend" hint="Final totals, oldest to newest. Tap a dot to see that game.">
            <TrendChart name={player.name} history={player.history} average={player.average} />
          </Section>
        )}
        {placementCounts.length > 1 && (
          <Section title="Where they finish" hint={`Out of ${player.gamesPlayed} finished games.`}>
            <div className="card-elevated flex h-[13.5rem] items-end gap-3 rounded-2xl bg-parchment-panel p-4 dark:bg-ink-panel">
              {Array.from(placementCounts, (c) => c ?? 0).map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-display text-xl font-bold tabular-nums text-ink dark:text-cream">{count}</span>
                  <div
                    className={`w-full rounded-t-lg ${i === 0 ? 'bg-gold' : 'bg-muted/25 dark:bg-muted-dark/25'}`}
                    style={{ height: `${Math.max(6, (count / maxPlacementCount) * 120)}px` }}
                  />
                  <span className="text-xs font-semibold text-muted dark:text-muted-dark">{ordinal(i + 1)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {rivals.length > 0 && (
        <Section
          title="Rivals"
          hint={toughest ? `Toughest opponent: ${toughest.opponent}, who leads ${toughest.theirs} to ${toughest.mine}.` : 'Wins against each opponent in games they shared.'}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {rivals.map((r) => {
              const tone = r.mine > r.theirs ? 'text-club' : r.mine < r.theirs ? 'text-heart' : 'text-muted dark:text-muted-dark';
              const verdict = r.mine > r.theirs ? 'Leads' : r.mine < r.theirs ? 'Trails' : 'Even';
              return (
                <li key={r.opponent}>
                  <NavLink
                    to={`/stats/${encodeURIComponent(r.opponent)}`}
                    viewTransition
                    className="card-elevated press flex items-center gap-3 rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel"
                  >
                    <Avatar name={r.opponent} sizeClass="h-10 w-10 text-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink dark:text-cream">{r.opponent}</span>
                      <span className="text-xs text-muted dark:text-muted-dark">
                        {r.games} {r.games === 1 ? 'game' : 'games'} together
                      </span>
                    </span>
                    <span className="text-right">
                      <span className={`block font-display text-2xl font-bold tabular-nums ${tone}`}>
                        {r.mine}–{r.theirs}
                      </span>
                      <span className={`text-xs font-semibold ${tone}`}>{verdict}</span>
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {records.length > 0 && (
        <Section title="Personal records" hint="Tap a card to open the game it happened in.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {records.map((r, i) => (
              <RecordCard key={r.label} index={i} who={player.name} {...r} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Game log" hint="Newest first. Tap a game to open it.">
        <ul className="card-elevated divide-y divide-parchment-line rounded-2xl bg-parchment-panel dark:divide-ink-line dark:bg-ink-panel">
          {player.history.map((g) => (
            <li key={g.gameId}>
              <NavLink to={`/history/${g.gameId}`} viewTransition className="press flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold ${g.won ? 'bg-gold text-ink' : 'bg-muted/10 text-muted dark:bg-muted-dark/10 dark:text-muted-dark'}`}
                  title={g.won ? 'Won' : `Finished ${ordinal(g.placement)}`}
                >
                  {g.won ? <Crown size={16} fill="currentColor" /> : ordinal(g.placement)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink dark:text-cream">
                    With {g.opponentNames.join(', ') || 'nobody'}
                  </span>
                  <span className="text-xs text-muted dark:text-muted-dark">{formatDate(g.createdAt, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
                <span className={`font-display text-2xl font-bold tabular-nums ${g.won ? 'text-gold-deep dark:text-gold' : 'text-ink dark:text-cream'}`}>
                  {g.total}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Section>

      {cropImageSrc && <PhotoCropModal imageSrc={cropImageSrc} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />}
    </div>
  );
}
