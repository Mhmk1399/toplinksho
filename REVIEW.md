# TopLinkSho redesign preview

Source: https://github.com/Mhmk1399/toplinksho
Baseline commit: 3d0c31fd86b2b376b345850d30622b67d1ad1b4f
Original review branch: redesign/review-preview
Requested delivery branch: main

## What changed
- A coordinated Persian RTL homepage, restrained navy/violet visual system, mobile-first content hierarchy and existing 3D hero artwork.
- Five fully written service routes with metadata, capabilities, process, scope boundaries, FAQ and related services.
- Shared site navigation/footer, native modal mobile menu, keyboard focus, skip link and reduced-motion styling.
- One consistent contact journey using the phone and email already published at toplinksho.com.
- Unverified project results/client names removed from the displayed page. Visual concept showcases are explicitly labelled as demonstrations.
- Non-functional newsletter, video and carousel controls removed. ContactForm no longer falsely reports submission. No lead storage, backend form or external transmission is added.
- Preview is deliberately noindex/nofollow. No canonical host, redirects or production sitemap were guessed.

## Run locally
1. npm ci
2. npm run dev
3. Open http://localhost:3000

For production-mode validation: npm run lint && npm run build && node scripts/smoke-test.mjs

## Acceptance status
Lint, TypeScript via production build, static page generation and HTTP smoke tests are recorded separately in artifacts/smoke-results.json. There is no existing automated unit-test suite in this repository.

Browser QA is NOT complete. The available shell browser failed before startup because local socket creation was unavailable; the supported cloud browser could not reach the shell localhost server. No desktop/mobile screenshots, Lighthouse scores or accessibility audit results are claimed.

Before approval, visually inspect at 1440, 1280, 1024, 768, 430, 390 and 375px. Test mobile menu opening, Escape, backdrop, CTA closing, keyboard focus restoration, repeated navigation and back/forward. Check FAQ controls, RTL/LTR text, overflow, contact links and all service routes. No test calls or emails need to be sent.

## Before launch
- Confirm final brand assets, contact details, offer language and review all Persian copy with the owner.
- Replace concept showcases with approved genuine projects if available. Do not add client logos or performance claims without evidence.
- Supply approved about/team, portfolio/case-study and editorial content before creating those full pages. This delivery is homepage plus service pages, not a CMS or complete content migration.
- Inventory old WordPress URLs and agree a redirect map before migration. Existing production was not modified.
- Decide the real inquiry backend, consent/data-retention language and newsletter integration separately.
- Remove preview noindex only after production host, metadata, canonical URLs, sitemap, redirects and launch authorization are settled.

The initial review delivery was not pushed or deployed. On 2026-11-11, the owner requested committing and pushing this redesign to main. This source delivery retains preview noindex/nofollow and is not a production-launch approval. The live domain was checked before delivery and still served WordPress on Hostinger; no GitHub Actions workflows or GitHub deployments were recorded for this repository.
