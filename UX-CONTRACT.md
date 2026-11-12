# TopLinkSho interaction contract

Authority: the current user request supplies public content, authorizes a consultation inbox/backend and SMTP integration, and excludes conflicting names and statistics. Preview defaults to noindex; the live HTTPS build enables indexing only with SITE_INDEXABLE=true. This is a single-owner admin application with no public registration.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | `components/ui/FormControls.tsx`, `lib/consultation.ts` | User-required fields and shared schema | consultation, credentials, notes | validation and API checks |
| Select/Listbox | `components/ui/FormControls.tsx` | Native platform-owned select; Persian labels | subject, status | keyboard, touch, invalid state |
| Scrollbar | `app/globals.css` | `DESIGN.md` | normal, forced-colors | computed styles |
| CRUD | `lib/server/consultations.ts`, `/admin` | Consultation schema and authenticated endpoints | public create, private read/update, reversible archive | API and browser checks |
| Toast | Shared form inline status regions | This contract | success, error, connection failure | live regions and preserved values |
| Date | Admin date formatter | `fa-IR`, `Asia/Tehran` | read-only timestamps | formatted values |

## Consultation lifecycle

Full name, telephone and consultation subject are required; description and website/social address are optional. Normalize Persian/Arabic digits. Repeat length and field validation on the server. Require same-origin JSON and rate-limit submissions. No public read endpoint exposes leads.

A database write and durable email-queue entry are atomic. A unique submission key makes retries idempotent. Only a committed request produces success and a reference. SMTP failure never undoes a saved request. Private email state and a deliberate retry action belong in admin.

Statuses: new, reviewing, contacted, completed, archived. All changes are reversible. No destructive delete is exposed. Notes are private; versioned updates prevent silent overwrites. Preserve drafts on conflict.

## Admin access

User records own hashed passwords, roles, active/suspended state and session versions. Server-only admin email and scrypt password hash bootstrap an environment-managed account without promoting pre-existing accounts. No default credentials. Authentication creates a random expiring token; store only its hash. Use HttpOnly, SameSite=Lax cookies, Secure in production. Every private page and endpoint checks the session. Logout revokes it; credential rotation invalidates existing sessions. Limit login attempts.

## Navigation and feedback

Main navigation connects `/`, `/about-us`, `/services`, `/contact`; existing service details remain. CTAs lead to a real form. Native dialog semantics own mobile-menu focus, Escape and restoration. Anchors account for the fixed navbar.

Status and page live in URL parameters. Search text may include names and telephone numbers, so it is sent in an authenticated POST body and held only in the admin provider's memory; it does not enter browser history. Search has explicit submit and clear. Server pagination uses twenty items with clamping. The provider preserves the inbox search and private edit drafts across internal navigation; actual document unload warns about unsaved edits. Empty, no-results, configuration, save failure and expired-session states use localized inline feedback.

## Data and operations

MongoDB/Mongoose own leads, users, hashed sessions and shared rate limits. A server-only cached connection and bounded pool are reused. Unique indexes enforce idempotency; optimistic versions protect private edits; TTL indexes clean expired sessions/rate limits while explicit time checks enforce expiry. Passwords are excluded from normal user queries. Credentials remain excluded from Git. SMTP uses TLS/STARTTLS and bounded timeouts. Do not log private request data.

No customer data in URL parameters, analytics or persistent browser storage. The user has not authorized export, destructive retention automation or a deletion policy; none is added.

## PWA and indexing

Only public HTML and assets can enter the bounded service-worker caches. Admin, API, mutations, RSC and private/no-store responses bypass caching. Offline consultation submission preserves the form and reports failure; no background submission or personal browser storage is introduced. New workers wait for old tabs to close. Install and iOS instructions live in the shared footer. Public metadata and JSON-LD use the same route/service catalog; private pages remain noindex and have no public schema.

## Service navigation and theme

Public navigation includes home, services, blog, pricing, about and contact; case proposals remain a menu shortcut. A native disclosure opens the desktop service directory; Escape/outside press closes it. Ctrl/Cmd+K opens the desktop directory and focuses its first group without taking over shortcuts in editable fields. The mobile dialog preserves its focus, Escape and scroll contract, opens with services visible and contains three native illustrated disclosures. No hover-only access is required. Service search submits a public GET query to /services/search, with clear and no-results states, canonical /services and noindex for search results. The /services catalog stays prerendered and available offline after a visit; search responses stay outside the worker cache. Private inbox searches still remain in POST bodies. Pricing is a request for estimation, with no payment or invented currency conversion. Source case studies are labelled as proposals; the empty source blog does not invent posts.

`theme/theme.json` owns all interface colors. Generated CSS supplies semantic tokens, Tailwind color families and migrated paint values, including private/admin UI and offline fallback. New components consume tokens; generated files are not edited manually. Shared route templates keep server-rendered content and FAQ schema aligned with the JSON registry.

Public breadcrumbs precede the hero and clear the floating navbar. Their current item stays plain text with aria-current; parent links retain full labels. On narrow screens the single-line trail scrolls horizontally with touch, focus and keyboard, with its scrollbar hidden at the owner's request and restored in forced colors. No ancestor clips the trail or creates document-level horizontal overflow. New card imagery has reserved geometry, responsive sizes and lazy loading; hero image priority remains unchanged.

`FeatureCard` is the canonical public content/service/package card. It accepts title, description, foreground image, optional image background, category, destination and content/footer slots; image-free functional panels retain the shared neon surface. One named covering link makes a destination card clickable; independent links and native disclosures remain above it, with no nested anchors. Foreground alt text is honored when supplied; decorative artwork and backgrounds stay silent. Foreground sources are transparent PNGs, verified by `npm run test:artwork`; image delivery retains alpha. Card lighting uses two static CSS radial gradients with no hard wave edge, blur filter or baked image backdrop. `CardGrid` exposes full SSR content in a desktop grid and a native, keyboard-focusable mobile rail with a visible scrollbar and next-card cue. Rails never autoplay or run an animation loop. `ServiceMenu` owns the owner's newer, compact navigation reference: three illustrated service columns and one promotional column in a single desktop row, with native thumbnail disclosures on phones. Its decorative PNG images have true alpha and load lazily through responsive optimization; no foreground image mask or blend hides a backdrop. menu links disable route prefetch, and neither the sheet nor individual columns use backdrop blur or looping animation. All labels and family destinations come from `content/navigation.fa.json`.

Neon hero backgrounds are static, non-interactive, aria-hidden server-rendered decoration. They do not block links or change the content hierarchy. Background wave/mesh layers never animate; the foreground alone retains existing offscreen, hidden-tab, reduced-motion and constrained-device behavior. Low-performance mode reduces mesh density/contrast and removes decorative shadows; forced-colors hides the scenery. The first hero image remains eager and high priority, with reserved layout geometry and compressed mobile sources.

Expanded page copy lives alongside its route data: heroDescription for the visible hero, bodyParagraphs for ordinary overview prose, and processDescription for service workflow context. Short description fields keep cards and metadata concise; H1 titles stay unchanged. NarrativeCopy and PageOverview are server components. Copy review checks all 61 public routes against the recorded baseline and does not treat word counts as a ranking target.
