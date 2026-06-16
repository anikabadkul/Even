# Even

A free web app that builds the best possible 7-day meal plan within a person's grocery budget, and is honest about where a tight budget leaves them short.

## Status

This is the core build: a fully-tested, framework-free domain layer plus a React/Tailwind UI that reproduces the validated prototype (`even_app.html`), works offline as an installable PWA, and meets WCAG 2.2 AA basics (verified with axe-core in the test suite). It runs with zero backend or API keys.

Not yet built (see the original spec for full scope): optional Supabase accounts, live Gemini plan generation, live Kroger pricing, barcode lookup, full Spanish translation, and Playwright e2e (browser binaries weren't available in this environment — the same flows are covered by Testing Library + jsdom integration tests instead).

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm test          # domain + UI + a11y tests (vitest)
npm run lint
npm run build     # type-check + production build, generates the PWA
```

## Architecture

- `src/domain/` — pure, framework-free business logic (budget math, nutrition targets, plan assembly, shopping aggregation). No React, no I/O. Exhaustively unit-tested in `tests/unit/`.
- `src/data/` — bundled, offline content: the meal pool, pantry/SKU pricing, and sourced USDA reference numbers (`src/data/references.ts`).
- `src/ui/` — React screens and components, a thin shell over the domain layer.
- `src/state/session.ts` — the single Zustand store for session state (budget, household, diet, the assembled week, swaps).
- `tests/unit/` — domain logic and UI flow tests (Vitest + Testing Library).
- `tests/a11y/` — axe-core accessibility checks per screen.

The honest budget model, the floor numbers, and the diet-enforcement test are described in detail in the original product spec.
