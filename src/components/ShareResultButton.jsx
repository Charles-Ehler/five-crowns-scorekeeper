import { useState } from 'react';
import { Check, Download, Share2 } from 'lucide-react';
import { generateShareImage } from '../lib/shareImage.js';

export default function ShareResultButton({ game }) {
  const [status, setStatus] = useState('idle'); // idle | copied | downloaded

  async function handleShare() {
    const blob = await generateShareImage(game);
    if (!blob) return;

    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      } catch {
        // Fall through to download if the clipboard write is rejected (e.g. no permission).
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `five-crowns-${game.id}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('downloaded');
    setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="press card-elevated flex w-full items-center justify-center gap-1.5 rounded-xl bg-parchment-panel py-3 font-bold text-ink dark:bg-ink-panel dark:text-cream"
    >
      {status === 'idle' && (
        <>
          <Share2 size={16} />
          Share result
        </>
      )}
      {status === 'copied' && (
        <>
          <Check size={16} />
          Image copied!
        </>
      )}
      {status === 'downloaded' && (
        <>
          <Download size={16} />
          Image downloaded
        </>
      )}
    </button>
  );
}
