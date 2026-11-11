# TopLinkSho implementation review

The current implementation completes the four main public routes and a private consultation inbox. This supersedes the earlier homepage-only preview scope.

## Public pages

- Shared homepage hero structure on home, about, services, contact and all nine service details.
- Persian RTL content supplied by the owner; conflicting metrics and leadership names withheld by explicit instruction.
- Original logo reused throughout; blue/pink accents, glass navigation/footer and compressed local WebP artwork.
- Three new transparent 3D illustrations generated with built-in image_gen. Prompts and output paths are in `artifacts/generated-assets.json`.
- Portfolio images copied from the original site's public assets; short customer quotations match the accessible homepage.
- Two independent consultation forms on home plus reusable forms on the main routes.
- Native touch scrolling, conservative Lenis eligibility, no idle Lenis loop, transform-only hero motion, offscreen/background pausing and low-performance/reduced-motion fallback.
- Maps load only after an explicit action and search the supplied Sattarkhan address. The old Valiasr embed is not used.

## Consultation backend and admin

- MongoDB/Mongoose with explicit models, unique idempotency indexes, bounded connection reuse, users, expiring sessions and shared atomic rate limits.
- Public validation, request-body bounds, same-origin checks, honeypot and rate limits.
- Private inbox, server pagination, filters, search, detail view, reversible status changes and internal notes.
- Search text and drafts remain in memory; customer names/phone searches are not placed in URL history.
- Scrypt password verification, random expiring server-side sessions, hashed tokens, HttpOnly/SameSite cookies and production Secure cookies.
- Version checks protect notes from concurrent overwrites. Unsaved drafts survive internal navigation; logout confirms discarding them.
- TLS/STARTTLS SMTP notification queue independent of durable request storage. Admin can inspect mail status, retry failed notifications and verify SMTP connectivity.

## Verification

Project-owned commands and evidence are recorded in `premium-ui.json`. Reports are in `artifacts/backend-results.json`, `artifacts/browser-results.json`, `artifacts/smoke-results.json` and `artifacts/premium-audit.json`.

The browser suite covers desktop/phone hero geometry, mobile navigation, real form-to-inbox flow, validation, failures/retries, editing/drafts, authentication/logout, deferred maps, automated accessibility and reduced-performance behavior. The backend suite uses an isolated MongoDB process and local TLS SMTP server; no real recipient receives test mail.

## Configuration and deployment

The owner chose to configure real credentials later. Set `.env.local` from `.env.example`; there are no default admin credentials. See `SETUP.md` for the password-hash command and SMTP fields.

MongoDB must be configured with server-only MONGODB_URI; the Node host needs network access and index creation privileges. Existing SQLite data is not removed. Credentials, SMTP and production domain remain owner configuration.

Preview `noindex/nofollow` remains by default; SITE_INDEXABLE=true enables the final HTTPS build. Per-route metadata, canonical URLs, social cards, sitemap, robots and truthful JSON-LD share one content source. A versioned PWA worker supports installation and offline fallback while excluding private and API responses. No deployment, DNS change, production launch, commit or push was performed as part of this request.
