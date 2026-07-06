import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check, ListOrdered, PartyPopper, Plus, Shuffle, Sparkles, Share2, Undo2, UserPlus, X } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ConfettiBurst from '../components/ConfettiBurst.jsx';
import PlayerTotals from '../components/PlayerTotals.jsx';
import RoundCornerCard from '../components/RoundCornerCard.jsx';
import ScoreEntryForm from '../components/ScoreEntryForm.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import ShareResultButton from '../components/ShareResultButton.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { MAX_PLAYERS, MIN_PLAYERS, dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { addPlayerToGame, createGame, listRecentPlayerNames, subscribeToGame, submitRoundScores, undoLastRound } from '../lib/games.js';
import { vibrate } from '../lib/haptics.js';
import { formatRelativeDate } from '../lib/relativeDate.js';
import { playGameComplete } from '../lib/sound.js';
import { CURRENT_GAME_KEY } from '../lib/storageKeys.js';
import { suitForIndex } from '../lib/suits.js';

export default function Play({ forceNew = false }) {
  const { gameId: paramGameId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (paramGameId || forceNew) return;
    const stored = localStorage.getItem(CURRENT_GAME_KEY);
    if (stored) navigate(`/play/${stored}`, { replace: true });
  }, [paramGameId, forceNew, navigate]);

  if (!paramGameId) return <NewGameForm />;
  return <LiveGame gameId={paramGameId} />;
}

function NewGameForm() {
  const [names, setNames] = useState(['', '']);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    listRecentPlayerNames().then(setRecentPlayers).catch(() => setRecentPlayers([]));
  }, []);

  const trimmed = names.map((n) => n.trim());
  const canStart =
    trimmed.length >= MIN_PLAYERS &&
    trimmed.length <= MAX_PLAYERS &&
    trimmed.every((n) => n.length > 0);

  function updateName(index, value) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addPlayer(prefill = '') {
    if (names.length >= MAX_PLAYERS) return;
    setNames((prev) => [...prev, prefill]);
  }

  function removePlayer(index) {
    if (names.length <= MIN_PLAYERS) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index) {
    if (index === 0) return;
    setNames((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index) {
    if (index === names.length - 1) return;
    setNames((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function addRecent(name) {
    const alreadyUsed = trimmed.some((n) => n.toLowerCase() === name.toLowerCase());
    if (alreadyUsed) return;
    const emptyIndex = names.findIndex((n) => n.trim() === '');
    if (emptyIndex !== -1) {
      updateName(emptyIndex, name);
    } else {
      addPlayer(name);
    }
  }

  async function handleStart() {
    if (!canStart) return;
    setStarting(true);
    setError(null);
    try {
      const gameId = await createGame(trimmed);
      localStorage.setItem(CURRENT_GAME_KEY, gameId);
      navigate(`/play/${gameId}`);
    } catch (err) {
      setError(err.message ?? 'Failed to start game');
      setStarting(false);
    }
  }

  // Already ordered most-recent-first by the Firestore query.
  const availableRecent = recentPlayers.filter(
    (r) => !trimmed.some((t) => t.toLowerCase() === r.name.toLowerCase()),
  );

  return (
    <div className="space-y-5 p-4">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl text-ink dark:text-cream">
          <Sparkles className="text-gold" size={20} />
          New Game
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">Add 2-7 players to get started.</p>
      </div>

      <div className="space-y-2.5">
        {names.map((name, i) => {
          return (
            <div key={i} className="flex items-center gap-2">
              {name.trim() ? (
                <Avatar name={name} sizeClass="h-11 w-11 text-sm" />
              ) : (
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-cream ${suitForIndex(i).bg}`}
                >
                  {i + 1}
                </span>
              )}
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="card-elevated min-w-0 flex-1 rounded-2xl bg-parchment-panel p-3 font-bold text-ink placeholder:font-normal placeholder:text-muted focus:outline-none dark:bg-ink-panel dark:text-cream"
              />
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                aria-label="Move up"
                className="press card-elevated flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-parchment-panel text-ink disabled:opacity-30 dark:bg-ink-panel dark:text-cream"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === names.length - 1}
                aria-label="Move down"
                className="press card-elevated flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-parchment-panel text-ink disabled:opacity-30 dark:bg-ink-panel dark:text-cream"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => removePlayer(i)}
                disabled={names.length <= MIN_PLAYERS}
                aria-label="Remove player"
                className="press card-elevated flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-heart text-cream disabled:opacity-30"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => addPlayer()}
        disabled={names.length >= MAX_PLAYERS}
        className="press flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-parchment-line py-3 font-semibold text-muted disabled:opacity-30 dark:border-ink-line dark:text-muted-dark"
      >
        <Plus size={18} />
        Add player
      </button>

      {availableRecent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Recent players</p>
          <div className="flex flex-wrap gap-2">
            {availableRecent.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => addRecent(r.name)}
                className="card-elevated press rounded-full bg-parchment-panel px-3 py-1.5 text-left text-sm font-bold text-ink dark:bg-ink-panel dark:text-cream"
              >
                {r.name}
                {r.lastUsedAt && (
                  <span className="ml-1.5 text-xs font-normal text-muted dark:text-muted-dark">{formatRelativeDate(r.lastUsedAt)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm font-bold text-heart">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart || starting}
        className="press w-full rounded-2xl bg-gold py-3.5 font-display text-lg text-ink shadow-lg shadow-gold/20 disabled:opacity-40"
      >
        {starting ? 'Starting…' : 'Start Game'}
      </button>
    </div>
  );
}

function LiveGame({ gameId }) {
  const { enabled: feedbackEnabled } = useFeedback();
  const [game, setGame] = useState(undefined);
  const [error, setError] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftRound, setDraftRound] = useState(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addPlayerError, setAddPlayerError] = useState(null);

  useEffect(() => {
    localStorage.setItem(CURRENT_GAME_KEY, gameId);
    setGame(undefined);
    setError(null);
    const unsubscribe = subscribeToGame(gameId, setGame, (err) => setError(err.message));
    return unsubscribe;
  }, [gameId]);

  // Someone else may have deleted this game from another device — without
  // this, the Play tab would keep bouncing back to a dead game every time
  // it's opened, since the "current game" pointer never gets cleared.
  useEffect(() => {
    if (game === null && localStorage.getItem(CURRENT_GAME_KEY) === gameId) {
      localStorage.removeItem(CURRENT_GAME_KEY);
    }
  }, [game, gameId]);

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
        <NavLink to="/play/new" className="mt-3 inline-block font-bold text-gold-deep dark:text-gold">
          Start a new game →
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';
  const editingRoundData = editingRound
    ? game.rounds.find((r) => r.roundNumber === editingRound)?.scores
    : null;
  const progressPct = Math.round((game.currentRound - 1) / TOTAL_ROUNDS * 100);
  const dealer = dealerForRound(game.currentRound, game.players);
  const editingDealer = editingRound ? dealerForRound(editingRound, game.players) : null;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMainSubmit(scores) {
    const round = game.currentRound;
    const isFinalRound = round === TOTAL_ROUNDS;
    await submitRoundScores(game.id, round, scores);

    if (feedbackEnabled) {
      vibrate(isFinalRound ? [30, 60, 30, 60, 60] : 15);
      if (isFinalRound) playGameComplete();
    }
  }

  function closeAddPlayer() {
    setAddingPlayer(false);
    setNewPlayerName('');
    setAddPlayerError(null);
  }

  async function handleAddPlayer() {
    if (!newPlayerName.trim()) return;
    try {
      await addPlayerToGame(game.id, newPlayerName);
      closeAddPlayer();
    } catch (err) {
      setAddPlayerError(err.message ?? 'Failed to add player');
    }
  }

  return (
    <div className="relative space-y-6 p-4">
      <div className="card-elevated sticky top-0 z-10 relative overflow-hidden rounded-3xl bg-parchment-panel bg-gradient-to-br from-gold/15 via-parchment-panel to-parchment-panel p-5 dark:bg-ink-panel dark:from-gold/10 dark:via-ink-panel dark:to-ink-panel">
        {isComplete && <ConfettiBurst />}
        <div className="relative flex items-center justify-between">
          {isComplete ? (
            <h1 className="flex items-center gap-2 font-display text-xl text-ink dark:text-cream">
              <PartyPopper className="text-gold" size={24} />
              Game complete
            </h1>
          ) : (
            <div className="flex-1">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted dark:text-muted-dark">
                <Shuffle size={14} />
                Dealer: <span className="normal-case text-base text-ink dark:text-cream">{dealer.name}</span>
              </p>
              <RoundCornerCard key={game.currentRound} round={game.currentRound} wildRankWord={wildRankWordForRound(game.currentRound)} />
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-parchment-line dark:bg-ink-line">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-bold text-muted dark:text-muted-dark">
                  Round {game.currentRound} of {TOTAL_ROUNDS}
                </span>
              </div>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <NavLink
              to="/play/new"
              aria-label="Start new game"
              title="Start new game"
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream"
            >
              <Plus size={16} />
            </NavLink>
            <button
              type="button"
              onClick={handleCopyLink}
              className="press flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-xs font-bold text-ink dark:bg-muted-dark/10 dark:text-cream"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
          <ListOrdered size={13} />
          Standings
        </p>
        <PlayerTotals
          players={game.players}
          rounds={game.rounds}
          winnerIds={isComplete ? game.winnerIds : []}
          complete={isComplete}
          draftRound={isComplete ? null : draftRound}
          dealerRound={isComplete ? null : game.currentRound}
        />
        {!isComplete && game.players.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={() => setAddingPlayer(true)}
            className="press mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-parchment-line py-2.5 text-sm font-semibold text-muted dark:border-ink-line dark:text-muted-dark"
          >
            <UserPlus size={16} />
            Add player
          </button>
        )}
      </div>

      {isComplete && <ShareResultButton game={game} />}

      {!isComplete && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">This round's scores</p>
          <ScoreEntryForm
            key={game.currentRound}
            players={game.players}
            roundNumber={game.currentRound}
            onDraftChange={setDraftRound}
            submitLabel={game.currentRound === TOTAL_ROUNDS ? 'Finish Game' : 'Next Round'}
            onSubmit={handleMainSubmit}
          />
          <button
            type="button"
            onClick={() => setConfirmingUndo(true)}
            disabled={game.rounds.length === 0}
            className="press mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold text-muted disabled:opacity-30 dark:text-muted-dark"
          >
            <Undo2 size={15} />
            Undo last entry
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Scorecard (tap to edit)</p>
        <ScorecardGrid players={game.players} rounds={game.rounds} onEditRound={setEditingRound} />
      </div>

      {addingPlayer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="card-elevated animate-pop-in w-full max-w-sm rounded-t-3xl bg-parchment-panel p-5 dark:bg-ink-panel sm:rounded-3xl">
            <h2 className="mb-3 font-display text-xl text-ink dark:text-cream">Add player</h2>
            <input
              type="text"
              autoFocus
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="card-elevated w-full rounded-2xl bg-parchment p-3 font-bold text-ink placeholder:font-normal placeholder:text-muted focus:outline-none dark:bg-ink-deep dark:text-cream"
            />
            <p className="mt-2 text-xs text-muted dark:text-muted-dark">
              They join from this round onward — past rounds count as 0 for them.
            </p>
            {addPlayerError && <p className="mt-2 text-sm font-bold text-heart">{addPlayerError}</p>}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={closeAddPlayer}
                className="press flex-1 rounded-xl border border-parchment-line py-3 font-semibold text-ink dark:border-ink-line dark:text-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="press flex-1 rounded-xl bg-gold py-3 font-bold text-ink disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRound && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="card-elevated animate-pop-in max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-parchment-panel p-5 dark:bg-ink-panel sm:rounded-3xl">
            <h2 className="mb-3 flex flex-wrap items-center gap-x-2 text-lg font-bold text-ink dark:text-cream">
              <span className="font-display text-xl">Edit {wildRankWordForRound(editingRound)}</span>
              <span className="flex items-center gap-1 text-sm font-bold text-muted dark:text-muted-dark">
                <Shuffle size={12} />
                Dealer: {editingDealer.name}
              </span>
            </h2>
            <ScoreEntryForm
              players={game.players}
              initialData={editingRoundData}
              roundNumber={editingRound}
              submitLabel="Save"
              onCancel={() => setEditingRound(null)}
              onSubmit={async (scores) => {
                await submitRoundScores(game.id, editingRound, scores);
                setEditingRound(null);
              }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingUndo}
        title="Undo last entry?"
        message="This removes the most recently entered round's scores."
        confirmLabel="Undo"
        onCancel={() => setConfirmingUndo(false)}
        onConfirm={async () => {
          await undoLastRound(game.id);
          setConfirmingUndo(false);
        }}
      />
    </div>
  );
}
