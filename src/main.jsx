import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// The home-screen app can sit in memory for days. Whenever it comes back to
// the foreground, check whether a newer build is deployed (index.html points
// at a different hashed bundle) and reload into it. One reload attempt per
// new build, so a stale HTTP cache can't cause a reload loop.
async function checkForUpdate() {
  if (import.meta.env.DEV) return;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}?check=${Date.now()}`, { cache: 'no-store' });
    const latest = (await res.text()).match(/assets\/index-[^"]+\.js/)?.[0];
    const current = document.querySelector('script[src*="assets/index-"]')?.getAttribute('src');
    if (!latest || !current || current.includes(latest)) return;
    if (sessionStorage.getItem('fiveCrowns_reloadedFor') === latest) return;
    sessionStorage.setItem('fiveCrowns_reloadedFor', latest);
    window.location.reload();
  } catch {
    // Offline or blocked: keep running the build we have.
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
checkForUpdate();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
