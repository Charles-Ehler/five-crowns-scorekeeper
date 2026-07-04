import { useLocation, Route, Routes } from 'react-router-dom';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import BottomNav from './components/BottomNav.jsx';
import NewGame from './pages/NewGame.jsx';
import CurrentGame from './pages/CurrentGame.jsx';
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
      <div className="ruled-paper flex min-h-screen flex-col bg-paper dark:bg-chalk-board">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-red-ink/40 bg-paper/90 px-4 py-3 backdrop-blur dark:bg-chalk-board/90">
          <h1 className="flex items-baseline gap-1.5 font-display text-xl text-ink dark:text-chalk">
            Five Crowns
            <span className="font-sans text-xs font-normal text-ink-faint dark:text-chalk-faint">v{__APP_VERSION__}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFeedback}
              aria-label="Toggle sound and vibration"
              title="Sound & haptics (off by default)"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-line text-ink-soft transition-colors hover:bg-paper-raised dark:border-chalk-board-line dark:text-chalk-soft dark:hover:bg-chalk-board-raised"
            >
              {feedbackEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-line text-ink-soft transition-colors hover:bg-paper-raised dark:border-chalk-board-line dark:text-chalk-soft dark:hover:bg-chalk-board-raised"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <div key={location.pathname} className="animate-page-in">
            <Routes location={location}>
              <Route path="/" element={<NewGame />} />
              <Route path="/game" element={<CurrentGame />} />
              <Route path="/game/:gameId" element={<CurrentGame />} />
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
