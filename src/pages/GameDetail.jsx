import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, Pause, Play, Swords, Trash2 } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DateCard from '../components/DateCard.jsx';
import Loading from '../components/Loading.jsx';
import PlayerTotals from '../components/PlayerTotals.jsx';
import RaceChart from '../components/RaceChart.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import { TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { formatDate, summarizeGame } from '../lib/gameSummary.js';
import { deleteGame, subscribeToGame } from '../lib/games.js';

const REPLAY_STEP_MS = 900;

// Scrub or auto-play the game round by round: the race chart grows and the
// standings re-sort as each round lands. Pure view state, nothing is written.
function Replay({ game }) {
  const lastRound = game.rounds.length ? Math.max(...game.rounds.map((r) => r.roundNumber)) : 0;
  const [round, setRound] = useState(lastRound);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setRound((r) => {
        if (r >= lastRound) {
          setPlaying(false);
          return r;
        }
        return r + 1;
      });
    }, REPLAY_STEP_MS);
    return () => clearInterval(id);
  }, [playing, lastRound]);

  function togglePlay() {
    if (!playing && round >= lastRound) setRound(0);
    setPlaying((p) => !p);
  }

  const shownRounds = game.rounds.filter((r) => r.roundNumber <= round);

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
      <div className="card-elevated rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted dark:text-muted-dark">Replay</p>
          <p className="text-xs font-bold text-ink dark:text-cream">
            {round === 0 ? 'Before the deal' : `After ${wildRankWordForRound(round)}, round ${round}`}
          </p>
        </div>
        <RaceChart players={game.players} rounds={game.rounds} upToRound={round} />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause replay' : 'Play replay'}
            className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink shadow-md shadow-gold/30"
          >
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={lastRound}
            value={round}
            onChange={(e) => {
              setPlaying(false);
              setRound(Number(e.target.value));
            }}
            aria-label="Replay round"
            className="flex-1 accent-gold"
          />
        </div>
      </div>
      <PlayerTotals
        players={game.players}
        rounds={shownRounds}
        winnerIds={round === lastRound ? (game.winnerIds ?? []) : []}
        complete={game.status === 'complete' && round === lastRound}
      />
    </div>
  );
}

export default function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(undefined);
  const [error, setError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setGame(undefined);
    setError(null);
    return subscribeToGame(gameId, setGame, (err) => setError(err.message));
  }, [gameId]);

  if (error) {
    return <div className="p-4 font-bold text-heart">Couldn't load this game: {error}</div>;
  }

  if (game === undefined) return <Loading />;

  if (game === null) {
    return (
      <div className="p-4 text-center">
        <p className="mt-8 text-muted dark:text-muted-dark">This game no longer exists.</p>
        <NavLink to="/history" className="mt-3 inline-block font-bold text-gold-deep dark:text-gold">
          Back to history
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';
  const { winners, margin } = summarizeGame(game);
  const winnerNames = winners.map((w) => w.player.name);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <NavLink to="/history" viewTransition className="inline-flex items-center gap-1 text-sm font-bold text-ink dark:text-cream">
        <ArrowLeft size={16} />
        Back to history
      </NavLink>
      <header className="flex items-center gap-4 pb-2">
        <DateCard ts={game.createdAt} size="lg" />
        {isComplete ? (
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative hidden shrink-0 sm:block">
              <Crown size={22} fill="currentColor" className="absolute -top-4 left-1/2 -translate-x-1/2 text-gold" />
              <Avatar name={winnerNames[0]} sizeClass="h-16 w-16 text-2xl rounded-full ring-2 ring-gold" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-bold leading-tight text-ink dark:text-cream">
                {winnerNames.length > 1 ? `${winnerNames.join(' & ')} tied` : `${winnerNames[0]} won`}
              </h1>
              <p className="text-muted dark:text-muted-dark">
                {margin !== null ? `By ${margin} ${margin === 1 ? 'point' : 'points'}` : 'A shared crown'}, {formatDate(game.createdAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold leading-tight text-ink dark:text-cream">Still being played</h1>
            <p className="text-muted dark:text-muted-dark">
              Round {game.currentRound} of {TOTAL_ROUNDS}, {wildRankWordForRound(game.currentRound)} are wild.
            </p>
          </div>
        )}
      </header>
      {!isComplete && (
        <NavLink
          to={`/play/${game.id}`}
          className="press flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gold py-3 font-display text-base text-ink shadow-lg shadow-gold/20"
        >
          <Swords size={18} />
          Continue game
        </NavLink>
      )}
      {game.rounds.length > 0 ? (
        <Replay game={game} />
      ) : (
        <PlayerTotals players={game.players} rounds={game.rounds} dealerRound={game.currentRound} />
      )}
      <section>
        <h2 className="mb-3 font-display text-2xl font-bold text-ink dark:text-cream">Scorecard</h2>
        <ScorecardGrid players={game.players} rounds={game.rounds} />
      </section>

      {/* Deliberately at the bottom of the game's own page, not on every History
          card: deleting a game permanently removes it from everyone's stats. */}
      <div className="pt-6 text-center">
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:bg-heart/10 hover:text-heart dark:text-muted-dark"
        >
          <Trash2 size={14} />
          Delete this game
        </button>
        {deleteError && <p role="alert" className="mt-2 text-sm font-bold text-heart">Not deleted: {deleteError}</p>}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this game for good?"
        message="It disappears from History and every player's stats, on every device. This can't be undone."
        confirmLabel="Delete game"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={async () => {
          try {
            await deleteGame(game.id);
            navigate('/history', { replace: true });
          } catch (err) {
            setConfirmingDelete(false);
            setDeleteError(err?.message ?? 'Could not delete');
          }
        }}
      />
    </div>
  );
}
