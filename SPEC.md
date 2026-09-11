# PWA-Product-Catalog Specification

**Status:** Technical MVP foundation implemented; acceptance incomplete
**Last verified:** 2026-09-11
**Current implementation:** Commit `2a7d766` contains the Vite/React/TypeScript source, Dexie persistence, CSV/JSON import, quote pricing/snapshots, backup/restore, five-locale settings, PDF export/share fallback, manifest/icons, owned Service Worker, browser tests, and Pages workflow. The Pages deployment and update path are verified at https://yapweijun1996.github.io/PWA-Product-Catalog/. Real supplier validation and several release proofs remain open.
**Control documents:** `GOAL.md` defines completion; `PROGRESS.md` records evidence-backed status; `TASK.md` records executable work.

## 1. Scope

Build a static, installable, mobile-first PWA for supplier sales representatives to maintain a local product catalog and create branded quotations offline.

### In scope for the MVP

- local catalog import from CSV and JSON;
- validated column mapping and atomic import;
- product search, category filtering, and detail view;
- local quote drafts and quote history;
- quantity, discount, tax, subtotal, and total calculation;
- quote line snapshots;
- company branding and logo;
- client-side PDF export;
- optional Web Share with download/copy fallback;
- IndexedDB persistence;
- Service Worker shell caching;
- install prompt and explicit update flow;
- GitHub Pages deployment;
- English (default), Mandarin Simplified Chinese, Malay, Vietnamese, and Japanese UI.

### Deferred

- XLSX support is tracked as the next import adapter unless real supplier input makes it MVP-critical.
- cloud synchronization, multi-user collaboration, payments, live stock, ERP integration, and AI-assisted features are post-MVP.

## 2. Functional requirements

### FR-CAT: Catalog

- **FR-CAT-01:** A user can import a complete CSV or JSON catalog.
- **FR-CAT-02:** Required fields and mapped fields are validated before persistence.
- **FR-CAT-03:** The user sees row number, field, and actionable reason for each import error.
- **FR-CAT-04:** A failed import cannot leave a partial active catalog.
- **FR-CAT-05:** A user can search by product name, SKU, category, and configured searchable fields.
- **FR-CAT-06:** A user can filter by category and applicable product fields.
- **FR-CAT-07:** A product detail view shows all imported specifications and the current local price.
- **FR-CAT-08:** Catalog provenance includes import time, source filename, and catalog version.

### FR-QUOTE: Quotation

- **FR-QUOTE-01:** A user can add a product to a draft quote from search results or detail.
- **FR-QUOTE-02:** A user can edit quantity, line discount, quote discount, and tax according to configured rules.
- **FR-QUOTE-03:** Totals are deterministic and use integer minor currency units where possible; decimal quantities must have an explicit precision rule.
- **FR-QUOTE-04:** Quote lines persist SKU, name, unit, price, tax, and discount snapshots.
- **FR-QUOTE-05:** A quote can be saved, reopened, duplicated, and deleted with confirmation.
- **FR-QUOTE-06:** The UI clearly distinguishes draft, exported, and shared actions; sharing is never automatic.

### FR-IMPORT: Import and data safety

- **FR-IMPORT-01:** Import parsing is isolated from the active catalog until validation succeeds.
- **FR-IMPORT-02:** Duplicate SKU behavior is explicit: default policy is reject-and-report, not silent overwrite.
- **FR-IMPORT-03:** The user can export a JSON backup of local catalogs, quotes, settings, and metadata.
- **FR-IMPORT-04:** Restore validates schema version and refuses incompatible or malformed backups without replacing current data.
- **FR-IMPORT-05:** Imported text is treated as data, not executable HTML or script.
- **FR-IMPORT-06:** XLSX support is added through a separate adapter and tested against real supplier workbooks.

### FR-PDF: Output

- **FR-PDF-01:** A user can generate a branded PDF without a network request.
- **FR-PDF-02:** The PDF includes company identity, customer/recipient fields, quote number/date, line items, tax, discount, totals, notes, and validity terms.
- **FR-PDF-03:** Long names and multi-page line items wrap without clipping or overlap.
- **FR-PDF-04:** English, Mandarin Simplified Chinese, Malay, Vietnamese, and Japanese render correctly through an explicitly bundled font strategy.
- **FR-PDF-05:** PDF generation failure preserves the draft quote and presents a usable fallback.

### FR-PWA: Install, offline, and updates

- **FR-PWA-01:** The app has a valid manifest, icons, theme metadata, and HTTPS-compatible deployment.
- **FR-PWA-02:** The application shell loads after it has been visited once and the device is offline.
- **FR-PWA-03:** Catalogs, quotes, settings, and required local assets survive reload and offline use.
- **FR-PWA-04:** Service Worker caching is same-origin `GET` only and does not claim cross-origin APIs or non-GET requests.
- **FR-PWA-05:** An updated worker waits for explicit user approval; the UI shows the waiting version number with Update Now and Later actions, and it does not silently reload or discard local data.
- **FR-PWA-06:** Cache cleanup is versioned and does not delete IndexedDB data.
- **FR-PWA-07:** Unsupported install/share capabilities have visible fallbacks.

### FR-DEPLOY: GitHub Pages

- **FR-DEPLOY-01:** The build works under the repository subpath `/PWA-Product-Catalog/` or the configured Pages base path.
- **FR-DEPLOY-02:** A GitHub Actions workflow builds from the lockfile and deploys only the intended artifact.
- **FR-DEPLOY-03:** CI runs type, unit, build, and targeted browser checks before deployment.
- **FR-DEPLOY-04:** Deployment verification checks the shell, manifest, Service Worker, hashed assets, and project-scoped routes.

## 3. Data contract

All durable user data is stored in IndexedDB through the `src/store.ts` application facade and `src/db.ts` adapter. The current technical slice stores the bounded logo as `logoDataUrl` in settings; separate `assets` and `app_metadata` tables from the target contract remain future schema work.

```text
products
  id, catalogVersionId, sku, name, description, categoryId,
  specifications, unit, priceMinor, currency, imageAssetId,
  sourceRow, importedAt, updatedAt

catalog_versions
  id, sourceName, importedAt, productCount, status, schemaVersion

quotes
  id, quoteNumber, customer, currency, status, issueDate,
  validUntil, notes, totals, createdAt, updatedAt

quote_lines
  id, quoteId, productId, skuSnapshot, nameSnapshot, unitSnapshot,
  unitPriceMinorSnapshot, taxRateSnapshot, discountSnapshot, quantity,
  lineTotalMinor

company_settings
  id, companyName, logoAssetId, address, contact, defaultCurrency,
  defaultTaxRate, language

assets
  id, kind, mimeType, sizeBytes, blob

app_metadata
  key, value, schemaVersion, lastBackupAt
```

The final schema may change during implementation, but the following invariants may not:

1. saved quotes are independent of later catalog edits;
2. monetary arithmetic does not rely on binary floating-point display values;
3. catalog replacement and restore are atomic;
4. database migrations are versioned and reversible through backup;
5. local data is never sent to a remote service in the MVP.

## 4. Non-functional requirements

- **Offline:** core catalog and quote path works with network disabled after initial shell load and data import.
- **Performance:** search remains responsive for the agreed supplier catalog size; benchmark with at least one real large sample rather than inventing a universal row limit.
- **Responsive:** support narrow mobile screens, tablet, and desktop without merely shrinking the desktop layout.
- **Accessibility:** keyboard operation, visible focus, semantic controls, labels, contrast, and screen-reader status messages.
- **Privacy:** no embedded API keys or credentials; no remote analytics required for the local-only MVP.
- **Recovery:** export, restore, migration failure handling, and clear-data confirmation.
- **Internationalization:** all user-facing strings route through the translation layer; supported locales are `en` (default), `zh-Hans`, `ms`, `vi`, and `ja`.

## 5. Acceptance evidence

A requirement is not `Verified` from a build alone. Required evidence includes:

- unit tests for pricing, rounding, validation, duplicate policy, and schema migration;
- integration tests for IndexedDB persistence, atomic import, restore, and quote snapshots;
- browser tests for first run, import, catalog search, quote creation, PDF export, offline reload, and explicit update activation; the deployed client also verifies waiting-worker Later/Update Now and IndexedDB read-back;
- deployment checks against the actual GitHub Pages subpath;
- PDF inspection for multi-page tables and CJK text;
- final diff and documentation review confirming no planned feature is described as shipped.

## 6. Known unknowns

- real supplier file shape and required columns;
- exact pricing, tax, discount, currency, and quantity rules;
- final quotation layout and legal wording;
- expected catalog size and image sizes;
- repository owner Pages URL and preferred branch protection/CI policy;
- whether XLSX must be in the first usable release.

These are product or verification inputs, not assumptions to hide in implementation.

## 7. Requirement status at the current baseline

Status is split between implemented code, local verification, deployment evidence, and release gaps. Local evidence below was run on 2026-09-11 against commit `2a7d766`; deployment evidence was collected from the production Pages URL.

| Area | Current status | Evidence and remaining gap |
|---|---|---|
| FR-CAT-01..08 | Implemented; locally verified | `src/importer.ts`, `src/db.ts`, catalog UI, `tests/importer.test.ts`, `tests/db.test.ts`, and the CSV browser flow cover CSV/JSON, mapping, row errors, duplicate rejection, atomic replacement, search/filter/detail, and catalog provenance. Real supplier shape and scale remain unverified. |
| FR-QUOTE-01..06 | Implemented; locally verified | `src/domain.ts`, `src/db.ts`, quote UI, unit/IndexedDB tests, and browser quote flow cover pricing, quantity/line discount/quote discount, snapshots, history, reopen/duplicate/delete, and explicit output actions. Tax/legal business rules still need confirmation. |
| FR-IMPORT-01..05 | Implemented; locally verified | `src/importer.ts`, `src/backup.ts`, and `tests/db.test.ts` cover isolated parsing, duplicate policy, backup/restore, and malformed-backup rejection. Schema validation is intentionally minimal until the real supplier contract is known. |
| FR-IMPORT-06 | Not started / deferred | XLSX needs a separate adapter after the real supplier workbook decision. |
| FR-PDF-01..02 | Implemented; locally verified | `src/pdf.tsx` and browser PDF checks prove local generation, company/customer/date/validity, lines, tax, discount, totals, notes, and bundled CJK font output. Final quotation/legal wording is still pending. |
| FR-PDF-03..05 | Partially verified | Browser tests prove multi-page output and valid PDF bytes; a manual PDF render showed English/Mandarin and wrapping. Malay, Vietnamese, Japanese, failure-injection, final branding assets, and representative acceptance PDF remain open. |
| FR-PWA-01..07 | Implemented; partially deployed-verified | Manifest contract, canonical SVG/PNG icon set, install prompt observation, Service Worker policy/version contract, deployed HTTPS shell, warmed offline reload, and a real `0.1.0` → `0.1.1` waiting-worker approval/data-survival check pass at https://yapweijun1996.github.io/PWA-Product-Catalog/. Unsupported-device paths and migration-specific proof remain open. |
| FR-DEPLOY-01..03 | Implemented; verified | `vite.config.ts`, `.github/workflows/deploy-pages.yml`, and GitHub Actions run 3 (`34594397124`) passed install, typecheck, 13 unit/integration tests, 7 browser tests, build, artifact upload, and deployment for commit `2a7d766`; the current local suite adds three share-path tests. |
| FR-DEPLOY-04 | Verified | The HTTPS URL https://yapweijun1996.github.io/PWA-Product-Catalog/ returned the shell, manifest, Service Worker, canonical SVG, PNG icon, and hashed JS/CSS assets with 200 responses; a fresh browser page verified the scoped Service Worker, HTTPS, manifest scope/start URL, deployed version `0.1.1`, and warmed offline reload. |

When a release input or verification step completes, update this table only with exact file, command, browser, PDF, or deployment evidence. `GOAL.md` and `GOAL_PROMPT.md` require the same evidence boundary.
