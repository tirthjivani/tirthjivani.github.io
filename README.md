# tirthjivani — portfolio

Personal portfolio for Tirth Jivani. Next.js 16 (App Router, Turbopack), React 19,
Tailwind v4, `motion` for animation and `lenis` for smooth scroll.

## Getting started

```bash
npm install
npm run dev       # http://localhost:8080
```

Other scripts:

```bash
npm run build     # production build
npm run start     # serve the production build on :8080
npm run lint
```

## Layout

```
app/            routes — /, /about, /archives, /project/[id], /studio, /preloader
components/     UI; PortfolioView is the client orchestrator for the home page
lib/            hooks + helpers (lenis singleton, aspect measurement, guards)
data/           projects.seeds.json + archives.json, and their typed loaders
public/         pre-compressed media only (see "Media" below)
```

`handoff.md` has the detailed architecture notes — read it before changing the
list view's scroll wrapping or the intro sequence, both of which are subtler
than they look.

## Content

Content lives in `data/projects.seeds.json` and `data/archives.json`. Edit them
by hand, or run the dev server and use **`/studio`**, a local CMS that writes
those files, compresses uploads, and can commit + push the result.

`/studio` and `/preloader` are gated by `lib/studioGuard.ts` — they only respond
in development, on localhost, and 404 everywhere else.

## Media

Everything in `/public` is already compressed; never commit a source file there.

- **Images** → webp. Nothing is displayed wider than ~1200 CSS px, so 2400px on
  the long edge is the practical ceiling.
- **Videos** → h264 mp4, long edge ≤ 1280, no audio track, `-movflags +faststart`.
- **Every video needs a poster**: `clip.mp4` → `clip-poster.webp`. The UI uses it
  as the `<video poster>` and in place of the clip wherever only a still frame is
  needed. `/studio` generates it automatically on upload.
- **Every project seed carries `width`/`height`** for the media it renders. The
  list and the intro use them to lay out before anything downloads, so hand-edits
  to `src`/`video` should update them too (`/studio` does it for you).

## Deployment

Deployed on Vercel. Once a custom domain is attached, set **`NEXT_PUBLIC_SITE_URL`**
(e.g. `https://tirthjivani.com`) in the project's environment variables — canonical
URLs, the sitemap, and OG/Twitter image URLs are baked at build time from it.
Without it the build falls back to Vercel's auto-assigned domain.
