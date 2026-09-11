# PWA-Product-Catalog

A mobile-first, offline-first B2B product catalog and quotation PWA for supplier sales representatives.

## Current status

**Technical MVP deployed; release verification pending.** The app provides local catalog import, IndexedDB persistence, quote snapshots, branded PDF generation, English/Mandarin/Malay/Vietnamese/Japanese UI, PWA runtime behavior, and Pages CI. Live URL: https://yapweijun1996.github.io/PWA-Product-Catalog/. It is not release-ready until real supplier/business inputs and final PDF acceptance are complete.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run preview
```

The Vite base path is `/PWA-Product-Catalog/`. Durable catalog, quote, settings, and logo data stays in IndexedDB; the Service Worker only handles same-origin `GET` requests. The PDF generator is loaded on demand to keep the initial mobile bundle smaller. The production deployment uses GitHub Actions run 5 (`34595922906`); the deployed update path was verified from version `0.1.0` to `0.1.1`, including Web Share fallback coverage.

## Documentation

- [DESIGN.md](DESIGN.md) — product UX, architecture boundaries, PWA/offline decisions, and design rationale.
- [SPEC.md](SPEC.md) — functional, data, non-functional, and acceptance requirements.
- [EPIC.md](EPIC.md) — epics, dependencies, and exit evidence.
- [ROADMAP.md](ROADMAP.md) — evidence-gated implementation phases.
- [TASK.md](TASK.md) — current task ledger, blockers, and next action.
- [GOAL.md](GOAL.md) — durable completion contract and iteration rules.
- [PROGRESS.md](PROGRESS.md) — evidence-backed progress and current blockers.
- [GOAL_PROMPT.md](GOAL_PROMPT.md) — compact assignable goal prompt (under 2,000 characters).

## Intended MVP flow

```text
Import catalog -> search products -> build quote -> export PDF -> share/download -> reopen offline
```

The MVP is local-only. Cloud sync, collaboration, payments, live stock, ERP integration, and AI are deferred until a real supplier validates the local workflow.
