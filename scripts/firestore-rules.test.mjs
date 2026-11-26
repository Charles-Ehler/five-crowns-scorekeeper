// Firestore rules test: seeds a local emulator with a backup of the real
// data, then checks every write the app makes is allowed and harmful ones
// are blocked. It never touches the live database (demo- project).
//
// Run from a folder with the tools installed:
//   npm i firebase-tools @firebase/rules-unit-testing firebase
//   cp <repo>/firestore.rules ./firestore.rules && cp <backup>.json ./backup.json
//   npx firebase emulators:exec --only firestore --project demo-five-crowns "node firestore-rules.test.mjs"

import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, deleteField, serverTimestamp, Timestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-five-crowns',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
});
const backup = JSON.parse(readFileSync('backup.json', 'utf8'));
const ts = (v) => (v && typeof v.seconds === 'number' ? new Timestamp(v.seconds, v.nanoseconds) : v);

// Seed the emulator with the real data (rules off), exactly as stored.
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  for (const [id, g] of Object.entries(backup.fiveCrowns_games)) {
    await setDoc(doc(db, 'fiveCrowns_games', id), { ...g, createdAt: ts(g.createdAt), updatedAt: ts(g.updatedAt), completedAt: ts(g.completedAt) });
  }
  for (const [id, p] of Object.entries(backup.fiveCrowns_players)) {
    await setDoc(doc(db, 'fiveCrowns_players', id), { ...p, lastUsedAt: ts(p.lastUsedAt) });
  }
});

const db = env.unauthenticatedContext().firestore();
const results = [];
async function check(label, expectAllowed, fn) {
  try {
    await (expectAllowed ? assertSucceeds(fn()) : assertFails(fn()));
    results.push(`PASS ${expectAllowed ? 'allows' : 'blocks'}: ${label}`);
  } catch (e) {
    results.push(`FAIL ${expectAllowed ? 'should allow' : 'should block'}: ${label} (${e.message.split('\n')[0]})`);
  }
}

const players = [{ id: 'p1', name: 'Ann' }, { id: 'p2', name: 'Ben' }];
const newGame = { players, rounds: [], currentRound: 1, status: 'in_progress', winnerIds: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), completedAt: null };
const round1 = { roundNumber: 1, scores: { p1: { score: 0, wentOut: true }, p2: { score: 12, wentOut: false } } };
const completeId = Object.keys(backup.fiveCrowns_games)[0];
const complete = backup.fiveCrowns_games[completeId];

await check('read a game', true, () => getDoc(doc(db, 'fiveCrowns_games', completeId)));
await check('create a new game (createGame)', true, () => setDoc(doc(db, 'fiveCrowns_games', 'new1'), newGame));
await check('save a round (submitRoundScores)', true, () => updateDoc(doc(db, 'fiveCrowns_games', 'new1'), { rounds: [round1], currentRound: 2, status: 'in_progress', winnerIds: [], completedAt: null, updatedAt: serverTimestamp() }));
await check('add a late player with filled score (addPlayerToGame)', true, () => updateDoc(doc(db, 'fiveCrowns_games', 'new1'), {
  players: [...players, { id: 'p3', name: 'Cal' }],
  rounds: [{ ...round1, scores: { ...round1.scores, p3: { score: 12, wentOut: false, filled: true } } }],
  updatedAt: serverTimestamp(),
}));
await check('remove a player (removePlayerFromGame)', true, () => updateDoc(doc(db, 'fiveCrowns_games', 'new1'), { players, rounds: [round1], currentRound: 2, status: 'in_progress', winnerIds: [], completedAt: null, updatedAt: serverTimestamp() }));
await check('undo a round (undoLastRound)', true, () => updateDoc(doc(db, 'fiveCrowns_games', 'new1'), { rounds: [], currentRound: 1, status: 'in_progress', winnerIds: [], completedAt: null, updatedAt: serverTimestamp() }));
await check('delete an unfinished game', true, () => deleteDoc(doc(db, 'fiveCrowns_games', 'new1')));
const edited = complete.rounds.map((r, i) => (i === 0 ? { ...r, scores: { ...r.scores } } : r));
await check('correct a score in a finished game (Edit round)', true, () => updateDoc(doc(db, 'fiveCrowns_games', completeId), { rounds: edited, currentRound: 11, status: 'complete', winnerIds: complete.winnerIds, updatedAt: serverTimestamp() }));
await check('save a recent player name (saveRecentPlayerName)', true, () => setDoc(doc(db, 'fiveCrowns_players', 'ann'), { name: 'Ann', lastUsedAt: serverTimestamp() }, { merge: true }));
await check('set a photo (uploadPlayerPhoto)', true, () => setDoc(doc(db, 'fiveCrowns_players', 'ann'), { name: 'Ann', photoUrl: 'https://example.com/a.jpg' }, { merge: true }));
await check('remove a photo (removePlayerPhoto)', true, () => setDoc(doc(db, 'fiveCrowns_players', 'ann'), { photoUrl: deleteField() }, { merge: true }));

await check('delete a finished game', false, () => deleteDoc(doc(db, 'fiveCrowns_games', completeId)));
await check('empty a finished game', false, () => updateDoc(doc(db, 'fiveCrowns_games', completeId), { rounds: [], currentRound: 1, status: 'in_progress' }));
await check('drop a player from a finished game', false, () => updateDoc(doc(db, 'fiveCrowns_games', completeId), { players: complete.players.slice(0, 2) }));
await check('add a junk field to a game', false, () => updateDoc(doc(db, 'fiveCrowns_games', completeId), { hacked: true }));
await check('create a 1-player game', false, () => setDoc(doc(db, 'fiveCrowns_games', 'bad1'), { ...newGame, players: players.slice(0, 1) }));
await check('delete a player record', false, () => deleteDoc(doc(db, 'fiveCrowns_players', 'charles')));
await check('write to another collection', false, () => setDoc(doc(db, 'somethingElse', 'x'), { a: 1 }));

// Every seeded real game must still read back intact.
let intact = 0;
await env.withSecurityRulesDisabled(async (ctx) => {
  for (const id of Object.keys(backup.fiveCrowns_games)) {
    const snap = await getDoc(doc(ctx.firestore(), 'fiveCrowns_games', id));
    if (snap.exists() && snap.data().rounds.length === backup.fiveCrowns_games[id].rounds.length) intact += 1;
  }
});
results.push(`${intact === Object.keys(backup.fiveCrowns_games).length ? 'PASS' : 'FAIL'}: ${intact} of 8 real games intact after the attack attempts`);

console.log(results.join('\n'));
await env.cleanup();
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
