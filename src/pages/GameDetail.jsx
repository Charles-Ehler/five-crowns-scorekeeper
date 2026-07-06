import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Swords, Trophy } from 'lucide-react';
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
    <div className="space-y-4 p-4">
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
