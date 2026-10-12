import { useEffect } from 'react';

// Keeps the iPad screen from dimming while a game is on the table. The OS
// drops the lock when the app is backgrounded, so it's re-requested on return.
// Unsupported browsers just skip it.
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active || !navigator.wakeLock) return undefined;
    let lock = null;
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        // Denied (e.g. low battery mode): the screen just sleeps normally.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') request();
    };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
