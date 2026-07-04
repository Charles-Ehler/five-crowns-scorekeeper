import { computeTotals } from './fiveCrowns.js';

const WIDTH = 640;
const INK_DEEP = '#120F1E';
const CREAM = '#F6F0E4';
const GOLD = '#D4A94A';
const MUTED = '#9C93AC';
const ROW_HEIGHT = 78;

// Draws a Royal Deck-style summary card to an offscreen canvas — deep ink
// background, gold-foil accents — no html-to-image dependency, plain 2D
// canvas drawing is enough to match the app's theme.
export function generateShareImage(game) {
  const margin = 28;
  const height = 190 + ROW_HEIGHT * game.players.length;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = INK_DEEP;
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, WIDTH - 20, height - 20);

  ctx.fillStyle = GOLD;
  ctx.font = '34px "Cinzel", serif';
  ctx.fillText('FIVE CROWNS', margin + 12, margin + 38);

  ctx.font = 'bold 15px "Manrope", system-ui, sans-serif';
  ctx.fillStyle = MUTED;
  const dateLabel = game.completedAt?.toDate
    ? game.completedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  ctx.fillText(`Final standings${dateLabel ? ' · ' + dateLabel : ''}`, margin + 12, margin + 64);

  ctx.strokeStyle = 'rgba(212, 169, 74, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 12, margin + 80);
  ctx.lineTo(WIDTH - margin - 12, margin + 80);
  ctx.stroke();

  const totals = computeTotals(game.players, game.rounds);
  const sorted = [...game.players].sort((a, b) => totals[a.id] - totals[b.id]);

  let y = margin + 108;
  sorted.forEach((p, i) => {
    const isWinner = game.winnerIds?.includes(p.id);
    const rowX = margin + 12;
    const rowW = WIDTH - (margin + 12) * 2;
    const rowH = ROW_HEIGHT - 14;

    if (isWinner) {
      ctx.fillStyle = 'rgba(212, 169, 74, 0.15)';
      ctx.strokeStyle = GOLD;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    }
    ctx.lineWidth = 1.5;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rowX, y, rowW, rowH, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeRect(rowX, y, rowW, rowH);
    }

    ctx.fillStyle = MUTED;
    ctx.font = 'bold 20px "Manrope", system-ui, sans-serif';
    ctx.fillText(String(i + 1), rowX + 18, y + rowH / 2 + 7);

    ctx.fillStyle = CREAM;
    ctx.font = 'bold 22px "Manrope", system-ui, sans-serif';
    ctx.fillText(p.name, rowX + 52, y + rowH / 2 + 7);

    ctx.fillStyle = isWinner ? GOLD : CREAM;
    ctx.font = 'bold 26px "Manrope", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(totals[p.id]), rowX + rowW - 20, y + rowH / 2 + 8);
    ctx.textAlign = 'left';

    y += ROW_HEIGHT;
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
