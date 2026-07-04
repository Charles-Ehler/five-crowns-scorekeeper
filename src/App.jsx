import { Navigate, useLocation, Route, Routes } from 'react-router-dom';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import BottomNav from './components/BottomNav.jsx';
import Play from './pages/Play.jsx';
import History from './pages/History.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Stats from './pages/Stats.jsx';
import PlayerDetail from './pages/PlayerDetail.jsx';
import { PlayerPhotosProvider } from './contexts/PlayerPhotosContext.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import { useFeedback } from './hooks/useFeedback.js';

export default function App() {
  const { theme, toggleTheme } = useDarkMode();
  const { enabled: feedbackEnabled, toggle: toggleFeedback } = useFeedback();
  const location = useLocation();

  return (
    <PlayerPhotosProvider>
      <div className="flex min-h-screen flex-col bg-cream dark:bg-canvas-dark">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-[3px] border-ink bg-cream px-4 py-3 dark:border-ink-dark dark:bg-canvas-dark">
          <h1 className="flex items-baseline gap-1.5 font-display text-lg text-ink dark:text-ink-dark">
            Five Crowns
            <span className="font-sans text-xs font-normal text-muted dark:text-muted-dark">v{__APP_VERSION__}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFeedback}
              aria-label="Toggle sound and vibration"
              title="Sound & haptics (off by default)"
              className="nb-press-sm flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink text-ink dark:border-ink-dark dark:text-ink-dark"
            >
              {feedbackEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="nb-press-sm flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink text-ink dark:border-ink-dark dark:text-ink-dark"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <div key={location.pathname} className="animate-page-in">
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/play" replace />} />
              <Route path="/play" element={<Play />} />
              <Route path="/play/new" element={<Play forceNew />} />
              <Route path="/play/:gameId" element={<Play />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:gameId" element={<GameDetail />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/stats/:playerName" element={<PlayerDetail />} />
            </Routes>
          </div>
        </main>

        <BottomNav />
      </div>
    </PlayerPhotosProvider>
  );
}
