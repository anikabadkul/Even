# Even

A free web app that builds the best possible 7-day meal plan within a person's grocery budget, and is honest about where a tight budget leaves them short.

## Status

This is the core build: a fully-tested, framework-free domain layer plus a React/Tailwind UI that reproduces the validated prototype (`even_app.html`), works offline as an installable PWA, and meets WCAG 2.2 AA basics (verified with axe-core in the test suite). It runs with zero backend or API keys.

Optional live integrations (AI plan generation via Gemini or OpenAI, Kroger pricing/barcode lookup) are wired in behind env vars — see [Optional integrations](#optional-integrations). Gemini's request/response cycle was verified against the real API (auth succeeded; the test project's free-tier quota was 0, so no plan came back, but the integration and fallback both behaved correctly). OpenAI and Kroger could not be reached at all from this sandboxed environment's network (both domains are outside its egress allowlist), so those two are verified only at the unit-test level (prompt building, response parsing, price merging) plus a confirmed-correct fallback when the request fails.

**Security note:** these are client-side `VITE_*` env vars, which Vite inlines as plaintext into the production JS bundle. That's fine for local development, but means anyone who opens devtools on a *deployed* build of this app can read out whatever API keys were used to build it — including ones that cost money to use (OpenAI) or are rate-limited per key (Gemini, Kroger). Don't deploy a public build with real keys baked in; for a real deployment, put these calls behind a small server-side proxy instead so the keys never reach the browser.

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

Copy `.env.example` to `.env` and fill in whichever keys you have; each feature is hidden when its key is absent.

- `VITE_OPENAI_API_KEY` and/or `VITE_GEMINI_API_KEY` — adds a "Generate my week with AI" button on the Setup screen. If both are set, OpenAI is tried first and Gemini is the fallback. Either provider picks meal ids from the same diet-filtered pool the deterministic assembler uses (shared prompt/response logic in `src/integrations/aiPlan.ts`, provider-specific request code in `gemini.ts` / `openai.ts`); the response is validated against real meal ids before being accepted, and any failure (bad key, quota, malformed JSON, unknown id) silently falls back to the next provider, then to the local assembler.
- `VITE_KROGER_CLIENT_ID` / `VITE_KROGER_CLIENT_SECRET` — adds a ZIP code field and "Use live prices" button on the shopping list, which overrides the static pantry pricing with live per-item prices from the nearest Kroger-family store (`src/integrations/kroger.ts`, OAuth2 client-credentials flow). The same module backs "Scan a barcode to check a price," which looks up a UPC against Kroger's product catalog at that store — there's no camera/scanner UI, just manual UPC entry, since Kroger's product API can resolve a UPC directly.

## Architecture

- `src/domain/` — pure, framework-free business logic (budget math, nutrition targets, plan assembly, shopping aggregation). No React, no I/O. Exhaustively unit-tested in `tests/unit/`.
- `src/data/` — bundled, offline content: the meal pool, pantry/SKU pricing, and sourced USDA reference numbers (`src/data/references.ts`).
- `src/integrations/` — optional live API clients (Gemini, OpenAI, Kroger), each gated behind an env var and falling back to the offline domain layer on any error.
- `src/ui/` — React screens and components, a thin shell over the domain layer.
- `src/state/session.ts` — the single Zustand store for session state (budget, household, diet, the assembled week, swaps, live-integration status).
- `tests/unit/` — domain logic and UI flow tests (Vitest + Testing Library).
- `tests/a11y/` — axe-core accessibility checks per screen.

The honest budget model, the floor numbers, and the diet-enforcement test are described in detail in the original product spec.
