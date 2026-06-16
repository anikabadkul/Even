# Even

A free web app that builds the best possible 7-day meal plan within a person's grocery budget, and is honest about where a tight budget leaves them short.

## Status

This is the core build: a fully-tested, framework-free domain layer plus a React/Tailwind UI that reproduces the validated prototype (`even_app.html`), works offline as an installable PWA, and meets WCAG 2.2 AA basics (verified with axe-core in the test suite). It runs with zero backend or API keys.

Optional live integration (AI plan generation via OpenAI, xAI's Grok, Groq, or Gemini) sits behind a small server-side proxy — see [Optional integrations](#optional-integrations). Gemini's request/response cycle was verified against the real API (auth succeeded; the test project's free-tier quota was 0, so no plan came back, but the integration and fallback both behaved correctly). OpenAI, xAI, and Groq could not be reached at all from this sandboxed environment's network (those domains are outside its egress allowlist), so they're verified only at the unit-test level (prompt building, response parsing) plus a confirmed-correct fallback chain when a request fails.

API keys are read server-side only (`process.env`, no `VITE_` prefix) by the handlers in `server/`, deployed as serverless functions under `api/`. The browser never sees them — it only calls same-origin `/api/*` routes, which return plain capability flags (`/api/capabilities`) or proxied results. This replaced an earlier client-side design that read keys via `import.meta.env.VITE_*`, which Vite inlines as plaintext into the production JS bundle (confirmed fixed: a production build of this app no longer contains any of the configured secrets).

Not yet built (see the original spec for full scope): optional Supabase accounts, full Spanish translation, and Playwright e2e (browser binaries weren't available in this environment — the same flows are covered by Testing Library + jsdom integration tests instead).

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm test          # domain + UI + a11y tests (vitest)
npm run lint
npm run build     # type-check + production build, generates the PWA
```

## Optional integrations

Copy `.env.example` to `.env` and fill in whichever keys you have; each feature is hidden when its key is absent. None of these need a `VITE_` prefix — they're read by the server proxy, never by the browser.

- `OPENAI_API_KEY`, `XAI_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY` — adds a "Generate my week with AI" button on the Setup screen. Tried in that order (OpenAI → xAI Grok → Groq → Gemini), falling back to the next on any failure, then to the local deterministic assembler. All four providers pick meal ids from the same diet-filtered pool the deterministic assembler uses (shared prompt/response logic in `src/integrations/aiPlan.ts`, provider-specific request code in `server/providers/{openai,xai,groq,gemini}.ts`); the response is validated against real meal ids before being accepted.

For a real deployment, set these same variables in the hosting platform's project settings (e.g. Vercel's dashboard) rather than relying on a committed `.env` file.

## Architecture

- `src/domain/` — pure, framework-free business logic (budget math, nutrition targets, plan assembly, shopping aggregation). No React, no I/O. Exhaustively unit-tested in `tests/unit/`.
- `src/data/` — bundled, offline content: the meal pool, pantry/SKU pricing, and sourced USDA reference numbers (`src/data/references.ts`).
- `src/integrations/` — client-side wrapper that calls the `/api/*` proxy (`aiPlanClient.ts`), plus pure shared logic with no I/O (`aiPlan.ts` prompt/response handling) reused by both the client and the server.
- `server/` — the proxy's actual logic: `server/providers/` holds the provider-specific network code (OpenAI, xAI, Groq, Gemini) reading server-only env vars, `server/handlers/` adapts that into plain Node request handlers, and `server/http.ts` has small (req, res) helpers. Written so the same handler works unmodified as a Vercel serverless function and under Vite's dev server.
- `api/` — thin Vercel serverless function entry points, each just re-exporting a handler from `server/handlers/`. In `npm run dev`, a Vite plugin (`vite.config.ts`) routes the same `/api/*` paths to those handlers directly, so there's one copy of the proxy logic for both environments.
- `src/ui/` — React screens and components, a thin shell over the domain layer.
- `src/state/session.ts` — the single Zustand store for session state (budget, household, diet, the assembled week, swaps, AI-generation status, and the `capabilities` flags fetched once from `/api/capabilities` on app load).
- `tests/unit/` — domain logic and UI flow tests (Vitest + Testing Library).
- `tests/a11y/` — axe-core accessibility checks per screen.

The honest budget model, the floor numbers, and the diet-enforcement test are described in detail in the original product spec.
