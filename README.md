# Typing Wars

Typing Wars is a fast, minimal typing app with two modes:

- Solo typing practice with time, words, and custom-text modes
- Real-time multiplayer race rooms powered by WebSockets

The project is an npm workspace monorepo with a Next.js frontend, a Fastify backend, and a shared package for race event types.

## Features

- Smooth typing interface with animated caret and per-character feedback
- Solo practice modes:
  - `time` with `15 / 30 / 60 / 120`
  - `words` with `10 / 25 / 50 / 100`
  - `custom` text input
- Multiplayer race rooms with:
  - lobby and host controls
  - shared countdown
  - live progress + WPM leaderboard
  - results and rankings
- Theme picker with multiple playful themes
- Health endpoint for deployment monitoring

## Monorepo Structure

```text
typing-wars/
├── apps/
│   ├── web/       # Next.js frontend
│   └── server/    # Fastify + WebSocket backend
├── packages/
│   └── shared/    # shared TypeScript event/types
├── package.json   # npm workspaces root
└── vercel.json
```

## Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Fastify 4, @fastify/websocket, @fastify/cors
- Shared contracts: TypeScript workspace package
- Deployment target: Vercel for web, Railway for server

## Getting Started

### 1. Install dependencies

Run this once from the repo root:

```bash
npm install
```

### 2. Configure environment variables

Frontend defaults to localhost, so this is enough for local development:

`apps/web/.env.local`

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

For the backend, `PORT` and `CLIENT_ORIGIN` are optional locally because the server falls back to:

- `PORT=3001`
- `CLIENT_ORIGIN=http://localhost:3000`

Reference file:

`apps/server/.env.example`

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Run the apps

Start the backend:

```bash
cd apps/server
npm run dev
```

In another terminal, start the frontend:

```bash
cd apps/web
npm run dev
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend health check: [http://localhost:3001/health](http://localhost:3001/health)

## Available Scripts

### Root

```bash
npm install
```

### Web

```bash
cd apps/web
npm run dev
npm run build
npm run start
npm run lint
```

### Server

```bash
cd apps/server
npm run dev
npm run build
npm run start
```

## Multiplayer Race Flow

1. A user clicks `Create race` on the home page.
2. The frontend calls `POST /api/rooms`.
3. The user is redirected to `/race/:roomId`.
4. Players enter their names and join the room over WebSocket.
5. The host configures the race:
   - `time`
   - `words`
   - `custom`
6. The host starts the race.
7. All players receive the same countdown and passage.
8. Progress and WPM update live during the race.
9. Final rankings are shown after completion or timeout.

## Backend API

### Health

`GET /health`

Response:

```json
{
  "status": "ok",
  "running": true
}
```

### Create room

`POST /api/rooms`

Response:

```json
{
  "roomId": "abc123"
}
```

Status:

- `201` on success

### Get room info

`GET /api/rooms/:roomId`

Success response:

```json
{
  "roomId": "abc123",
  "state": "lobby",
  "playerCount": 0
}
```

Not found:

```json
{
  "error": "Room not found"
}
```

### WebSocket

`GET /race/:roomId`

If the room exists, clients can send events like:

```json
{ "type": "join", "name": "Alice" }
{ "type": "start_race" }
{ "type": "keystroke", "progress": 42, "wpm": 83 }
{ "type": "finish", "wpm": 91, "timeMs": 18750 }
```

The server responds with room, countdown, progress, finish, results, and error events defined in `packages/shared/types.ts`.

## Shared Types

`packages/shared/types.ts` contains the contract between frontend and backend:

- room states
- race config
- player shape
- server WebSocket events
- client WebSocket events

This keeps the race protocol consistent across both apps.

## Deployment

### Vercel

The repo is prepared for Vercel with:

- root-level `vercel.json`
- root-level `.npmrc`
- workspace-aware `apps/web/next.config.ts`
- shared path alias in `apps/web/tsconfig.json`

Production env vars for the frontend:

```env
NEXT_PUBLIC_SERVER_URL=https://your-server.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-server.up.railway.app
```

### Railway

Recommended settings:

- Build command: `cd apps/server && npm run build`
- Start command: `cd apps/server && node dist/index.js`
- Root directory: repo root

Production env vars for the backend:

```env
PORT=3001
CLIENT_ORIGIN=https://your-app.vercel.app
```

## Notes

- No authentication is used.
- No database is required.
- Race rooms are in-memory and will reset when the backend restarts.
- The app is optimized for desktop-first usage.

## Verification

Useful checks:

```bash
cd apps/server && npm run build
cd apps/web && npm run lint
cd apps/web && npm run build
curl http://localhost:3001/health
```

## License

Add your preferred license here.
