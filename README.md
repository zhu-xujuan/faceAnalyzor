# FaceAnalyzor

Next.js (App Router) starter for a camera-based UI + future AI face-attitude analysis.

## Structure

- `src/app/page.tsx` camera UI entry
- `src/features/camera/*` camera + polaroid logic
- `src/app/api/face/analyze/route.ts` AI analyze API stub
- `public/polaroid.mp3`, `public/prompts.json` static assets
- `legacy/index.html` previous single-file prototype

## Dev

```bash
corepack enable
pnpm i
pnpm dev
```

Open `http://localhost:3000`.
# faceAnalyzor
