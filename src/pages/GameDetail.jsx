import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import PlayerTotals from '../components/PlayerTotals.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import { subscribeToGame } from '../lib/games.js';

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
    return <div className="p-4 text-red-ink">Couldn't load this game: {error}</div>;
  }

  if (game === undefined) {
    return <div className="p-4 text-ink-soft dark:text-chalk-soft">Loading…</div>;
  }

  if (game === null) {
    return (
      <div className="p-4 text-center">
        <p className="mt-8 text-ink-soft dark:text-chalk-soft">This game no longer exists.</p>
        <NavLink to="/history" className="mt-3 inline-block font-medium text-red-ink">
          ← Back to history
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';

  return (
    <div className="space-y-4 p-4">
      <NavLink to="/history" className="inline-flex items-center gap-1 text-sm font-medium text-red-ink">
        <ArrowLeft size={16} />
        Back to history
      </NavLink>
      <h1 className="flex items-center gap-2 font-display text-2xl text-ink dark:text-chalk">
        {isComplete && <Trophy size={20} className="text-amber-chalk" />}
        {isComplete ? 'Final standings' : `In progress · round ${game.currentRound}`}
      </h1>
      <PlayerTotals
        players={game.players}
        rounds={game.rounds}
        winnerIds={game.winnerIds ?? []}
        complete={isComplete}
        dealerRound={isComplete ? null : game.currentRound}
      />
      <ScorecardGrid players={game.players} rounds={game.rounds} />
    </div>
  );
}
