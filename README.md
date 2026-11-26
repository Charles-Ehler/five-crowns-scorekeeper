# Five Crowns Scorekeeper

A real-time score keeper for the card game Five Crowns. React + Tailwind + Firebase Firestore, deployed to GitHub Pages.

## Design

**Card table, bold.** Flat color blocks, no glass or gradients. Each round's header is a solid block in that round's suit color, and every player at the table gets their own seat color (5 suit colors plus violet and tangerine, never repeated in one game). Gold is reserved for crowns and winners. Type is Outfit (headings, numbers) over Rubik (body). Built iPad-portrait first; score entry uses the app's own number pad, so the iPad keyboard never opens.

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

Wild rank, cards dealt, and dealer are all derived from the round number, nothing extra is stored for them. Scoring logic lives in `src/lib/fiveCrowns.js`, `games.js`, and `stats.js`.

## Database rules

`firestore.rules` only allows writes shaped like the app's own, and protects the family's stats: a finished game can't be deleted, emptied, or lose players (scores can still be corrected). Only unfinished games can be deleted. Player records can't be deleted.

Pushing to GitHub does not publish rules. Publish them from this folder:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project "$(grep VITE_FIREBASE_PROJECT_ID .env | cut -d= -f2)"
```

There's no sign-in, so rules can't tell this app apart from anyone else holding the public config. The full "only this app" lock is Firebase App Check (reCAPTCHA v3 for the web), which needs a site key from the Firebase console. Turning on App Check enforcement also blocks plain Node scripts, including the backup script.

`scripts/firestore-rules.test.mjs` checks the rules against a backup in the local emulator (instructions at the top of the file). To try the app itself against the emulator, run `npm run dev -- --mode emulator` with `VITE_USE_EMULATOR=1` and `VITE_FIREBASE_PROJECT_ID=demo-five-crowns` in `.env.emulator.local`, against `firebase emulators:start --only firestore`.
