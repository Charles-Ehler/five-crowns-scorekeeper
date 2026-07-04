import { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CloudRain,
  Flag,
  Flame,
  Gem,
  Loader2,
  Medal,
  Sparkles,
  Swords,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PhotoCropModal from '../components/PhotoCropModal.jsx';
import RivalryCard from '../components/RivalryCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { usePlayerPhoto } from '../contexts/PlayerPhotosContext.jsx';
import { getCroppedImageBlob } from '../lib/imageCrop.js';
import { listGames } from '../lib/games.js';
import { removePlayerPhoto, uploadPlayerPhoto } from '../lib/photos.js';
import { computeStats, playerKey } from '../lib/stats.js';

const ACCENT = {
  gold: { bg: 'bg-gold' },
  heart: { bg: 'bg-heart' },
  spade: { bg: 'bg-spade' },
  club: { bg: 'bg-club' },
  star: { bg: 'bg-star' },
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function GameContext({ gameId, createdAt, extra }) {
  return (
    <p className="flex items-center gap-1">
      {extra && <span>{extra}</span>}
      <NavLink to={`/history/${gameId}`} className="font-bold text-gold-deep dark:text-gold">
        View game
      </NavLink>
      {formatDate(createdAt) && <span>· {formatDate(createdAt)}</span>}
    </p>
  );
}

export default function PlayerDetail() {
  const { playerName } = useParams();
  const [stats, setStats] = useState(undefined);
  const [error, setError] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const fileInputRef = useRef(null);
  const decodedName = decodeURIComponent(playerName);
  const photoUrl = usePlayerPhoto(decodedName);

  useEffect(() => {
    listGames()
      .then((games) => setStats(computeStats(games)))
      .catch((err) => setError(err.message));
  }, []);

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

  if (error) {
    return <div className="p-4 font-bold text-heart">Couldn't load stats: {error}</div>;
  }

  if (stats === undefined) {
    return <div className="p-4 font-bold text-muted dark:text-muted-dark">Loading…</div>;
  }

  const player = stats.players.find((p) => playerKey(p.name) === playerKey(decodedName));

  if (!player) {
    return (
      <div className="p-4">
        <NavLink to="/stats" className="inline-flex items-center gap-1 text-sm font-bold text-ink dark:text-cream">
          <ArrowLeft size={16} />
          Back to stats
        </NavLink>
        <EmptyState title="Player not found" message={`No stats for "${decodedName}" — they may have been removed.`} />
      </div>
    );
  }

  const pairs = stats.pairs.filter((pair) => pair.names.some((n) => playerKey(n) === playerKey(player.name)));
  const winRate = player.gamesPlayed ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      <NavLink to="/stats" className="inline-flex items-center gap-1 text-sm font-bold text-ink dark:text-cream">
        <ArrowLeft size={16} />
        Back to stats
      </NavLink>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar name={player.name} sizeClass="h-16 w-16 text-2xl" />
          {photoBusy ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-deep/50">
              <Loader2 size={20} className="animate-spin text-cream" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={photoUrl ? 'Change photo' : 'Add photo'}
              className="press absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink ring-2 ring-parchment dark:ring-ink-deep"
            >
              <Camera size={13} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl text-ink dark:text-cream">{player.name}</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            {player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'} played
          </p>
          {photoUrl && !photoBusy && (
            <button
              type="button"
              onClick={handlePhotoRemove}
              className="mt-1 flex items-center gap-1 text-xs font-bold text-muted dark:text-muted-dark"
            >
              <X size={12} />
              Remove photo
            </button>
          )}
        </div>
      </div>
      {photoError && <p className="text-sm font-bold text-heart">{photoError}</p>}

      <div className="card-elevated grid grid-cols-3 divide-x divide-parchment-line rounded-2xl bg-parchment-panel dark:divide-ink-line dark:bg-ink-panel">
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="flex items-center gap-1 text-2xl font-extrabold tabular-nums text-ink dark:text-cream">
            <Trophy size={16} className="text-gold" />
            {player.wins}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Wins</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="text-2xl font-extrabold tabular-nums text-ink dark:text-cream">{winRate}%</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Win rate</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="text-2xl font-extrabold tabular-nums text-ink dark:text-cream">{player.average.toFixed(1)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Avg score</span>
        </div>
      </div>

      {(player.currentStreak >= 2 || player.longestStreak >= 2) && (
        <div className="flex gap-2.5">
          {player.currentStreak >= 2 && (
            <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-bold text-gold-deep dark:text-gold">
              <Zap size={14} />
              {player.currentStreak}-game streak
            </span>
          )}
          {player.longestStreak >= 2 && (
            <span className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-sm font-semibold text-muted dark:bg-muted-dark/10 dark:text-muted-dark">
              Best: {player.longestStreak} wins
            </span>
          )}
        </div>
      )}

      {player.nemesis && (
        <div className="card-elevated rounded-2xl bg-heart/10 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-heart">
            <Target size={14} />
            Nemesis
          </p>
          <p className="text-lg font-extrabold text-ink dark:text-cream">
            {player.nemesis.myWins}-{player.nemesis.theirWins}{' '}
            <span className="font-normal text-muted dark:text-muted-dark">vs</span>{' '}
            <NavLink to={`/stats/${encodeURIComponent(player.nemesis.name)}`} className="text-gold-deep underline decoration-2 underline-offset-2 dark:text-gold">
              {player.nemesis.name}
            </NavLink>
          </p>
        </div>
      )}

      {pairs.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ink dark:text-cream">
            <Swords size={18} />
            Head-to-head
          </h2>
          <div className="space-y-2.5">
            {pairs.map((pair) => (
              <RivalryCard key={pair.names.join('|')} pair={pair} />
            ))}
          </div>
        </section>
      )}

      {(player.bestRound || player.worstRound || player.bestGame || player.worstGame) && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ink dark:text-cream">
            <Trophy size={18} />
            Personal records
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {player.bestRound && (
              <StatCard
                icon={Gem}
                accent={ACCENT.club}
                label="Cleanest round"
                value={player.bestRound.score}
                context={
                  <GameContext
                    gameId={player.bestRound.gameId}
                    createdAt={player.bestRound.createdAt}
                    extra={`Round ${player.bestRound.roundNumber} ·`}
                  />
                }
              />
            )}
            {player.worstRound && (
              <StatCard
                icon={Flame}
                accent={ACCENT.heart}
                label="Rough round"
                value={player.worstRound.score}
                context={
                  <GameContext
                    gameId={player.worstRound.gameId}
                    createdAt={player.worstRound.createdAt}
                    extra={`Round ${player.worstRound.roundNumber} ·`}
                  />
                }
              />
            )}
            {player.bestGame && (
              <StatCard
                icon={Medal}
                accent={ACCENT.gold}
                label="Best game"
                value={player.bestGame.total}
                context={<GameContext gameId={player.bestGame.gameId} createdAt={player.bestGame.createdAt} />}
              />
            )}
            {player.worstGame && (
              <StatCard
                icon={CloudRain}
                accent={ACCENT.spade}
                label="Worst game"
                value={player.worstGame.total}
                context={<GameContext gameId={player.worstGame.gameId} createdAt={player.worstGame.createdAt} />}
              />
            )}
            {player.improvement !== null && player.improvement > 0 && (
              <StatCard
                icon={Sparkles}
                accent={ACCENT.star}
                label="Trending"
                value={player.improvement.toFixed(1)}
                unit="pts better"
                context={<p>Last 3 games vs. overall average</p>}
              />
            )}
            {player.wentOutRate !== null && (
              <StatCard
                icon={Flag}
                accent={ACCENT.club}
                label="Goes out"
                value={Math.round(player.wentOutRate * 100)}
                unit="% of rounds"
              />
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-xl text-ink dark:text-cream">Game history</h2>
        <ul className="space-y-2">
          {player.history.map((g) => (
            <li key={g.gameId}>
              <NavLink
                to={`/history/${g.gameId}`}
                className="card-elevated flex items-center justify-between rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink dark:text-cream">
                    vs {g.opponentNames.join(', ') || '—'}
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark">{formatDate(g.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      g.won ? 'bg-gold/20 text-gold-deep dark:text-gold' : 'text-muted dark:text-muted-dark',
                    ].join(' ')}
                  >
                    {g.won ? 'Won' : `#${g.placement}`}
                  </span>
                  <span className="text-lg font-extrabold tabular-nums text-ink dark:text-cream">{g.total}</span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </section>

      {cropImageSrc && (
        <PhotoCropModal imageSrc={cropImageSrc} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />
      )}
    </div>
  );
}
