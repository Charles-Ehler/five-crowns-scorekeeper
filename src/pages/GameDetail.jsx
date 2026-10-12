import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Swords, Trophy } from 'lucide-react';
import PlayerTotals from '../components/PlayerTotals.jsx';
import RaceChart from '../components/RaceChart.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import { wildRankWordForRound } from '../lib/fiveCrowns.js';
import { subscribeToGame } from '../lib/games.js';

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
    <div className="space-y-4">
      <div className="card-elevated rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted dark:text-muted-dark">Replay</p>
          <p className="text-xs font-bold text-ink dark:text-cream">
            {round === 0 ? 'Before the deal' : `After ${wildRankWordForRound(round)} · R${round}`}
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

  useEffect(() => {
    setGame(undefined);
    setError(null);
    return subscribeToGame(gameId, setGame, (err) => setError(err.message));
  }, [gameId]);

  if (error) {
    return <div className="p-4 font-bold text-heart">Couldn't load this game: {error}</div>;
  }

  if (game === undefined) {
    return <div className="p-4 font-bold text-muted dark:text-muted-dark">Loading…</div>;
  }

  if (game === null) {
    return (
      <div className="p-4 text-center">
        <p className="mt-8 text-muted dark:text-muted-dark">This game no longer exists.</p>
        <NavLink to="/history" className="mt-3 inline-block font-bold text-gold-deep dark:text-gold">
          ← Back to history
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';

  return (
    <div className="space-y-4 p-4 md:p-6">
      <NavLink to="/history" className="inline-flex items-center gap-1 text-sm font-bold text-ink dark:text-cream">
        <ArrowLeft size={16} />
        Back to history
      </NavLink>
      <h1 className="flex items-center gap-2 font-display text-xl text-ink dark:text-cream">
        {isComplete && <Trophy size={20} className="text-gold" />}
        {isComplete ? 'Final standings' : `In progress · round ${game.currentRound}`}
      </h1>
      {!isComplete && (
        <NavLink
          to={`/play/${game.id}`}
          className="press flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gold py-3 font-display text-base text-ink shadow-lg shadow-gold/20"
        >
          <Swords size={18} />
          Continue game
        </NavLink>
      )}
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
        {game.rounds.length > 0 ? (
          <Replay game={game} />
        ) : (
          <PlayerTotals players={game.players} rounds={game.rounds} dealerRound={game.currentRound} />
        )}
        <ScorecardGrid players={game.players} rounds={game.rounds} />
      </div>
    </div>
  );
}
