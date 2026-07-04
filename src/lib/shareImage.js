import { computeTotals } from './fiveCrowns.js';

const WIDTH = 640;
const CREAM = '#FFFCF2';
const INK = '#141414';
const YELLOW = '#FFD93D';
const MUTED = '#6B6B6B';
const ROW_HEIGHT = 78;

// Draws a neubrutalist-style summary card to an offscreen canvas — no
// html-to-image or similar dependency, plain 2D canvas drawing (with hard
// black borders and a drop-shadow block) is enough to match the app's theme.
export function generateShareImage(game) {
  const margin = 28;
  const height = 190 + ROW_HEIGHT * game.players.length;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH + 12;
  canvas.height = height + 12;
  const ctx = canvas.getContext('2d');

  // Hard shadow block behind the card.
  ctx.fillStyle = INK;
  ctx.fillRect(12, 12, WIDTH, height);

  // Card body.
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, WIDTH - 4, height - 4);

  ctx.fillStyle = INK;
  ctx.font = 'bold 34px "Lexend Mega", system-ui, sans-serif';
  ctx.fillText('FIVE CROWNS', margin, margin + 38);

  ctx.font = 'bold 15px "Public Sans", system-ui, sans-serif';
  ctx.fillStyle = MUTED;
  const dateLabel = game.completedAt?.toDate
    ? game.completedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  ctx.fillText(`Final standings${dateLabel ? ' · ' + dateLabel : ''}`, margin, margin + 64);

  ctx.fillStyle = INK;
  ctx.fillRect(margin, margin + 80, WIDTH - margin * 2, 4);

  const totals = computeTotals(game.players, game.rounds);
  const sorted = [...game.players].sort((a, b) => totals[a.id] - totals[b.id]);

  let y = margin + 108;
  sorted.forEach((p, i) => {
    const isWinner = game.winnerIds?.includes(p.id);
    const rowX = margin;
    const rowW = WIDTH - margin * 2;
    const rowH = ROW_HEIGHT - 14;

    ctx.fillStyle = isWinner ? YELLOW : '#FFFFFF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rowX, y, rowW, rowH, 14);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeRect(rowX, y, rowW, rowH);
    }

    ctx.fillStyle = INK;
    ctx.font = 'bold 20px "Public Sans", system-ui, sans-serif';
    ctx.fillText(String(i + 1), rowX + 18, y + rowH / 2 + 7);

    ctx.font = 'bold 22px "Public Sans", system-ui, sans-serif';
    ctx.fillText(p.name, rowX + 52, y + rowH / 2 + 7);

    ctx.font = 'bold 26px "Public Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(totals[p.id]), rowX + rowW - 20, y + rowH / 2 + 8);
    ctx.textAlign = 'left';

    y += ROW_HEIGHT;
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
