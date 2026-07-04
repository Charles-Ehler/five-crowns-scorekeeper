import { computeTotals } from './fiveCrowns.js';

const WIDTH = 640;
const PAPER = '#FBF7ED';
const RULE = '#D9CFB8';
const INK = '#1D3557';
const RED = '#C1121F';
const MUTED = '#7A7462';

// Draws a scorepad-style summary card to an offscreen canvas — no
// html-to-image or similar dependency, plain 2D canvas drawing is enough.
export function generateShareImage(game) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = 190 + 86 * game.players.length;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, canvas.height);

  const margin = 32;

  ctx.fillStyle = INK;
  ctx.font = 'bold 36px Georgia, "Times New Roman", serif';
  ctx.fillText('Five Crowns', margin, margin + 40);

  ctx.font = '15px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = MUTED;
  const dateLabel = game.completedAt?.toDate
    ? game.completedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  ctx.fillText(`Final standings${dateLabel ? ' · ' + dateLabel : ''}`, margin, margin + 66);

  ctx.strokeStyle = RED;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, margin + 82);
  ctx.lineTo(WIDTH - margin, margin + 82);
  ctx.stroke();

  const totals = computeTotals(game.players, game.rounds);
  const sorted = [...game.players].sort((a, b) => totals[a.id] - totals[b.id]);

  let y = margin + 132;
  sorted.forEach((p, i) => {
    const isWinner = game.winnerIds?.includes(p.id);

    ctx.fillStyle = MUTED;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(i + 1), margin, y);

    ctx.fillStyle = INK;
    ctx.font = `bold 24px system-ui, -apple-system, sans-serif`;
    ctx.fillText(p.name, margin + 40, y);

    if (isWinner) {
      const nameWidth = ctx.measureText(p.name).width;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(margin + 40 + nameWidth + 20, y - 8, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = INK;
    ctx.font = 'bold 26px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(totals[p.id]), WIDTH - margin, y);
    ctx.textAlign = 'left';

    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, y + 30);
    ctx.lineTo(WIDTH - margin, y + 30);
    ctx.stroke();

    y += 86;
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
