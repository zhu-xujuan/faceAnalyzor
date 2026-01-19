# FaceAnalyzor

Next.js (App Router) starter for a camera-based UI + future AI face-attitude analysis.

## Structure

- `src/app/page.tsx` camera UI entry
- `src/features/camera/*` camera + polaroid logic
- `src/app/api/face/analyze/route.ts` AI analyze API stub
- `src/app/api/visitor/insight/route.ts` Groq-powered visitor insight (self-report)
- `public/polaroid.mp3`, `public/prompts.json` static assets
- `legacy/index.html` previous single-file prototype

## Dev

```bash
corepack enable
pnpm i
pnpm dev
```

Open `http://localhost:3000`.

## Env

Create `.env.local` and set `GROQ_API_KEY` (see `.env.example`).
# faceAnalyzor
