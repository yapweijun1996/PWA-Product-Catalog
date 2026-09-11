# PWA-Product-Catalog Task Ledger

**Status:** Technical MVP baseline implemented; release verification pending
**Last verified:** 2026-09-11
**Repository baseline:** `42c1a76` contains the committed local implementation and is one commit ahead of `origin/main`; it is not yet deployed.

Statuses: `Done`, `Implemented`, `In progress`, `Ready`, `Not started`, `Blocked`, `Deferred`.
`Done` means the stated evidence exists; it does not mean production release readiness.

## Completed

| ID | Task | Evidence |
|---|---|---|
| PWA-000 | Initialize repository | `git status`, `git log`, and `git branch -vv` confirm `main` at `42c1a76`, ahead of `origin/main` by one commit; the original `91b91c7` baseline was documentation-only. |
| PWA-001 | Record proposed product and UX direction | Project KB item `c8463d7b-582f-466d-abaa-416be7fe9700`, status `Proposed`. |
| PWA-002 | Inspect repository source of truth before planning | Baseline contained only `.gitattributes`. |
| PWA-003 | Create aligned documentation baseline | `DESIGN.md`, `SPEC.md`, `EPIC.md`, `ROADMAP.md`, and this ledger were aligned. |
| PWA-004 | Add durable goal, progress, and assignment prompt | `GOAL.md`, `PROGRESS.md`, and `GOAL_PROMPT.md` define completion, evidence, blockers, and iteration rules. |
| PWA-020 | Scaffold Vite + TypeScript + test harness | `package.json`, `package-lock.json`, TypeScript/Vite/Vitest/Playwright config; `npm run typecheck`, `npm test`, and `npm run build` pass. The UI locale layer supports English (default), Mandarin Simplified Chinese, Malay, Vietnamese, and Japanese. |
| PWA-021 | Establish Pages base path and static routing | Local preview returns the shell at `/PWA-Product-Catalog/`; browser tests pass under the same project path. |
| PWA-031 | Implement CSV/JSON mapping and validation | `src/importer.ts`, synthetic fixtures, 3 importer unit tests, and a browser CSV flow cover mapping, errors, duplicates, and valid rows. |
| PWA-032 | Commit imports atomically as catalog versions | `src/db.ts` transaction and atomic replacement regression test pass. |
| PWA-033 | Implement JSON backup and restore | `src/backup.ts` plus IndexedDB tests cover valid restore and malformed format rejection. |
| PWA-040 | Implement search, filters, cards, and product detail | Catalog UI, product-detail dialog, empty/no-result states, mobile screenshot, browser flow, and Lighthouse accessibility score 100. |
| PWA-050 | Implement money, quantity, tax, and discount rules | `src/domain.ts` and pricing/validation tests cover minor units, percentage bounds, quantity precision, tax, and discount. |
| PWA-051 | Implement quote cart and persistence | Add/edit/remove/quote persistence code plus browser quote flow and IndexedDB tests. |
| PWA-052 | Implement immutable quote-line snapshots | Snapshot persistence test proves later catalog price edits do not change the saved line price. |
| PWA-060 | Implement company branding settings | Local settings form persists company, contact, currency, tax, language, and bounded logo data URL. |
| PWA-061 | Implement client-side PDF generation | `src/pdf.tsx`, dynamic PDF chunk, bundled Noto Sans SC WOFF, valid-PDF browser test, multi-page test, and manual rendered CJK check. |
| PWA-070 | Add manifest and reviewed icons | `public/favicon.svg` is the canonical icon; UI glyphs use inline SVG, manifest includes the SVG plus PNG compatibility sizes, and the install prompt was observed in Chromium. |
| PWA-071 | Implement owned versioned Service Worker | `public/sw.js`, GET/same-origin contract test, cache cleanup, offline fallback, and warmed offline browser reload. |
| PWA-080 | Add GitHub Actions Pages workflow | `.github/workflows/deploy-pages.yml` uses lockfile install, type/unit/browser/build gates, artifact upload, and Pages deployment. |

## In progress / partial proof

| ID | Task | Current evidence | Missing proof |
|---|---|---|---|
| PWA-030 | Implement versioned Dexie/IndexedDB schema | `src/db.ts` has schema version 1 and durable tables; persistence tests pass. | Future migration path and migration-specific tests. |
| PWA-062 | Implement share and fallback actions | `shareQuotePdf()` uses Web Share when file sharing is supported and otherwise downloads; explicit UI actions exist. | Browser coverage for supported share, unsupported fallback, and cancellation. |
| PWA-072 | Implement waiting-worker Update Now/Later flow | Waiting worker is not skipped automatically; the prompt reads the waiting Service Worker semantic version and shows it with Now/Later actions; controller reload is guarded. | Simulated waiting-worker browser test and data-survival check. |
| PWA-073 | Verify IndexedDB data survives SW updates | IndexedDB ownership is separate from cache cleanup by design. | A real simulated worker update with catalog, quote, settings, and logo read-back. |

## Blocked by product or release inputs

| ID | Task | Blocker / unblock action |
|---|---|---|
| PWA-010 | Obtain real supplier fixture and quote template | Provide a redacted representative CSV/JSON/XLSX, expected fields, a quote sample, and legal wording. |
| PWA-011 | Confirm MVP product decisions | Confirm currency, tax, discount, quantity precision, image policy, language, terms, and XLSX priority. |
| PWA-061B | Final PDF acceptance | Provide final branding assets, quote layout, legal terms, and a representative acceptance quote. |
| PWA-081 | Verify deployed Pages artifact | The implementation is committed as `42c1a76`; push it, run Actions, then verify the actual HTTPS Pages URL in a clean browser. |

## Deferred

| ID | Task | Reason |
|---|---|---|
| PWA-034 | XLSX import adapter | Separate adapter after supplier workbook and MVP-priority decision. |
| PWA-090 | Cloud sync, collaboration, payments, ERP, live stock, AI | Explicitly outside the local-only static MVP; requires separate product, security, and operations decisions. |

## Verification record

- `npm run typecheck`: passed.
- `npm test`: passed, **13 tests** across domain, importer, IndexedDB, and PWA contract suites.
- `npm run test:e2e`: passed, **7 browser tests** covering installable shell, five-locale selection with English default, first run/search/quote, CSV import, warmed offline reload, valid PDF output, and multi-page PDF output.
- `npm run build`: passed; the PDF renderer is code-split, with a remaining large deferred PDF chunk warning.
- Local production preview: shell, manifest, `sw.js`, project subpath, CJK PDF rendering, and mobile interaction inspected.
- Lighthouse mobile on local preview: Accessibility **100**, Best Practices **100**, SEO **100**; no failing audits.
- `npm audit --omit=dev`: **0 vulnerabilities**. Full audit reports two moderate dev-only Vitest-chain advisories; upgrading requires a breaking Vitest major and was not applied.

## Current next action

Push `42c1a76`, run the Pages workflow, and verify the deployed HTTPS subpath. Obtain the redacted supplier fixture and quotation acceptance sample in parallel. Do not claim release completion until production HTTPS, update-flow, final PDF, and real-input evidence are recorded.

## Documentation maintenance rule

After each implementation slice, update the affected requirement/task status with exact files, commands, browser/PDF/deployment results, limitations, and rollback/recovery notes. Never convert `Proposed`, `Ready`, or `Implemented` into `Done` from prose alone.
