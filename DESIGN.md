---
version: alpha
name: TopLinkSho
description: Persian RTL agency with glass surfaces and blue–pink 3D artwork.
colors:
  background: "#080a16"
  surface: "#111422"
  text: "#f5f4fa"
  muted: "#a3a4b8"
  primary: "#343db5"
  pink: "#f51b7e"
  actionPink: "#bc155f"
  accent: "#c2a1ff"
typography:
  sans:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
rounded:
  control: "15px"
  card: "24px"
  glass: "28px"
spacing:
  page-max: "80rem"
  section: "100px"
components:
  hero:
    textColor: "{colors.text}"
  button:
    backgroundColor: "{colors.primary}"
  buttonGradientEnd:
    backgroundColor: "{colors.actionPink}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  form:
    backgroundColor: "{colors.background}"
  heroSatellite:
    backgroundColor: "{colors.pink}"
  focusIndicator:
    backgroundColor: "{colors.accent}"
---

# TopLinkSho

## Overview

The reference is an illuminated chrome-and-glass digital sculpture over a navy night sky. Magenta and cobalt come from `public/images/logo.webp`; lavender connects them to the established homepage. Preserve the rounded floating navigation and footer.

Public routes are Persian marketing pages. `/admin` is a compact application for reviewing consultation requests. Both use Persian RTL and local Vazirmatn. The current user supplied the content and authorized the backend, admin panel and SMTP integration; conflicting names and statistics must remain unpublished until resolved.

`theme/theme.json` owns semantic colors. `scripts/generate-theme.mjs` derives the shared Tailwind palettes and legacy paint values into `theme/generated.css` and the offline CSS. `app/globals.css` owns geometry and interaction styles, consumes those variables, and contains no independent palette. This document mirrors the accepted default theme. The inline Tailwind theme maps these into semantic utilities: `bg-ink`, `bg-panel`, `text-muted`, `text-accent`, `text-brand-pink` and `text-brand-blue`.

## Colors

`--background`, `--surface`, `--text`, `--muted`, `--brand-blue`, `--brand-pink` and `--accent` implement the palette above. Pink and blue identify the brand. Errors and success also use text and icons. Action gradients use a darker pink to preserve white-label contrast.

## Typography

Local Vazirmatn handles Persian and Latin. Heavy headings, generous paragraph line heights, LTR contact values. Admin dates use `fa-IR` and `Asia/Tehran`.

## Layout

`Container` owns the 80rem maximum and gutters. `PageHero` owns the homepage's grid, type rhythm, actions, artwork area and capability strip. Every main public page uses it. Service groups and specialisms use shared `PublicFrame`, `ServiceDirectory`, `ServicePage` and `ContentBlocks` driven by JSON. The desktop service disclosure and mobile native dialog expose the same three groups and ten service families. Query-based public service search works without client JavaScript. The homepage follows chetahNova's active content order: hero/core services, AI tools, one consultation form, process, FAQ and compact contact. Persian copy in `content/home.fa.json` is concise; source snapshots remain separate. Homepage cards use static glass reflections rather than per-card blur, and only the hero has ambient motion. Homepage section titles use 24–36px with 32px/48px section padding on phone/desktop, preserving the larger shared hero. Below 768px, centered text precedes the artwork, exactly as on the existing homepage. New section layouts primarily use Tailwind.

The admin inbox uses server pagination, URL-based status/page filters, a semantic desktop table and mobile cards. Sensitive search text stays in memory. The document scrolls naturally.

## Elevation & Depth

One glass shell per major surface; static lighting on the footer. Low-performance mode removes backdrop blur; touch devices use a smaller blur. Foreground artwork is supplied as real transparent PNG files. Next image optimization handles responsive transfer while preserving alpha.

`ServiceMenu` follows the owner's latest navigation reference: one dark glass sheet, three compact illustrated service columns and one growth/security feature in a single row. The sheet contains service, pricing, case proposal and consultation shortcuts; the public service catalog owns search. Phones use a native dialog with a sticky logo/close header, three illustrated category disclosures and a sticky consultation action. Transparent PNG artwork is reused with responsive lazy loading, without foreground image masks or blend modes. Static gradients create the glass effect; the menu, columns and backdrop use no backdrop blur or animation loops. Labels and destinations live in `content/navigation.fa.json`, with icons in `NavigationIcon` and colors in the shared theme.

`useServiceMenu` enhances the native desktop disclosure with fine-pointer hover: a 70ms intent delay, a transparent bridge across the navbar gap, and 170ms of exit tolerance. A single opacity/6px transform transition opens in 180ms and closes in 140ms; rapid reversal continues from the current visual position. Pointer clicks pin a hover-open menu, and keyboard activation toggles it. Escape also dismisses hover content when focus is elsewhere; focused menu links retain the disclosure until focus leaves. Closing content becomes inert, then the native disclosure closes. Reduced motion and the shared constrained-device/performance policy skip animation. Touch and no-JavaScript navigation retain native click behavior.

`FeatureCard` owns the complete public content card, following the owner's earlier card reference: a luminous blue-to-pink rounded outer frame, floating artwork over softly faded blue/pink lighting and a subtle grid, and a separate glass text panel with a category pill and short gradient rule. `CardVisual` supplies its image stage; optional foreground and background images are props. `components/ui/feature-card.css` owns the shared reference styling: soft radial-gradient lighting behind the alpha image, a bright blue/pink lower rim, and a diagonal reflection on the separate rounded text panel. Topic-specific transparent PNG illustrations in `public/images/cards` load lazily. `content/card-artwork.fa.json` maps stable route, suitability, deliverable, AI and editorial keys to distinct on-brand sculptures. `FeatureCard` and `CardVisual` own selection; the interactive menu uses a four-entry generated subset. The complete artwork catalog stays on the server. Individual cards use static gradients and modest shadows without backdrop blur or animation loops. Functional panels and admin cards share the quieter `neon-surface` treatment through the same palette.

The reference's vertical image-over-text composition is retained on phones. `CardGrid` uses a native horizontal rail for repeated mobile cards, with a visible scrollbar, partial next card, localized swipe cue and keyboard focus; desktop uses a grid. This keeps pages compact without shrinking the illustration into a side thumbnail. Mobile heroes use bounded 640px transparent PNG sources through Next image-optimized picture sources, eager high-priority loading and a preloaded Persian font; desktop heroes retain the original artwork.

`Breadcrumbs` appears before the hero, below the fixed navbar with a safe-area offset. The mobile trail stays on one line and scrolls horizontally with touch and keyboard. The owner explicitly requested hiding only this trail's scrollbar; all other surfaces keep the global scrollbar baseline. Forced-colors mode restores the trail scrollbar. Service section headings name the actual service, and JSON introductions explain domain-specific scope instead of repeating generic marketing copy.

## Shapes

Service pages share `SectionNav`: a compact, right-aligned navy glass dock with a lavender rim, a small desktop orientation label and generous anchor links. It sticks below the floating navbar at every viewport, using the same header geometry tokens: an 8px gap on phones/tablets and 12px from 1024px. Links always occupy one row; a bounded native RTL scroll area with the shared thin scrollbar exposes overflow without widening the document. Focus padding keeps keyboard outlines visible. Static reflections provide depth without backdrop blur or extra browser JavaScript. The unpainted part of its layout container lets pointer input reach content underneath. The page scroll offset includes both bars on phones and desktops.

15px controls, 24px cards and the established 28px glass shells; mobile shells use 23px. Lucide is the shared icon family. Pair unfamiliar actions with text.

## Components

Projects use the quieter admin register: `ProjectEditor`, shared form controls, native service checkboxes, native status selects and progressive disclosure keep the long form readable. A compact desktop publication panel follows document scrolling; phones use a single column with a compact fixed save action and reserved bottom space. Editor headings stay at the 18px utility scale rather than inheriting marketing heading sizes. The public portfolio uses the established `PublicFrame`, `FeatureCard` and `SectionNav`, with real uploaded project images and native video controls. `ProjectVideo` owns posters, optional Persian captions, and `preload="none"`; no video autoplays. Empty, error, draft, published and archived states remain explicit.

Shared owners: `Button`, `FormControls`, `PageHero`, `HeroArt`, `ContactForm`, `ConsultationSection`, `ServiceCatalog` and `AdminRequestForm`. Forms use a platform-owned native select, visible labels, associated errors, first-error focus and stable loading buttons.

`components/ui/Select.tsx` owns every selection field, also re-exported by `FormControls`. Callers supply typed option arrays or labelled groups, controlled or default values, a label, placeholder, errors/help, loading/empty labels, disabled/required state, direction and style overrides. The native single-select has the shared 48px rounded control with a static lavender chevron; native multi-select uses a visible scrollable list without a chevron. `FieldShell` owns the shared label/message association for selects, inputs and textareas. Native browser/OS popup geometry, keyboard/typeahead and mobile selection UI remain intentional; `appearance-none` styles the closed trigger only. The component adds no client boundary or dependency: public/admin GET filters work without JavaScript. Client forms may use `onValueChange` or the native `onChange` event. Native DOM values and submitted form values are strings.

Hero motion animates transforms on few layers. IntersectionObserver pauses offscreen art, visibility changes pause background tabs, and reduced-motion/low-performance modes stop decoration. Lenis has no idle animation loop. Admin pages use native scrolling.

`ServiceProcess` owns the shared service workflow reference: staggered glass speech cards above a static curved light rail on desktop; one vertical column with left-hand artwork and a right-hand connector on phones and tablets. Step text remains server-rendered from the route's JSON, and the count is data-driven. Four small transparent PNG icons are lazy-loaded and reused across workflows. CSS gradients and a few SVG paths supply the planet, rail and bottom wave without canvas, backdrop blur or ambient animation.

Service pages use a single `ServiceEntrance` observer for one-time entry of headings, prose, cards, FAQ items and consultation panels. Only opacity and a 14px translation animate, for 420ms with at most six concurrent entries. Visible SSR content never depends on JavaScript or an initial hidden class. Completed animations leave no persistent layer hints. Reduced motion, background tabs, Save-Data and the shared constrained-device policy disable entrances; existing adaptive scroll performance fallback cancels them. The observer adds no layout wrapper around sticky section navigation.

All page heroes follow the owner's neon reference through `PageHero`: restrained blue/pink ambient light, fine orbital trails around the existing artwork, and a dotted wave at the bottom. The owner's removal of the outer hero frame is retained. `HeroBackdrop` and the artwork render on the server with CSS/SVG geometry; the scene adds no background-image requests, particle library, canvas, animated filters or animation loop. `HeroMotion` is the small client wrapper that retains visibility/motion observation for the foreground only. Mobile places centered copy before the artwork with a smaller title scale; breadcrumbs remain above inner-page heroes. The original optimized high-priority hero image and local font delivery are retained.

## Do's and Don'ts

- Reuse the same hero layout on home, about, services and contact.
- Preserve the original logo's aspect ratio and colors.
- Store a consultation before reporting success; email failure must not lose it.
- Omit conflicting metrics, leadership names and unsupported percentages.
- Never invent customer quotations, staff photographs or performance claims.
- Do not animate blur, filters, large shadows or layout dimensions.
- Do not expose credentials or customer data on public routes.
