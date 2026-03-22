# SideQuest — HooHacks 2026

## Inspiration

We've all been in the situation where you have a free afternoon, you're bored, and you want to do *something* — but nothing comes to mind. Or you're visiting somewhere new and don't know where to start. I wanted to fix that by turning the real world into a game. The idea was simple: what if your phone could hand you a micro-adventure right now, tailored to how you're feeling, grounded in where you actually are?

There's a growing mental health crisis among college students — anxiety, burnout, and loneliness are at record highs. A huge part of that is how passive our downtime has become: we scroll instead of move, consume instead of experience. I wanted to build something that nudges people toward the things that actually make them feel better — getting outside, moving their body, being creative, or just talking to someone new — without it feeling like a chore or a therapy app. SideQuest wraps that in a game because games work: streaks, XP, and rewards make healthy habits sticky in a way that willpower alone doesn't.

I was also thinking about how hard it is to meet people IRL — especially in a college setting where everyone's on their phone anyway. SideQuest flips that: instead of scrolling, you're out doing something. And instead of doing it alone, you might run into someone else doing the same thing.

## What it does

SideQuest is a mobile-first web app that generates personalized, location-based micro-adventures using AI. Here's the core loop:

1. **Tell us your vibe** — pick your mood (energized, burnt out, anxious, bored...), how much time you have, and what you're after (socialize, decompress, explore, get moving)
2. **Get a quest** — Claude generates a unique micro-adventure grounded in real nearby places pulled from Foursquare and OpenStreetMap. Not "go find a coffee shop" — something specific, unexpected, and actually fun
3. **Do it** — head out, complete the quest, snap a photo as proof
4. **Earn XP** — level up, build a daily streak, log your adventures

Special modes include **Mystery Quest**, where you get cryptic clues revealed one at a time instead of full instructions (using hints costs XP), and a **Nearby feed** powered by Supabase that shows quests other people near you are actively doing so you can join them.

## How we built it

- **Frontend**: React + TypeScript + Vite, React Router v6, fully mobile-first
- **AI**: Anthropic Claude (`claude-sonnet-4-6`) via the Anthropic SDK — runs directly in the browser with `dangerouslyAllowBrowser`
- **Location & POIs**: Browser Geolocation API for coordinates, Foursquare Places API v3 for nearby businesses, OpenStreetMap Overpass API for landmarks, parks, and monuments
- **Social layer**: Supabase (Postgres) for the live nearby broadcast feed — anonymous, location-rounded to ~100m for privacy, auto-expires after 3 hours
- **Persistence**: localStorage for all game state (XP, levels, streaks, quest history, photos)
- **Deployment**: Vercel with CI/CD from GitHub

## Challenges we ran into

**Getting quests to actually feel local.** Early versions had Claude just making things up — generic quests that could've been anywhere. We fixed this by fetching real nearby POIs first and forcing Claude to anchor the quest around a specific real place. Even then, Claude kept defaulting to the most famous landmark nearby (UVA's The Lawn kept dominating everything). The solution was a hybrid Foursquare + Overpass pipeline with a random featured POI pre-selected before the prompt is built.

**Category distribution bias.** Claude would return "exploration" for almost every quest regardless of what we asked. We solved this by pre-selecting the category ourselves using weighted random draw (with vibe-aware weights), injecting it into both the system prompt and the user prompt, and then overriding Claude's JSON output with our pre-selected value after parsing.

**Making vibe context actually matter.** Adding mood/time/goal inputs is easy. Making them meaningfully change the output is hard. We built a `VIBE_WEIGHTS` table that maps mood + goal combinations to category probability distributions, moved the vibe context into the system prompt for stronger enforcement, and used the actual selected time duration in the quest constraints.

**Mystery mode UX.** The first version just showed clues one by one with a "reveal" button — nothing stopped you from tapping through all three before leaving the house. We rethought it: clue 1 IS the quest, clues 2-3 are hints that each cost 50 XP. The reward box turns red and decreases live as you use hints.

## Accomplishments that we're proud of

- Someone who's anxious or burnt out gets a quest that actually respects how they're feeling — not the same "go explore!" prompt everyone else gets. That felt important to get right.
- We built a way for strangers in the same area to spontaneously do the same thing together — no accounts, no profiles, no DMs. Just two people both out on a quest, finding each other.
- Mystery mode makes stepping outside feel like an adventure rather than a chore. The XP penalty for hints creates just enough tension to make people actually go outside and figure it out instead of tapping through.
- People who finish a quest have something to show for it — a photo, XP, a streak. It turns a random afternoon into something that feels earned.
- The whole thing runs with zero sign-up required. We wanted zero friction between "I'm bored right now" and "I'm outside doing something."

## What we learned

- Structured JSON output from Claude requires two layers of control: enforcement in the prompt *and* post-parse overrides. Claude will silently violate constraints (like category or difficulty ranges) under prompt pressure — you have to treat the output as untrusted and correct it programmatically.
- Moving vibe context into the system prompt (not just the user message) significantly strengthened enforcement. Claude treats system prompt instructions as higher-priority constraints, so that's where behavioral rules belong.
- We built a `VIBE_WEIGHTS` probability table that maps `(mood, goal)` pairs to category distributions. This let us encode domain knowledge about what people actually want (e.g., anxious + decompress → high weight for creative/physical, low weight for social) without relying on Claude to infer it.
- Haversine distance filtering client-side was simpler and fast enough for our use case — no PostGIS needed. Fetching all non-expired broadcasts from Supabase and filtering in JS kept the backend schema dead simple.
- `dangerouslyAllowBrowser` is fine for a hackathon but exposes the API key in the JS bundle. The real fix is a Vercel Edge Function that proxies the Anthropic call server-side — the client never sees the key.
- localStorage held up surprisingly well as a full game state backend. XP, streaks, quest history, and compressed photo data all lived there across sessions with no issues at this scale.

## Built with

React, TypeScript, Vite, React Router v6, Anthropic Claude API (`claude-sonnet-4-6`), Anthropic TypeScript SDK, Foursquare Places API v3, OpenStreetMap Overpass API, Supabase (Postgres), Browser Geolocation API, localStorage, Vercel, GitHub Actions

## What's next for SideQuest

- **Participant count + meeting point** on the Nearby feed — show how many people are doing a quest nearby and suggest a real landmark to meet at, so strangers can actually find each other
- **Leaderboard** — a lightweight Supabase-backed global leaderboard (username + XP) to add competition
- **Difficulty progression** — as your level increases, bias quest generation toward harder quests
- **Weekly recap sharing** — the recap card is already built; we want to make it shareable to social media as a pixel-art image
- **Server-side quest generation** — move the Anthropic API call to a Vercel Edge Function to protect the API key in production
- **Business partnerships** — local cafes, shops, and gyms could sponsor quests ("grab a free coffee at X after your walk") giving businesses a hyperlocal discovery channel and players a real-world reward for completing quests
