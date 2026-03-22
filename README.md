# SideQuest

A mobile-first micro-adventure app that generates personalized, location-based quests using AI. Roll a quest, complete it in the real world, snap a photo as proof, and earn XP.

Built at HooHacks 2026.

---

## What it does

- Detects your location and fetches real nearby places (via Foursquare + OpenStreetMap)
- Asks how you're feeling, how much time you have, and what you're in the mood for
- Generates a unique micro-adventure tailored to your vibe and surroundings using Claude
- Tracks XP, levels, and daily streaks as you complete quests

## Stack

- React + TypeScript + Vite
- React Router v6
- Anthropic SDK (`claude-sonnet-4-6`)
- Foursquare Places API v3 + OpenStreetMap Overpass API
- localStorage for all persistence (no backend)
- Deployed on Vercel

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Minal-Arunashalam/sidequest.git
cd sidequest
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_FOURSQUARE_API_KEY=...
```

- Anthropic API key: [console.anthropic.com](https://console.anthropic.com)
- Foursquare API key: [foursquare.com/developer](https://foursquare.com/developer) — free tier works

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser (mobile view recommended).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Yes | Anthropic API key for quest generation |
| `VITE_FOURSQUARE_API_KEY` | Yes | Foursquare Places API key for nearby POIs |

## Features

- **Vibe picker** — choose your mood, available time, and goal before rolling
- **AI quest generation** — each quest is grounded in real nearby places
- **Category variety** — social, creative, exploration, and physical quests weighted by vibe
- **Reroll** — don't like a quest? Roll again with anti-repeat logic
- **Photo proof** — snap a photo to complete and log a quest
- **XP + levels** — earn XP per quest, level up with a title system
- **Daily streaks** — complete at least one quest per day to build your streak
- **Quest log** — scrollable history of all completed adventures
