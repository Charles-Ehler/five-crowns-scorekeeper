import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { MAX_PLAYERS, MIN_PLAYERS, TOTAL_ROUNDS, computeCurrentRound, computeTotals, createPlayerId, missedRoundScore } from './fiveCrowns.js';
import { CURRENT_GAME_KEY } from './storageKeys.js';

const GAMES_COLLECTION = 'fiveCrowns_games';
const PLAYERS_COLLECTION = 'fiveCrowns_players';
const RECENT_PLAYERS_LIMIT = 30;

// --- Practice games -------------------------------------------------------
// A practice game lives only on this device (localStorage), never in
// Firestore, so it can't reach History, Stats, or the recent-players list.
// Every game function below checks the id and routes here, so the live game
// screen works identically for both.
const PRACTICE_PREFIX = 'practice-';
const PRACTICE_KEY = 'fiveCrowns_practiceGame';
const practiceListeners = new Set();

export function isPracticeGame(gameId) {
  return typeof gameId === 'string' && gameId.startsWith(PRACTICE_PREFIX);
}

// Timestamps are stored as epoch ms and handed out with the same
// toDate()/toMillis() shape Firestore Timestamps have.
function hydratePractice(raw) {
  if (!raw) return null;
  const ts = (ms) => (ms == null ? null : { toDate: () => new Date(ms), toMillis: () => ms });
  return { ...raw, createdAt: ts(raw.createdAt), updatedAt: ts(raw.updatedAt), completedAt: ts(raw.completedAt) };
}

function readPractice(gameId) {
  try {
    const raw = JSON.parse(localStorage.getItem(PRACTICE_KEY));
    return raw?.id === gameId ? raw : null;
  } catch {
    return null;
  }
}

function writePractice(raw) {
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(raw));
  practiceListeners.forEach((fn) => fn(raw));
}

// --- Shared game access ----------------------------------------------------

export function subscribeToGame(gameId, onChange, onError) {
  if (isPracticeGame(gameId)) {
    const listener = (raw) => onChange(raw?.id === gameId ? hydratePractice(raw) : null);
    practiceListeners.add(listener);
    onChange(hydratePractice(readPractice(gameId)));
    return () => practiceListeners.delete(listener);
  }
  return onSnapshot(
    doc(db, GAMES_COLLECTION, gameId),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    onError,
  );
}

// Runs mutate(game, now) against the current game and applies the returned
// fields. `now()` is a server timestamp for real games and epoch ms for
// practice ones. Real games go through a transaction.
async function updateGame(gameId, mutate) {
  if (isPracticeGame(gameId)) {
    const raw = readPractice(gameId);
    if (!raw) throw new Error('Game not found');
    const update = mutate(raw, () => Date.now());
    if (update) writePractice({ ...raw, ...update });
    return;
  }
  const ref = doc(db, GAMES_COLLECTION, gameId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Game not found');
    const update = mutate(snap.data(), serverTimestamp);
    if (update) tx.update(ref, update);
  });
}

export async function createGame(playerNames, { practice = false } = {}) {
  const players = playerNames.map((name) => ({ id: createPlayerId(), name }));
  if (practice) {
    const id = `${PRACTICE_PREFIX}${createPlayerId()}`;
    const now = Date.now();
    writePractice({ id, players, rounds: [], currentRound: 1, status: 'in_progress', winnerIds: [], createdAt: now, updatedAt: now, completedAt: null });
    return id;
  }
  const ref = await addDoc(collection(db, GAMES_COLLECTION), {
    players,
    rounds: [],
    currentRound: 1,
    status: 'in_progress',
    winnerIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });
  await Promise.all(playerNames.map((name) => saveRecentPlayerName(name)));
  return ref.id;
}

// Joining mid-game appends the player and gives them a score for every round
// already played (see missedRoundScore). Dealer rotation (round %
// players.length) shifts to include the new seat going forward; that's the
// accepted tradeoff for not storing a separate dealer field.
export async function addPlayerToGame(gameId, name, fillMode = 'highest') {
  const trimmed = name.trim();
  if (!trimmed) return;
  await updateGame(gameId, (game, now) => {
    if (game.players.length >= MAX_PLAYERS) throw new Error(`Games are capped at ${MAX_PLAYERS} players`);
    const id = createPlayerId();
    const rounds = game.rounds.map((r) => ({
      ...r,
      scores: { ...r.scores, [id]: { score: missedRoundScore(r, game.players, fillMode), wentOut: false } },
    }));
    return { players: [...game.players, { id, name: trimmed }], rounds, updatedAt: now() };
  });
  if (!isPracticeGame(gameId)) await saveRecentPlayerName(trimmed);
}

// Leaving mid-game removes the player and every score they had in this game,
// so a half-played game never counts toward their stats. Same full recompute
// as round edits, so status and winners stay consistent.
export async function removePlayerFromGame(gameId, playerId) {
  await updateGame(gameId, (game, now) => {
    if (game.players.length <= MIN_PLAYERS) throw new Error(`Games need at least ${MIN_PLAYERS} players`);
    const players = game.players.filter((p) => p.id !== playerId);
    const rounds = game.rounds.map((r) => {
      const scores = { ...r.scores };
      delete scores[playerId];
      return { ...r, scores };
    });
    return { players, ...buildRoundsUpdate({ ...game, players }, rounds, now) };
  });
}

// Handles both a brand-new round and editing a past round through the same
// path: the round list is always fully recomputed (current round, status,
// winners) from whichever rounds exist afterward, so there's no separate
// "advance" vs "edit" branch to keep in sync.
export async function submitRoundScores(gameId, roundNumber, scoresByPlayerId) {
  await updateGame(gameId, (game, now) => {
    const rounds = game.rounds.filter((r) => r.roundNumber !== roundNumber);
    rounds.push({ roundNumber, scores: scoresByPlayerId });
    rounds.sort((a, b) => a.roundNumber - b.roundNumber);
    return buildRoundsUpdate(game, rounds, now);
  });
}

export async function undoLastRound(gameId) {
  await updateGame(gameId, (game, now) => {
    if (game.rounds.length === 0) return null;
    const lastRoundNumber = Math.max(...game.rounds.map((r) => r.roundNumber));
    const rounds = game.rounds.filter((r) => r.roundNumber !== lastRoundNumber);
    return buildRoundsUpdate(game, rounds, now);
  });
}

function buildRoundsUpdate(game, rounds, now) {
  const complete = rounds.length === TOTAL_ROUNDS;
  const update = {
    rounds,
    currentRound: computeCurrentRound(rounds),
    updatedAt: now(),
  };

  if (complete) {
    const totals = computeTotals(game.players, rounds);
    const lowest = Math.min(...Object.values(totals));
    update.status = 'complete';
    update.winnerIds = Object.keys(totals).filter((id) => totals[id] === lowest);
    update.completedAt = game.completedAt ?? now();
  } else {
    update.status = 'in_progress';
    update.winnerIds = [];
    update.completedAt = null;
  }

  return update;
}

export function endPracticeGame(gameId) {
  if (readPractice(gameId)) localStorage.removeItem(PRACTICE_KEY);
  if (localStorage.getItem(CURRENT_GAME_KEY) === gameId) localStorage.removeItem(CURRENT_GAME_KEY);
  practiceListeners.forEach((fn) => fn(null));
}

export async function deleteGame(gameId) {
  await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
  // Otherwise this device's Play tab would keep trying to reload a game that
  // no longer exists, landing on a dead end instead of the New Game screen.
  if (localStorage.getItem(CURRENT_GAME_KEY) === gameId) {
    localStorage.removeItem(CURRENT_GAME_KEY);
  }
}

export async function listGames() {
  const q = query(collection(db, GAMES_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveRecentPlayerName(name) {
  const trimmed = name.trim();
  const id = trimmed.toLowerCase();
  if (!id) return;
  await setDoc(
    doc(db, PLAYERS_COLLECTION, id),
    { name: trimmed, lastUsedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function listRecentPlayerNames() {
  const q = query(collection(db, PLAYERS_COLLECTION), orderBy('lastUsedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.slice(0, RECENT_PLAYERS_LIMIT).map((d) => ({ name: d.data().name, lastUsedAt: d.data().lastUsedAt }));
}
