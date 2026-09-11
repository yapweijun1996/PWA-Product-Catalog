# PWA-Product-Catalog Task Ledger

**Status:** Technical MVP baseline implemented; release verification pending
**Last verified:** 2026-09-11
**Repository baseline:** Release implementation commit `d5930eb` is deployed through GitHub Pages; subsequent documentation-only commits remain synchronized with `origin/main`.

Statuses: `Done`, `Implemented`, `In progress`, `Ready`, `Not started`, `Blocked`, `Deferred`.
`Done` means the stated evidence exists; it does not mean production release readiness.

## Completed

| ID | Task | Evidence |
|---|---|---|
| PWA-000 | Initialize repository | `git status`, `git log`, and `git branch -vv` recorded the original `91b91c7` documentation-only baseline and the subsequent release commits; the repository is synchronized with `origin/main`. |
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
| PWA-061 | Implement client-side PDF generation | `src/pdf.tsx`, dynamic PDF chunk, bundled Noto Sans SC WOFF, valid-PDF browser test, multi-page test, five-locale export-path test, PDF download setup-failure injection preserving the draft, and manual rendered CJK check; a deployed synthetic branded PDF was visually inspected for layout and totals. |
| PWA-070 | Add manifest and reviewed icons | `public/favicon.svg` is the canonical icon; UI glyphs use inline SVG, manifest includes the SVG plus PNG compatibility sizes, and the install prompt was observed in Chromium. |
| PWA-071 | Implement owned versioned Service Worker | `public/sw.js`, GET/same-origin contract test, cache cleanup, offline fallback, and warmed offline browser reload. |
| PWA-072 | Implement waiting-worker Update Now/Later flow | Deployed browser verification loaded `0.1.0`, detected waiting version `0.1.1`, confirmed Later left the worker waiting, and confirmed Update Now activated the worker and reloaded without silently updating. |
| PWA-073 | Verify IndexedDB data survives SW updates | After the deployed update, browser IndexedDB read-back found 6 products, 1 catalog version, 1 quote, 1 quote line, 1 settings record, preserved company/customer values, and a stored logo; cache cleanup left only `pwa-product-catalog-shell-2a7d766`. |
| PWA-062 | Implement share and fallback actions | `tests/e2e/catalog.spec.ts` covers supported Web Share, unsupported download fallback, and cancelled sharing; all three paths pass locally. |
| PWA-080 | Add GitHub Actions Pages workflow | `.github/workflows/deploy-pages.yml` uses lockfile install, type/unit/browser/build gates, artifact upload, and Pages deployment; GitHub Actions run 10 (`34600730823`) passed for `d5930eb`, followed by documentation redeployments in runs 11 (`34601321451`) and 12 (`34602091645`). |
| PWA-081 | Verify deployed Pages artifact | GitHub Actions run 10 (`34600730823`) passed and runs 11 (`34601321451`) and 12 (`34602091645`) redeployed the synchronized artifact; fresh-browser checks verified https://yapweijun1996.github.io/PWA-Product-Catalog/ over HTTPS, including shell, manifest, Service Worker, canonical SVG/PNG icons, hashed assets, scoped registration, deployed version `0.1.1`, and warmed offline reload. |
| PWA-041 | Modularize UI layout, persistent bottom quote bar, and mobile touch ergonomics | Component and i18n modularization (`src/features/*`, `src/components/*`, `src/i18n/*`); persistent bottom quote bar (`FloatingQuoteBar`), mobile bottom navigation dock, search clear action, category item counts, quantity steppers (`QuantityStepper` with 44px+ touch targets), and sample previews in import mapping. Verified by Vitest (16/16) and Playwright E2E (`interacts with search clear, persistent bottom quote bar, and quantity stepper`). |
| PWA-042 | Product card visual avatars and customer autocomplete quick-pills | Deterministic category monogram avatars with industrial tint palettes on product cards and detail modal; customer name autocomplete (`<datalist>`) and recent customer quick-selection chips in quote editor. Verified by Vitest and Playwright E2E. |
| PWA-012 | Add synthetic representative supplier-shaped fixtures | CSV and JSON fixtures (`tests/fixtures/realistic-supplier-catalog.csv`, `tests/fixtures/realistic-supplier-catalog.json`) exercise multi-attribute specifications (`Material Grade`, `Operating Rating`, `Certification`, `Lead Time`), tiered units, and formal commercial terms without claiming real supplier acceptance. Verified by `tests/supplier-integration.test.ts` and Playwright E2E. |

## In progress / partial proof

| ID | Task | Current evidence | Missing proof |
|---|---|---|---|
| PWA-030 | Implement versioned Dexie/IndexedDB schema | `src/db.ts` has schema version 1 and durable tables; persistence tests pass. | Future migration path and migration-specific tests. |

## Blocked by product or release inputs

| ID | Task | Blocker / unblock action |
|---|---|---|
| PWA-010 | Obtain real supplier fixture and quote template | Provide a redacted representative CSV/JSON/XLSX, expected fields, a quote sample, and legal wording; current fixtures are synthetic only. |
| PWA-011 | Confirm MVP product decisions | Confirm currency, tax, discount, quantity precision, image policy, language, terms, and XLSX priority; current USD/9% test values are synthetic assumptions. |
| PWA-061B | Final PDF acceptance | Provide final production branding assets, custom legal layout, and stakeholder acceptance sign-off. |

## Deferred

| ID | Task | Reason |
|---|---|---|
| PWA-034 | XLSX import adapter | Separate adapter after supplier workbook and MVP-priority decision. |
| PWA-090 | Cloud sync, collaboration, payments, ERP, live stock, AI | Explicitly outside the local-only static MVP; requires separate product, security, and operations decisions. |

## Verification record

- `npm run typecheck`: passed.
- `npm test`: passed, **16 tests** across domain, importer, IndexedDB, PWA contract, and supplier-shaped integration suites.
- `npm run test:e2e`: passed, **14 browser tests** covering installable shell, five-locale selection with English default, first run/search/quote, CSV import, warmed offline reload, PDF download setup-failure draft preservation, valid PDF output, multi-page PDF output, persistent floating quote bar/search clear/stepper interactions, and product avatars/customer pills/representative supplier-shaped catalog import.
- `npm run build`: passed; the PDF renderer is code-split, with a remaining large deferred PDF chunk warning.
- Local production preview: shell, manifest, `sw.js`, project subpath, CJK PDF rendering, and mobile interaction inspected.
- Lighthouse mobile on local preview: Accessibility **100**, Best Practices **100**, SEO **100**; no failing audits.
- `npm audit --omit=dev`: **0 vulnerabilities**. Full audit reports two moderate dev-only Vitest-chain advisories; upgrading requires a breaking Vitest major and was not applied.
- GitHub Actions run 10 (`34600730823`): **passed** — verify and deploy jobs succeeded for commit `d5930eb`.
- GitHub Actions run 11 (`34601321451`): **passed** — the synchronized documentation commit was verified and redeployed.
- GitHub Actions run 12 (`34602091645`): **passed** — the current documentation synchronization was verified and redeployed.
- Deployed HTTPS verification: **passed** — shell, manifest, Service Worker, icons, hashed assets, scoped registration, version `0.1.1`, and warmed offline reload were verified at https://yapweijun1996.github.io/PWA-Product-Catalog/; deployed Lighthouse mobile scores were Accessibility **100**, Best Practices **100**, SEO **100**, Agentic Browsing **100**.
- Deployed current `d5930eb` browser verification: **passed** — the page loaded `index-D3bksFho.js`, `sw.js` reported `d5930eb`, the app exposed 6 product avatars and the floating quote dock, explicit Update Now activated the waiting `v0.1.1` worker, cache cleanup left only `pwa-product-catalog-shell-d5930eb`, and offline reload retained 6 products plus the quote and line.
- Deployed update/data-survival verification: **passed** — a `0.1.0` client showed waiting `0.1.1`, Later preserved the prompt state, Update Now activated the new worker, and IndexedDB/catalog/quote/settings/logo data remained present after reload.

## Current next action

Obtain the redacted supplier fixture and quotation acceptance sample; complete final PDF acceptance, exact renderer-failure, and remaining migration-specific checks. Do not claim release completion until final PDF and real-input evidence are recorded.

## Documentation maintenance rule

After each implementation slice, update the affected requirement/task status with exact files, commands, browser/PDF/deployment results, limitations, and rollback/recovery notes. Never convert `Proposed`, `Ready`, or `Implemented` into `Done` from prose alone.
