# O's by ROSN — Shopify Theme

A bespoke, cinematic redesign of the **O's by ROSN** storefront, built on Shopify Dawn.
Black + molten-gold + magenta art direction, an 21+ age gate, and full GSAP/Lenis motion
(with reduced-motion fallbacks). Wholesale-inquiry model — no public prices or checkout.

## Connecting to Shopify

This repo is meant to be connected to the store via **Online Store → Themes → Add theme →
Connect from GitHub** (or the Shopify GitHub app). Shopify syncs theme files on push.

Local preview:

```bash
shopify theme dev --store 0arzjm-d5.myshopify.com
```

## Custom sections (theme editor)

All prefixed `ROSN —`: Hero, Marquee, Compliance, Flavors, Specs, CTA, Products, COAs,
About, Legal / Policy, Wholesale intro. Each ships editable defaults.

Global assets: `rosn.css` (design system), `rosn-motion.js` (scroll/animation orchestrator),
`rosn-smoke.js` (hero canvas), vendored `gsap.min.js` / `ScrollTrigger.min.js` / `lenis.min.js`.
Motion can be toggled in **Theme settings → O's by ROSN → Enable cinematic motion**.

## Pages to create in Shopify admin

The page **templates** exist in this repo but need a **Page** (Online Store → Pages → Add page)
bound to each template via the "Theme template" dropdown:

| Page title            | Suggested handle | Theme template |
|-----------------------|------------------|----------------|
| Products              | `products`       | `products`     |
| COAs                  | `coas`           | `coas`         |
| About                 | `about`          | `about`        |
| Terms & Conditions    | `terms`          | `terms`        |
| Privacy Policy        | `privacy`        | `privacy`      |
| Shipping & Delivery   | `shipping`       | `shipping`     |
| Returns               | `returns`        | `returns`      |
| Wholesale             | `wholesale`      | `wholesale`    |

CTAs across the site link to `/pages/wholesale`, so use that handle for the wholesale page.

## Also configure in admin

- **Header & footer menus** (Navigation) — menus live in the store, not in the theme.
  Suggested header: Home, Products, COAs, About, Wholesale. Footer: Terms, Privacy,
  Shipping & Delivery, Returns.
- **COA PDFs** — upload to Files, then paste each URL into the COA blocks (they show
  "Coming soon" until set).
- **About** story images — replace the placeholder O's mark with real photos.
- **Legal copy** — the Terms/Privacy/Shipping/Returns text is a starting draft; have it
  reviewed. Placeholder contact emails (`@rosn.example`) should be replaced.
