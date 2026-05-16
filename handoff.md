# Handoff — Tirth Jivani Portfolio

## Stack

- **Next.js 16.2.6** App Router (TypeScript, Turbopack)
- **React 19.2.4**, **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **motion v12** (formerly Framer Motion) — `import { motion, AnimatePresence } from "motion/react"`
- **next/font/local** for Circular Std (5 weights in `app/fonts/`)
- `agentation` (dev only) loaded via `components/DevTools.tsx` for in-page feedback

CLAUDE.md / AGENTS.md flag: **this Next.js version differs from training data**. Always consult `node_modules/next/dist/docs/01-app/...` before adding features that touch routing, rendering modes, or config.

## Layout overview

Single-page portfolio at `/`. Two views toggled from the BottomBar:

- **List** (default) — full-bleed slideshow, one project per viewport.
- **Grids** — 3-column grid of all projects.

Chrome stays fixed across both views:
- `Navbar.tsx` — top bar (brand / Work·Photos·Archive·Info / Instagram·Linkedin·The X).
- `BottomBar.tsx` — view toggle on the left; project impact / Role / Category / Client / Year and `Compass` on the right (right-side fades out in Grids).
- `BottomBlur.tsx` — progressive backdrop-blur stack + dark gradient at the bottom edge; renders in **both** views.
- `ProjectSidebar.tsx` — list view only; centered project list on the left.

## Component map

```
app/page.tsx                    server, renders <PortfolioView projects={projects} />

components/PortfolioView.tsx    client orchestrator (state, event handlers, body lock)
  ├── Navbar
  ├── Slideshow (list) | ProjectsCanvas (grid)
  ├── ProjectSidebar  (list only, AnimatePresence-wrapped)
  ├── BottomBar
  └── BottomBlur
```

### `PortfolioView.tsx`

Owns:
- `view: "list" | "grid"`
- `current: number` (active project index)
- `direction: "next" | "prev"` (for slide transitions)
- Listeners (only when `view === "list"`):
  - **wheel** (passive: false, preventDefault) — accumulated 10px tolerance, then step
  - **touchstart/move/end** — 30px threshold
  - **keydown** — ArrowUp/Down, PageUp/Down, Space
- `document.body.style.overflow = "hidden"` in list view, restored on grid switch
- `NAV_COOLDOWN = 1700ms` throttles back-to-back nav (matches slide animation duration)

### `Slideshow.tsx`

GSAP-style fullscreen scrolling slideshow ported to Framer Motion. Three nested `motion.div`s per slide:
- **outer** — `y: 0 ↔ ±100%` (slide enters from below / exits up, or inverse for prev)
- **inner** — counter-translate (`y: ∓100% → 0`) so the image stays visually anchored while the outer "window" sweeps
- **img wrapper** — `scaleY 2 → 1` with directional `transformOrigin` (top for next, bottom for prev) — the stretch effect
- **innermost** — `motion.div layoutId={project.image.id}` wrapping the `<Image>` or `<video>` (for outbox-labs). This is what bridges to the grid view via shared-layout transition.

Constants:
- `DURATION = 1.6`
- `EASE = [0.65, 0, 0.35, 1]` (≈ `power3.inOut`)

### `ProjectsCanvas.tsx`

Grid view. 12-col layout, 3 cards per row:
- col-start cycling `[1, 5, 9]` × `col-span-3`
- empty cols 4 / 8 / 12 act as the inter-card gaps
- `pt-[100px] pb-[250px] px-[20px] gap-y-[40px]`
- Each card's image wrapper carries `layoutId={project.image.id}` — matching the slideshow's inner motion.div, so the active project's media flies between the two layouts.
- Other cards stagger in (`opacity 0→1`, `y 24→0`, delay = 0.15 + i × 0.04s) so the grid feels like it splits into place.

### `ProjectSidebar.tsx`

Per-item motion stack with cyclic slot math.

```
slot = ((i - active + half + N) % N) - half   // range [-half, +half]
y    = slot × STEP                            // STEP = 22px
```

- All N projects rendered absolutely positioned with `y` driven by `motion.button animate`.
- Active stays at center, the rest fan ±half slots.
- **Wrap detection**: `|new_slot - prev_slot| > half` → that one item gets `transition: { duration: 0 }` (instant teleport from one edge to the other). Other items glide 500ms with `[0.4, 0, 0.2, 1]`.
- `prevSlotsRef` is a `useRef<Record<string, number>>` updated in `useEffect`.

### `BottomBar.tsx`

12-col grid pinned at `bottom-20`:
- col 1-3: List / Grids / Index (Index is faded, no view yet)
- col 4-6: project impact (`max-w-[160px] leading-[1.4]`)
- col 7-9: Role / Category rows
- col 10-11: Client / Year rows
- col 12: Compass

Right side (cols 4-12) is wrapped in `AnimatePresence`; it fades out in Grids view.

### `BottomBlur.tsx`

Renders unconditionally (both views). Three stacked `backdrop-blur` layers with mask-image gradients:
- `backdrop-blur-[2px]`, mask: 55%→100% transparent
- `backdrop-blur-[8px]`, mask: 25%→70% transparent
- `backdrop-blur-[18px]`, mask: 0%→40% transparent

Plus a dark gradient overlay `rgba(0,0,0,0.55) → transparent`. Sits at `z-20`; BottomBar / Sidebar at `z-30`.

### `Compass.tsx`

Ring of N dots, one per project. Rotates so the active dot is anchored at left (9 o'clock). Currently `SIZE=56, DOT=6, RADIUS=22`.

## Data — `data/projects.ts`

```ts
type ImageEntry = { id, src, client, role, category, year };
type Project = {
  id, title,
  category?, liveLink?, impact?, video?,
  image: ImageEntry,
};
```

`make(seed)` builds a `Project`. Seed accepts `src` (override for image path) and `video` (mp4 path). Without `src`, the image falls back to `https://picsum.photos/seed/<slug>/1920/1080`.

`HIDDEN` set filters projects from display: `zappedin`, `yaad-app`, `humoniq`.

Sort is by `latestYear(image.year)` descending.

### Projects currently with real images (`/public/projects/`)
sellerapp, sellerapp-qc, google, reachinbox, zapmail, mailwarmup, visitoriq, coldstats, referralstack, threadjet, inboundiq

### Projects still on picsum
sellerapp-enterprise, socialgigs, inreach

### Projects with video
outbox-labs → `/projects/outbox.mp4` (19.9 MB)

When the user drops new files in `~/Downloads/webp/<slug>.webp`:
1. `cp ~/Downloads/webp/<slug>.webp public/projects/`
2. Add `src: "/projects/<slug>.webp"` to that seed's `make({...})` call.

## Deployment

- Initially set up for **GitHub Pages** with a workflow (`.github/workflows/nextjs.yml`) + `output: "export"` + `.nojekyll`.
- That setup was **reverted** in commit `738a27d`. The repo now deploys via **Vercel** (zero-config, auto-detect Next.js).
- The GitHub repo was **renamed** from `tirthjivani/tirthjivani.github.io` → `tirthjivani/Portfolio` (GitHub auto-redirects, but update the local remote: `git remote set-url origin https://github.com/tirthjivani/Portfolio.git`).
- GitHub Pages branch (`gh-pages`) has been deleted.
- 1 moderate Dependabot vulnerability is open: https://github.com/tirthjivani/Portfolio/security/dependabot/92

## Git state

Branch: `master`. Recent commits (newest first):
```
fe1f87e new theme: fullscreen slideshow + bottom chrome + gallery morph
738a27d revert GitHub Pages deploy in favor of Vercel
6b54a7a deploy to GitHub Pages via Actions
d7252c6 add List/Grid view toggle with shared-element morph
cc7e177 rebuild portfolio in Next.js App Router
```

Pushes need a token with **`workflow` scope** if any change touches `.github/workflows/*` (the current `gh` token has `gist, read:org, repo` — not workflow). For routine pushes that don't modify workflow files, the current creds work fine.

## Quirks / things to know

- **Body scroll lock**: only active in list view (via useEffect on `view`). Restored on unmount of the effect, so toggling to grid releases the lock.
- **`NAV_COOLDOWN`** can be lowered to ~500ms if the user wants faster nav (Motion's AnimatePresence interrupts in-flight transitions). It was tried and reverted; default stays at 1700ms.
- **Grid view scroll** is native body scroll (not snap). Card click → `handleSelectFromGrid(i)` sets direction "next", current = i, view = list.
- **Sidebar click** in list view → `navigateTo(i)` which picks a direction based on shortest cyclic distance (matches GSAP demo's wrap logic).
- **Image sizing**: all real screenshots are 2880×1800 (16:10). Grid uses `<Image width={2880} height={1800} class="block h-auto w-full">` for natural-aspect display. If a future image differs, store its dims per project or convert to per-image `aspectRatio` style.
- **Outbox video**: 19.9 MB is heavy for a portfolio first-load. Consider compressing or lazy-loading (`preload="metadata"` instead of full autoplay) if perf becomes a concern.
- **Tailwind v4** discovers classes by scanning source. The dynamic `GRID_COL_START` array has literal strings (`"col-start-1"`, etc.) so they get picked up by JIT — don't break that pattern.
- **Agentation devtool** triggers from `<DevTools/>` in `app/layout.tsx`. It only runs in dev (`NODE_ENV === "development"`). Page-feedback messages from the user originate here.
- **Index** view in the BottomBar is a label only (no view implemented). User mentioned it but hasn't requested implementation.

## What might be next

- Implement the **Index** view (whatever shape the user wants — list of titles only? thumbnails?).
- Real images for `sellerapp-enterprise`, `socialgigs`, `inreach`.
- Compress `outbox.mp4` or replace with a poster + click-to-play.
- Wire up the Navbar's "Work" anchor (currently `href="#outbox-labs"`, a no-op in list view because body scroll is locked).
- Handle "Photos" / "Archive" / "Info" sections (faded labels currently).
