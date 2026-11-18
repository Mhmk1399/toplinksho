<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## TopLinkSho direction from the owner

- Use the local chetahNova project as a read-only content reference. Start with its homepage, then migrate other pages only when requested.
- Extract source content into JSON with traceable source files. Publish concise, natural Persian under TopLinkSho's identity and contact information.
- Keep the active source section order. Shorten copy and combine duplicate consultation forms so pages stay compact.
- The editable homepage content lives in `content/home.fa.json`; page copy, metadata and FAQ JSON-LD must use this same source.
- Preserve TopLinkSho's navy, blue/pink branding, local Persian font and rounded glass shell. Prefer Tailwind and existing shared components.
- Use restrained static glass reflections and minimal motion. Preserve native touch scrolling, reduced-motion and weak-device fallbacks. Avoid canvas effects, autoplay carousels and repeated blur layers.
- Render content on the server, optimize local images and keep browser JavaScript small. Reuse existing on-brand artwork; generate a new image only when it adds value.
- Never copy unsupported metrics, guarantees, foreign contact details or customer claims into the published Persian content.
- The full public navigation and service tree are now authorized for migration. Use `content/services.fa.json`, `content/pages.fa.json` and the shared page templates; do not create a component per service.
- All new interface colors must come from `theme/theme.json` via semantic CSS/Tailwind tokens. Generated theme CSS is not a second source of truth.
