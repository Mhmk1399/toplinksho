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

Runtime CSS in `app/globals.css` remains the canonical token source. This document mirrors accepted values. The inline Tailwind theme maps these into semantic utilities: `bg-ink`, `bg-panel`, `text-muted`, `text-accent`, `text-brand-pink` and `text-brand-blue`.

## Colors

`--background`, `--surface`, `--text`, `--muted`, `--brand-blue`, `--brand-pink` and `--accent` implement the palette above. Pink and blue identify the brand. Errors and success also use text and icons. Action gradients use a darker pink to preserve white-label contrast.

## Typography

Local Vazirmatn handles Persian and Latin. Heavy headings, generous paragraph line heights, LTR contact values. Admin dates use `fa-IR` and `Asia/Tehran`.

## Layout

`Container` owns the 80rem maximum and gutters. `PageHero` owns the homepage's grid, type rhythm, actions, artwork area and capability strip. Every main public page uses it. Below 768px, centered text precedes the artwork, exactly as on the existing homepage. New section layouts primarily use Tailwind.

The admin inbox uses server pagination, URL-based status/page filters, a semantic desktop table and mobile cards. Sensitive search text stays in memory. The document scrolls naturally.

## Elevation & Depth

One glass shell per major surface; static lighting on the footer. Low-performance mode removes backdrop blur; touch devices use a smaller blur. Generated images are compressed transparent WebP files.

## Shapes

15px controls, 24px cards and the established 28px glass shells; mobile shells use 23px. Lucide is the shared icon family. Pair unfamiliar actions with text.

## Components

Shared owners: `Button`, `FormControls`, `PageHero`, `HeroArt`, `ContactForm`, `ConsultationSection`, `ServiceCatalog` and `AdminRequestForm`. Forms use a platform-owned native select, visible labels, associated errors, first-error focus and stable loading buttons.

Hero motion animates transforms on few layers. IntersectionObserver pauses offscreen art, visibility changes pause background tabs, and reduced-motion/low-performance modes stop decoration. Lenis has no idle animation loop. Admin pages use native scrolling.

## Do's and Don'ts

- Reuse the same hero layout on home, about, services and contact.
- Preserve the original logo's aspect ratio and colors.
- Store a consultation before reporting success; email failure must not lose it.
- Omit conflicting metrics, leadership names and unsupported percentages.
- Never invent customer quotations, staff photographs or performance claims.
- Do not animate blur, filters, large shadows or layout dimensions.
- Do not expose credentials or customer data on public routes.
