# Five Crowns Scorekeeper

A real-time score keeper for the card game Five Crowns. React + Tailwind + Firebase Firestore, deployed to GitHub Pages.

## Design

**Scorepad** — the app reads like a well-loved paper scorepad: cream ledger paper in light mode, a chalkboard flip-side in dark mode, hand-lettered round labels (Kalam) over clean tabular data (Inter/JetBrains Mono).

## Setup

```bash
npm install
cp .env.example .env   # fill in your Firebase project's web config
npm run dev
```

Deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`. That workflow reads the same `VITE_FIREBASE_*` values from repo secrets (Settings → Secrets and variables → Actions).

## Data model

`fiveCrowns_games/{gameId}`
- `players`: `{ id, name }[]`, turn/dealer order, locked at game start
- `rounds`: `{ roundNumber, scores: { [playerId]: { score, wentOut } } }[]`
- `currentRound`, `status` (`in_progress` | `complete`), `winnerIds`, timestamps

`fiveCrowns_players/{playerId}`
- `name`, `lastUsedAt`, `photoUrl`

Wild rank, cards dealt, and dealer are all derived from the round number — nothing extra is stored for them. Scoring logic lives in `src/lib/fiveCrowns.js`, `games.js`, and `stats.js`.
