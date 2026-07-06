import { Navigate, useLocation, Route, Routes } from 'react-router-dom';
import { Crown, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
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
      <div className="flex h-screen flex-col bg-parchment dark:bg-ink-deep">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-parchment-line bg-parchment/95 px-4 py-3 backdrop-blur dark:border-ink-line dark:bg-ink-deep/95">
          <h1 className="flex items-baseline gap-1.5 font-display text-base uppercase tracking-widest text-ink dark:text-cream">
            <Crown size={18} className="mb-0.5 text-gold" fill="currentColor" />
            Five Crowns
            <span className="font-sans text-xs font-normal normal-case tracking-normal text-muted dark:text-muted-dark">v{__APP_VERSION__}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFeedback}
              aria-label="Toggle sound and vibration"
              title="Sound & haptics (off by default)"
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream"
            >
              {feedbackEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream"
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
