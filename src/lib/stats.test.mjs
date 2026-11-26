// Run: node src/lib/stats.test.mjs
// Filled-in rounds (a late joiner's missed hands) must count toward the game
// total but stay out of round records and the went-out rate.
import assert from 'node:assert';
import { computeStats } from './stats.js';
import { outRates } from './gameSummary.js';

const ts = (ms) => ({ toMillis: () => ms, toDate: () => new Date(ms) });
const players = [{ id: 'a', name: 'Ann' }, { id: 'b', name: 'Ben' }, { id: 'c', name: 'Cal' }];
const rounds = Array.from({ length: 11 }, (_, i) => ({
  roundNumber: i + 1,
  scores: {
    a: { score: 0, wentOut: true },
    b: { score: 10, wentOut: false },
    // Cal joined late: round 1 is a filled-in 90 (worse than anything played).
    c: i === 0 ? { score: 90, wentOut: false, filled: true } : { score: 5, wentOut: false },
  },
}));
const game = { id: 'g1', players, rounds, status: 'complete', winnerIds: ['a'], createdAt: ts(1) };
const stats = computeStats([game]);
const cal = stats.players.find((p) => p.name === 'Cal');

assert.equal(cal.average, 90 + 5 * 10, 'filled score still counts toward the total');
assert.equal(stats.worstRound.score, 10, 'filled 90 is not the roughest round');
assert.equal(cal.worstRound.score, 5, "filled 90 is not Cal's roughest round");
assert.deepEqual(outRates([game]).get('cal'), { out: 0, rounds: 10 }, 'filled round not counted as played');
console.log('stats filled-round checks ok');
