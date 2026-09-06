# Handoff — Tirth Jivani Portfolio

## Stack

- **Next.js 16.2.6** App Router (TypeScript, Turbopack)
- **React 19.2.4**, **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **motion v12** — `import { animate, stagger, motion } from "motion/react"`. Most
  animation here is imperative `animate(element, …)` rather than `<motion.div>`.
- **lenis** for smooth scroll; one instance created in `SmoothScroll`, shared
  through the `lib/lenis.ts` module singleton.
- **next/font/local** for Circular Std (5 weights) and Geist Pixel Circle (the
  logo), all vendored in `app/fonts/`. Both are declared `preload: false` —
  see the IntroOverlay notes below for why.
- `agentation` (dev only) via `components/DevTools.tsx`.

CLAUDE.md / AGENTS.md flag: **this Next.js version differs from training data**.
Consult `node_modules/next/dist/docs/01-app/…` before touching routing,
rendering modes, or config.

## Routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | static | The portfolio. `PortfolioView` toggles List ↔ Surf. |
| `/about` | static | Client page; metadata lives in `app/about/layout.tsx`. |
| `/archives` | static | Client page; metadata in `app/archives/layout.tsx`. |
| `/project/[id]` | SSG | One page per project with `caseStudy: true`. |
| `/studio` | dynamic | **Dev + localhost only** (`lib/studioGuard.ts`), else 404. |
| `/preloader` | dynamic | Intro design study. Same dev-only guard. |
| `/robots.txt`, `/sitemap.xml` | static | Generated from `app/robots.ts` / `app/sitemap.ts`. |

## Component map

```
app/page.tsx                 server, renders <PortfolioView projects={projects} />

components/PortfolioView.tsx client orchestrator (view mode, activeIndex, intro gating)
  ├── Preloader              interaction blocker + scroll lock during the intro
  ├── IntroOverlay           the intro animation itself (pop → stack → loop)
  ├── Navbar                 fixed top chrome, mix-blend-mode: difference
  ├── ListView | SurfCanvas  the two views
  ├── ProjectSidebar         list view only, cyclic slot math
  └── BottomBar              Vertical / Surf toggle
```

### `PortfolioView.tsx`

Owns `view`, `activeIndex`, and the three-flag intro state (`preloading`,
`textReady`, `introSeen`). The intro plays on a real page load and is skipped on
internal SPA navs — see `readIntroSeen()`, which uses two sessionStorage flags
because `performance.navigation.type` stays `"reload"` for the whole document
lifetime.

### `ListView.tsx`

The vertical infinite list. Three identical copies of the project set stacked
vertically (`COPIES = 3`); scroll is kept inside the middle copy's range
`[copyH, 2·copyH)` and translated by ±`copyH` at the boundaries. `shiftScroll()`
does that by shifting lenis's internal `animate.value/from/to` alongside
`animatedScroll`/`targetScroll`, which preserves in-flight momentum — a plain
`lenis.scrollTo(…, { immediate: true })` calls `reset()` and kills the lerp,
which used to make the list feel stuck at the wrap boundary.

Other behaviour:
- Tiles are sized by `lib/sizeForAspect.ts` — every image is fitted into a
  240px box on its longest side, so the list is a ragged column, not a grid.
- Snap-to-centre fires when lenis velocity flattens out (60ms debounce).
- ListView registers a `scrollToIndexRef` callback so the sidebar can jump to a
  project using the list's **real** geometry, taking the shorter way round the
  loop. (PortfolioView used to compute this itself from a hardcoded 360px per
  section — roughly double the real average — so every sidebar click overshot
  and the wrap + snap dragged the page onto some other project entirely.)
- Non-active tiles are `grayscale(1)`; light mode swaps that for a
  `mix-blend-mode: luminosity` treatment (see `globals.css`).
- A `--list-vel-scale` CSS variable, driven from scroll velocity, gives tiles a
  subtle stretch while moving.
- Only the middle copy is in the a11y tree and keyboard-focusable; the outer
  two are `aria-hidden` pixel duplicates.

**Note:** the `intro` prop is always `false` — `IntroOverlay` runs the intro
now. The `introStage` `"pop"`/`"loop"` machinery inside `ListView` is therefore
unreachable, kept only because it is the more faithful port of the original
Figma flow. Delete it, or delete `IntroOverlay` and switch back, but there's no
reason to keep paying for both.

### `SurfCanvas.tsx` / `SurfWave.tsx` / `lib/useSurfWave.ts`

3D "wave" carousel. `useSurfWave` owns a fixed pool of `MAX_SLOTS = 48`
motion-value pairs; a given viewport only positions `layout.slotCount` of them
(roughly `perView + 4`) and parks the rest at opacity 0. Slot `i` always renders
item `i % items.length`, which is what makes the click → index inverse mapping
work. Drag / wheel / arrow keys all write `targetScroll`; a raf loop lerps
`currentScroll` toward it and recomputes every card's transform.

`initialIndex` centres the project the user was on in the list, so switching
views keeps their place.

### `IntroOverlay.tsx`

Full-screen intro over the live list: **pop** (each image scales 0→1 at centre,
staggered) → **stack** (deck slides into a vertical column) → **loop** (column
scrolls one full cycle) → cross-fade out. Only projects with a local image
participate (`src.startsWith("/")`).

It starts as soon as the **first** image has decoded, not when all of them
have. The pop is staggered `POP_STAGGER` apart, so tile *i* isn't needed until
`POP_START + i * POP_STAGGER` and the rest stream in behind it. Waiting for the
whole set is what used to leave a cold load on a blank screen for ~13s.

Two related things keep the opening seconds clear for images:
- `app/page.tsx` emits `<link rel="preload" as="image">` for the lead tile.
- **Fonts are declared `preload: false`** in `app/layout.tsx`. All text on this
  site is hidden until the intro finishes, so preloading ten font files ahead
  of the images was exactly backwards. Do not "fix" this by re-enabling it.
  Note `geist/font/pixel` declares five pixel variants at module scope, so
  importing it registers all five — the one that's used is vendored into
  `app/fonts/` instead.

### `Navbar.tsx`

Fixed, `mix-blend-mode: difference` so it inverts against whatever is behind it.
Light mode disables the blend (see `globals.css`) since difference-on-white
would erase it.

Logo sizing is a **responsive class**, not JS — the effect only handles the
`/about` scroll-shrink lerp and clears its inline overrides everywhere else. Do
not move `fontSize` back into the React `style` prop: the effect writes
`el.style` directly, so React owning the same property means any unrelated
re-render snaps the logo back to 64px.

## Data

`data/projects.seeds.json` → `data/projects.ts` (`make()` builds a `Project`).
`data/archives.json` → `data/archives.ts`.

- 22 seeds, 5 in `hidden`, **17 visible**, sorted by latest year descending.
- Case studies: `zappedin`, `sellerapp`, `sellerapp-qc`, `reachinbox`,
  `zapmail`, `threadjet`, `inboundiq`.
- Still on a picsum placeholder image: `outbox-labs`, `salesmonk` (both have a
  video, which is what actually renders).
- A seed with no `src` falls back to `https://picsum.photos/seed/<slug>/1920/1080`
  (allow-listed in `next.config.ts`).

### Media conventions

- Everything in `/public` is pre-compressed; nothing there should be a source
  file. Videos are h264 mp4, long edge ≤ 1280, **no audio track**, `+faststart`.
- Every video has a sibling poster still: `clip.mp4` → `clip-poster.webp`.
  `lib/posterFor.ts` derives the path; `/api/studio/upload` generates it on
  upload and `/api/studio/rename` carries it along on rename. The list view uses
  the poster as a plain `<img>` for the two non-playing copies, so one clip is
  never decoded three times.
- **Every local media file has its intrinsic size baked into the seed**
  (`width` / `height` = the size of whatever the list renders, i.e. the video
  when there is one). `useImageAspects` returns those synchronously on the
  first render, so the list and the intro lay out with correct per-tile heights
  in the SSR markup — no measuring pass, no reflow, no waiting on the network.
  `/api/studio/upload` reports the dimensions it measured and the studio stores
  them; if a seed is ever missing them, the hook falls back to measuring that
  one over the network. Every id is still guaranteed a value within 6s (falling
  back to 1.6 on error/timeout), because consumers gate layout on "all ids
  present" and a broken source must not stall that.

## Studio (dev-only CMS)

`/studio` + `/api/studio/*`, all behind `isStudioAllowed()` (dev **and**
localhost). Writes `data/*.json` and `public/projects`, compresses uploads
(sharp for images → webp, ffmpeg-static for video → mp4 + poster), and has a
publish flow that `git add`/`commit`/`push`es only the four studio-managed
paths.

## Deployment

Vercel (zero-config). `metadataBase` and the sitemap resolve through
`lib/siteUrl.ts`, which reads `NEXT_PUBLIC_SITE_URL`, then Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`, then falls back to localhost. **Set
`NEXT_PUBLIC_SITE_URL` once a custom domain is attached** — these are baked at
build time, so a wrong value ships silently in every share card.

## Quirks

- **Scroll lock** is held by `Preloader` during the intro and by `SurfCanvas`
  for the whole surf view. `Navbar` also takes it while the mobile menu is open.
- **`history.scrollRestoration = "manual"`** is set in `app/layout.tsx` so a
  refresh always starts at the top; `/about` and `/archives` additionally reset
  lenis on mount, since lenis preserves scroll across SPA navs.
- **`[data-rc] { opacity: 0 }`** in `globals.css` hides `CharReveal` characters
  pre-hydration. With JS disabled, nav text stays invisible.
- **Light mode** re-points `text-white/*` to `var(--fg)`. Anything that needs a
  themed border or fill should use `border-current` / `bg-current` rather than a
  `white` utility, which is what `CaseStudy` does.
- **Tailwind v4** scans source for literal class strings — don't build class
  names by concatenation.

## Known gaps

- `handoff.md` drifts fast. It was rewritten on 2026-09-06 after describing a
  long-dead architecture (`Slideshow.tsx`, `ProjectsCanvas.tsx`, a grid view).
- ESLint reports ~29 `react-hooks/refs` and `react-hooks/set-state-in-effect`
  errors. They're the new React Compiler rules firing on deliberate
  props-mirrored-into-refs patterns in the animation code — inert today, but
  they'd have to be resolved before enabling the compiler.
- `/about` socials: Dribbble / Figma / X are `"#"` placeholders and are filtered
  out of the render. Add a real URL to bring one back.
