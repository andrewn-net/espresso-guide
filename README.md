# Espresso Guide

A React app for exploring espresso-based drink recipes, dialing in ratios, saving brew profiles, and (optionally) analyzing extraction videos with Google Gemini through a server-side API so your API key stays off the client.

## Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Dial-in</strong><br />
      <img src="./assets/readme/01%20dial-in.jpg" alt="Dial-in — espresso parameters and drink builder" width="280" />
    </td>
    <td align="center" width="50%">
      <strong>Record shot</strong><br />
      <img src="./assets/readme/02%20record%20shot.jpg" alt="Record shot — video analysis for extraction feedback" width="280" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Brew profiles</strong><br />
      <img src="./assets/readme/03%20brew%20profiles.jpg" alt="Brew profiles — saved presets and optional cloud sync" width="280" />
    </td>
    <td align="center">
      <strong>Recipes</strong><br />
      <img src="./assets/readme/04%20recipes.jpg" alt="Recipes — drink carousel and recipes" width="280" />
    </td>
  </tr>
</table>

## Features

- **Recipes** — Browse drink definitions with doses, yields, and steps.
- **Dial-in** — Adjust espresso parameters and milk components with live totals.
- **Shot analysis** — Upload a shot video; the client extracts frames and calls a Vercel serverless function that uses the Gemini API.
- **Brew profiles** — Save presets locally; optional Supabase auth and cloud sync when configured.

## Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4
- Zustand (state + persistence)
- Supabase JS client (optional)
- `@google/generative-ai` on the server (`api/analyze.ts`)

## Prerequisites

- Node.js 20+ recommended
- npm (or another compatible package manager)

## Setup

```bash
npm install
```

Copy the environment template and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `VITE_SUPABASE_URL` | Client | Supabase project URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon/public key (optional) |
| `GEMINI_API` | **Server only** (Vercel env or `vercel dev`) | Google AI API key for shot analysis |

Without Supabase variables, the app still runs; sync features are disabled. Without `GEMINI_API`, analysis requests fail until the key is set where the `/api/analyze` route runs.

**Do not** use a `VITE_`-prefixed variable for the Gemini key — Vite would embed it in the browser bundle.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npx vitest` | Unit tests (Vitest) |

### Local API routes (shot analysis)

Plain `npm run dev` serves the Vite app; `/api/analyze` is implemented for Vercel. To exercise the full flow locally, use the Vercel CLI with `GEMINI_API` set (e.g. in `.env.local`):

```bash
npm i -g vercel
vercel dev
```

## Deploy (Vercel)

1. Connect the repo and deploy.
2. Set `GEMINI_API` in the project’s Environment Variables for Production (and Preview if needed).
3. Optionally set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client-side Supabase.

## Security notes for maintainers

- No `.env` files are committed (see `.gitignore`).
- Treat `GEMINI_API` as a secret; rotate it if it was ever exposed.
- The Supabase **anon** key is designed to be public in the client with Row Level Security enforced in your Supabase project — verify RLS policies before going public.
