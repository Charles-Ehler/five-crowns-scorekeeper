import { computeTotals } from './fiveCrowns.js';

// One game reduced to what History and Stats show: finishing order with
// totals (ties share a place), the winners, and how far ahead the winner
// finished. margin is null when nobody is second (co-winners only).
export function summarizeGame(game) {
  const totals = computeTotals(game.players, game.rounds);
  const ranked = [...game.players]
    .sort((a, b) => totals[a.id] - totals[b.id])
    .map((player) => ({
      player,
      total: totals[player.id],
      place: 1 + game.players.filter((o) => totals[o.id] < totals[player.id]).length,
    }));
  const winners = ranked.filter((r) => r.place === 1);
  const runnerUp = ranked.find((r) => r.place > 1);
  return {
    totals,
    ranked,
    winners,
    margin: runnerUp && winners.length ? runnerUp.total - winners[0].total : null,
  };
}

export function timestampMs(ts) {
  return ts?.toMillis ? ts.toMillis() : 0;
}

export function formatDate(ts, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return ts?.toDate ? ts.toDate().toLocaleDateString(undefined, options) : '';
}

// Self-check: run `node src/lib/gameSummary.js` to verify ties and margins.
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('gameSummary.js')) {
  const assert = (await import('node:assert')).default;
  const game = {
    players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
    rounds: [{ roundNumber: 1, scores: { a: { score: 5 }, b: { score: 5 }, c: { score: 20 } } }],
  };
  const s = summarizeGame(game);
  assert.deepEqual(s.ranked.map((r) => r.place), [1, 1, 3]);
  assert.equal(s.winners.length, 2);
  assert.equal(s.margin, 15);
  assert.equal(summarizeGame({ ...game, players: game.players.slice(0, 2) }).margin, null);
  console.log('gameSummary ok');
}
