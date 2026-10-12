import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check, Dices, FlaskConical, ListOrdered, Plus, Shuffle, Sparkles, Share2, TrendingUp, Undo2, UserMinus, UserPlus, X } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ConfettiBurst from '../components/ConfettiBurst.jsx';
import DealInterstitial from '../components/DealInterstitial.jsx';
import PlayerTotals from '../components/PlayerTotals.jsx';
import RaceChart from '../components/RaceChart.jsx';
import PlayingCard from '../components/PlayingCard.jsx';
import RoundRail from '../components/RoundRail.jsx';
import ScoreEntryForm from '../components/ScoreEntryForm.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import ShareResultButton from '../components/ShareResultButton.jsx';
import WinnerReveal from '../components/WinnerReveal.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { MAX_PLAYERS, MIN_PLAYERS, dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { addPlayerToGame, createGame, endPracticeGame, isPracticeGame, removePlayerFromGame, listRecentPlayerNames, subscribeToGame, submitRoundScores, undoLastRound } from '../lib/games.js';
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

  // A practice game uses the names entered, or the 4 most recent players when
  // the form isn't filled in, so a demo is one tap away.
  async function handleStart(practice = false) {
    if (!practice && !canStart) return;
    let playerNames = trimmed;
    if (practice && !canStart) {
      const recent = recentPlayers.slice(0, 4).map((r) => r.name);
      playerNames = recent.length >= MIN_PLAYERS ? recent : ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    }
    setStarting(true);
    setError(null);
    try {
      const gameId = await createGame(playerNames, { practice });
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
    <div className="mx-auto max-w-xl space-y-5 p-4 md:p-8">
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
          <p className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark">Recent players</p>
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
        onClick={() => handleStart()}
        disabled={!canStart || starting}
        className="press w-full rounded-2xl bg-gold py-3.5 font-display text-lg text-ink shadow-lg shadow-gold/20 disabled:opacity-40"
      >
        {starting ? 'Starting…' : 'Start Game'}
      </button>

      <button
        type="button"
        onClick={() => handleStart(true)}
        disabled={starting}
        className="press flex w-full flex-col items-center gap-0.5 rounded-2xl border border-parchment-line py-3 text-ink disabled:opacity-40 dark:border-ink-line dark:text-cream"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <FlaskConical size={16} />
          Start a practice game
        </span>
        <span className="text-xs text-muted dark:text-muted-dark">
          Not saved to History or Stats. {canStart ? 'Uses the players above.' : 'Uses 4 recent players.'}
        </span>
      </button>
    </div>
  );
}

function LiveGame({ gameId }) {
  const navigate = useNavigate();
  const practice = isPracticeGame(gameId);
  useWakeLock();
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
  const [removingOpen, setRemovingOpen] = useState(false);
  const [removingPlayer, setRemovingPlayer] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  useEffect(() => {
    localStorage.setItem(CURRENT_GAME_KEY, gameId);
    setGame(undefined);
    setError(null);
    const unsubscribe = subscribeToGame(gameId, setGame, (err) => setError(err.message));
    return unsubscribe;
  }, [gameId]);

  // Show the deal moment only when the round moves forward while watching,
  // not on first load, undo, or switching games.
  const [dealRound, setDealRound] = useState(null);
  const lastRoundRef = useRef(null);
  useEffect(() => {
    if (!game) {
      lastRoundRef.current = null;
      return;
    }
    const prev = lastRoundRef.current;
    if (game.status !== 'complete' && prev !== null && game.currentRound > prev) setDealRound(game.currentRound);
    lastRoundRef.current = game.currentRound;
  }, [game]);

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
  const dealer = dealerForRound(game.currentRound, game.players);
  const editingDealer = editingRound ? dealerForRound(editingRound, game.players) : null;
  // The form reports a draft from mount, so only overlay it once something was entered.
  const hasDraft = !isComplete && draftRound && Object.values(draftRound.scores).some((e) => e.score > 0 || e.wentOut);
  const chartRounds = hasDraft ? [...game.rounds, draftRound] : game.rounds;

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

  // Practice only: a plausible round so a demo can race to the finish. One
  // player goes out; the rest hold a random number of points for the hand size.
  function dealRandomRound() {
    const handSize = game.currentRound + 2;
    const outIndex = Math.floor(Math.random() * game.players.length);
    const scores = {};
    game.players.forEach((p, i) => {
      const score = i === outIndex || Math.random() < 0.15 ? 0 : Math.floor(Math.random() * handSize * 5);
      scores[p.id] = { score, wentOut: i === outIndex };
    });
    handleMainSubmit(scores);
  }

  function handleEndPractice() {
    endPracticeGame(game.id);
    navigate('/play/new');
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
    <div className="relative space-y-6 p-4 md:p-6">
      {practice && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-gold/50 bg-gold/10 px-4 py-3">
          <FlaskConical size={18} className="shrink-0 text-gold-deep dark:text-gold" />
          <p className="min-w-0 flex-1 text-sm text-ink dark:text-cream">
            <span className="font-bold">Practice game.</span> Nothing here is saved to History or Stats.
          </p>
          <div className="flex gap-2">
            {!isComplete && (
              <button type="button" onClick={dealRandomRound} className="press flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-ink">
                <Dices size={15} />
                Deal random round
              </button>
            )}
            <button type="button" onClick={handleEndPractice} className="press rounded-full border border-parchment-line px-3 py-1.5 text-sm font-semibold text-ink dark:border-ink-line dark:text-cream">
              End practice
            </button>
          </div>
        </div>
      )}

      <div className={`card-elevated hero-sheen ${isComplete ? '' : 'sticky top-0'} z-10 relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-parchment-panel p-5 dark:border-gold/30 dark:bg-ink-panel`}>
        {isComplete && <ConfettiBurst />}
        <div className="relative flex items-start justify-between">
          {isComplete ? (
            <div className="flex-1 pt-10">
              <WinnerReveal game={game} />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <PlayingCard key={game.currentRound} round={game.currentRound} />
              <div className="min-w-0">
                <p className="font-display text-[2rem] font-bold leading-none text-ink md:text-6xl dark:text-cream">{wildRankWordForRound(game.currentRound)}</p>
                <p className="mt-0.5 font-display text-lg italic text-gold-deep md:text-2xl dark:text-gold">are wild</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark">
                  <Shuffle size={13} className="shrink-0" />
                  <span className="truncate">
                    <span className="font-bold text-ink dark:text-cream">{dealer.name}</span> deals {game.currentRound + 2} cards
                  </span>
                </p>
              </div>
            </div>
          )}
          <div className={`flex shrink-0 items-center gap-2 ${isComplete ? 'absolute right-0 top-0' : 'flex-col'}`}>
            <NavLink
              to="/play/new"
              aria-label="Start new game"
              title="Start new game"
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream"
            >
              <Plus size={16} />
            </NavLink>
            {!practice && <button
              type="button"
              onClick={handleCopyLink}
              className="press flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-xs font-bold text-ink dark:bg-muted-dark/10 dark:text-cream"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </button>}
          </div>
        </div>
        <div className="relative mt-4">
          <RoundRail rounds={game.rounds} currentRound={game.currentRound} complete={isComplete} onSelect={setEditingRound} />
        </div>
      </div>

      {/* iPad: standings + race on the left, score entry on the right. Phones
          keep the single-column order: standings, entry, race. */}
      <div className="space-y-6 md:grid md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
      <div className="md:col-start-1 md:row-start-1">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted dark:text-muted-dark">
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
        {!isComplete && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setAddingPlayer(true)}
              disabled={game.players.length >= MAX_PLAYERS}
              className="press flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-parchment-line py-2.5 text-sm font-semibold text-muted disabled:opacity-30 dark:border-ink-line dark:text-muted-dark"
            >
              <UserPlus size={16} />
              Add player
            </button>
            <button
              type="button"
              onClick={() => setRemovingOpen(true)}
              disabled={game.players.length <= MIN_PLAYERS}
              className="press flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-parchment-line py-2.5 text-sm font-semibold text-muted disabled:opacity-30 dark:border-ink-line dark:text-muted-dark"
            >
              <UserMinus size={16} />
              Remove player
            </button>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="md:col-start-2 md:row-start-1">
          <ShareResultButton game={game} />
        </div>
      )}

      {!isComplete && (
        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <p className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark">This round's scores</p>
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

      {chartRounds.length > 0 && (
        <div className="md:col-start-1 md:row-start-2">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted dark:text-muted-dark">
            <TrendingUp size={13} />
            The race {hasDraft && <span className="normal-case tracking-normal">· live preview</span>}
          </p>
          <div className="card-elevated rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel">
            <RaceChart players={game.players} rounds={chartRounds} />
            <p className="mt-1 text-center text-[11px] text-muted dark:text-muted-dark">Lowest line wins</p>
          </div>
        </div>
      )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark">Scorecard (tap to edit)</p>
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

      {removingOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setRemovingOpen(false)}>
          <div className="card-elevated animate-sheet-up w-full max-w-sm rounded-t-3xl bg-parchment-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:bg-ink-panel sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-ink dark:text-cream">Who's leaving?</h2>
            <p className="mt-1 text-sm text-muted dark:text-muted-dark">Their scores in this game are deleted, so it won't count in their stats.</p>
            <ul className="mt-4 space-y-2">
              {game.players.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveError(null);
                      setRemovingPlayer(p);
                    }}
                    className="press flex w-full items-center gap-3 rounded-2xl border border-parchment-line p-3 text-left font-semibold text-ink dark:border-ink-line dark:text-cream"
                  >
                    <Avatar name={p.name} sizeClass="h-9 w-9 text-sm" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <UserMinus size={16} className="text-heart" />
                  </button>
                </li>
              ))}
            </ul>
            {removeError && <p className="mt-3 text-sm font-bold text-heart">{removeError}</p>}
            <button type="button" onClick={() => setRemovingOpen(false)} className="press mt-4 w-full rounded-xl border border-parchment-line py-3 font-semibold text-ink dark:border-ink-line dark:text-cream">
              Cancel
            </button>
          </div>
        </div>
      )}

      {dealRound && (
        <DealInterstitial
          round={dealRound}
          dealerName={dealerForRound(dealRound, game.players)?.name ?? ''}
          onDone={() => setDealRound(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(removingPlayer)}
        title={`Remove ${removingPlayer?.name ?? ''}?`}
        message="Every score they have in this game is deleted. Dealer order shifts for the rounds left."
        confirmLabel="Remove"
        onCancel={() => setRemovingPlayer(null)}
        onConfirm={async () => {
          try {
            await removePlayerFromGame(game.id, removingPlayer.id);
            setRemovingOpen(false);
          } catch (err) {
            setRemoveError(err.message ?? 'Failed to remove player');
          }
          setRemovingPlayer(null);
        }}
      />

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
