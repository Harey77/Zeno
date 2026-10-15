# Zeno
Your Saving and financial pocket bot which helps you to reach your goals in reality instead of just making you day dream and buy online courses

Educational financial-planning simulator for beginners in India. 13 pages, no backend: everything runs in the browser and saves to localStorage (`zeno:v1`).

Stack: Next.js 16 (static export), React 19, Tailwind 4, Three.js / React Three Fiber, Motion, lucide-react. Fonts: Space Grotesk + Inter. Charts are hand-written SVG.

## Features
- Goal preview with a live ₹ input, Three.js particle background, dark/light theme
- Money Snapshot and expense tracker
- Compare 5 pathways: savings, FDs, mutual funds/SIPs, gold, stocks/ETFs
- Plan Builder with preset, single-asset, combination or custom (must total 100%) allocations, then a personalised dashboard
- 3D crash simulator, Life Happens stress test, ₹500-more comparison, stock reader with practice mode
- On-device guide that answers in three parts: plain explanation, ₹ example from your numbers, risks
- English, Hindi, Marathi, Gujarati, Tamil and Bengali

Educational only: not investment advice, and not a SEBI-registered adviser.

**Live:** https://harey77.github.io/Zeno/

## Deploy (GitHub Pages)
Every push to `main` builds the site and publishes it via `.github/workflows/deploy.yml`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**. The workflow sets
`PAGES_BASE_PATH=/<repo name>` so assets resolve under `/Zeno/`.

## Run locally
    npm install
    npm run dev          # http://localhost:3000

## Static build
    npm run build        # writes ./out
    npx serve out        # any static host works (Vercel, Netlify, GitHub Pages)

## Where things live
- `src/app/<route>/view.tsx`: each page (home, login, budget, compare, planner, save-more, stocks, risk, life, dashboard, learn, quiz, glossary)
- `src/lib/finance.ts`: projection, break-even and goal-timeline maths
- `src/lib/allocation.ts`: presets, combinations and custom asset mixes for the plan and dashboard
- `src/lib/advisor.ts`: the guide's topics and calculations
- `src/lib/i18n.tsx`: translations
- `src/lib/content.ts`: glossary, options, quiz, resources
- `src/lib/store.tsx`: localStorage state, export/import/reset
