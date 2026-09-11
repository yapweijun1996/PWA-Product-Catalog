# PWA-Product-Catalog Design

**Status:** Planning / proposed
**Last verified:** 2026-09-11
**Codebase source of truth:** Git commit `91b91c7` before this documentation baseline; the repository contained only `.gitattributes` and no application, build, test, or deployment implementation.
**Documentation control:** [GOAL.md](GOAL.md), [PROGRESS.md](PROGRESS.md), and [GOAL_PROMPT.md](GOAL_PROMPT.md).

## 1. Product intent

PWA-Product-Catalog is a mobile-first, offline-first B2B product catalog and quotation tool for supplier sales representatives. It is not an ERP, e-commerce storefront, inventory system, payment system, or collaboration platform.

The primary job is:

> Find a product and start a credible quotation within approximately 10 seconds, including when the device has no network connection.

The current product direction is **proposed**, not validated product scope. It must be tested with a real supplier, real catalog data, pricing rules, branding assets, and a representative quotation before release scope is considered final.

## 2. Design principles

1. **Local-first:** the catalog, quotes, settings, and imported assets work from IndexedDB without a backend.
2. **Honest offline state:** show when data is local, stale, unavailable, or being exported; never imply that a local catalog is live inventory.
3. **Quote-first workflow:** search and add-to-quote are more important than dashboards or administration.
4. **Snapshot integrity:** a saved quote keeps the product and price values used when it was created.
5. **Progressive disclosure:** show the next useful action first; keep advanced filters and settings on demand.
6. **User-controlled updates:** a new application version must not silently replace a working release or destroy local data.
7. **Static deployment:** the MVP must run on GitHub Pages over HTTPS with no required server API.
8. **Evidence-led documentation:** planned behavior is labelled as planned; only code, tests, and browser/deployment evidence can move it to implemented or verified.

## 3. Primary user journey

```text
Import catalog
  -> map and validate columns
  -> commit a complete catalog version
  -> search or filter products
  -> open product details
  -> add product to quote
  -> edit quantity, discount, and tax
  -> preview quote
  -> export branded PDF
  -> share with an explicit user action
```

The first-run screen should send a user directly to import. A dashboard may provide counts and recent quotes later, but it must not delay the catalog workflow.

## 4. Information architecture

### Catalog

- Persistent search field.
- Horizontal category filters on small screens.
- Filter bottom sheet for price, category, availability metadata, and custom fields.
- Two-column product cards on mobile; list/detail split layout on larger screens.
- Product detail contains specifications, source freshness, price, and one prominent **Add to quote** action.
- Persistent bottom quote action shows the current line count and total.

### Quotes

- Current draft quote.
- Quote preview.
- Quote history with draft/exported status.
- Reopen, duplicate, export, and share actions.

### Settings

- Catalog import and export.
- Company identity, logo, address, contact details, currency, and default tax.
- Language selection (`en`, `zh-Hans`).
- Data backup, restore, and destructive clear-data flow.
- Offline and application-update status.

## 5. Interaction states that must be designed

Every affected screen needs explicit states for:

- first use / empty catalog;
- loading or parsing;
- successful import;
- row-level import errors;
- no search results;
- offline mode;
- stale or locally imported data;
- empty quote;
- quote with validation errors;
- PDF generation in progress and failure;
- share unsupported or cancelled;
- waiting application update;
- destructive actions and recovery.

Keyboard focus, touch targets of at least 44px, reduced motion, contrast, and long product names must be handled as normal states, not polish tasks.

## 6. Visual system

Use a restrained industrial-professional system:

- light background;
- navy primary color;
- teal/blue accent;
- semantic success, warning, and error colors;
- 12–16px card radius;
- 4/8px spacing rhythm;
- readable system or bundled font stack;
- explicit focus rings and minimum 4.5:1 normal-text contrast.

Design tokens must be defined once in CSS variables or the selected design-token source. Do not duplicate colors or spacing inside feature components.

## 7. Offline and update design

### Application shell

The planned implementation uses a Vite PWA build with an owned Service Worker (`injectManifest` or an equivalent custom worker) so update behavior remains explicit and testable.

- Cache same-origin `GET` resources only.
- Use versioned cache names and delete obsolete caches after activation.
- Use network-first behavior for HTML, JavaScript, and CSS so a newly deployed release is not hidden behind stale cache-first shell code.
- Provide an offline navigation fallback only after a shell has been cached.
- Leave non-GET requests and cross-origin API/CDN traffic untouched.
- Do not call `skipWaiting()` automatically.
- When a worker is waiting, show **Update now** and **Later**; activate only after the user chooses update, then reload on `controllerchange`.

### Product data

The Service Worker caches the app shell; IndexedDB is the source of truth for user data. Catalog and quote data must remain available after reload and while offline. Imported remote image URLs are not considered offline-safe; guaranteed offline images must be stored as bounded local Blobs.

### Update safety

Service Worker updates must not be coupled to IndexedDB deletion. Database migrations are versioned, tested, and preserve user data. Before risky migrations or clear-data operations, offer JSON export. A failed migration must fail visibly and preserve the last recoverable backup path.

## 8. Proposed technical boundaries

```text
UI components/routes
  -> feature application actions
  -> domain rules (pricing, import validation, quote snapshots)
  -> persistence adapters (Dexie/IndexedDB)
  -> browser platform adapters (Service Worker, Web Share, file APIs)
```

UI code must not contain pricing formulas or direct database queries. One module owns each rule. A future sync backend may be added behind the persistence boundary; it is not part of the MVP.

## 9. Decision log

| Decision | Status | Rationale |
|---|---|---|
| React + TypeScript + Vite | Proposed | Provides a small, typed feature structure for a new codebase and static Pages build. |
| Dexie over localStorage | Proposed | Catalogs, quotes, Blobs, indexes, and migrations require IndexedDB. |
| CSV/JSON required; XLSX adapter planned | Proposed | Keeps the first import path small while preserving the supplier Excel requirement as a tracked dependency. |
| `@react-pdf/renderer` with bundled fonts | Proposed | Allows client-side branded PDF generation without a server; CJK font embedding must be proven. |
| Hash-based routing for Pages | Proposed | Avoids refresh/route fallback assumptions on a static GitHub Pages host. |
| Network-first shell and prompt-controlled updates | Proposed from verified prior PWA patterns | Reduces stale-JavaScript incidents and protects user control. Must be browser-tested in this repository. |
| No backend in MVP | Proposed | GitHub Pages can support private local catalogs and quotes; shared data needs a later authorized backend. |

## 10. Current truth boundary

This document describes the intended design, not implemented behavior. The current repository has no `package.json`, `src/`, `public/`, Service Worker, manifest, GitHub Actions workflow, tests, or generated build output. The working tree adds documentation only; it does not constitute an implementation. `SPEC.md`, `EPIC.md`, `ROADMAP.md`, `TASK.md`, `GOAL.md`, and `PROGRESS.md` must keep this distinction explicit until code evidence changes it.

## 11. Documentation and evidence contract

- `DESIGN.md` owns product UX and architecture decisions.
- `SPEC.md` owns requirements and acceptance evidence.
- `EPIC.md` owns capability boundaries and epic exit gates.
- `ROADMAP.md` owns phase sequencing and release gates.
- `TASK.md` owns actionable work and dependencies.
- `GOAL.md` owns the durable completion contract.
- `PROGRESS.md` owns verified current state and blockers.
- `GOAL_PROMPT.md` is the compact assignable prompt; detailed procedures stay in the Markdown documents.

Implementation status changes only after code, tests, browser, or deployment evidence is recorded. Documentation completion must never be reported as product completion.
