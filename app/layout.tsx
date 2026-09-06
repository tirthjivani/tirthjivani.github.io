import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClickSound } from "@/components/ClickSound";
import { DevTools } from "@/components/DevTools";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

// `preload: false` on purpose. next/font preloads every declared weight, which
// put five OTFs (212KB) ahead of the first project image on the wire — and this
// site hides ALL text until the intro finishes (see `[data-rc]` in globals.css
// and the `introReady` gating), so nothing is waiting to be painted in these
// faces. Dropping the preload hands the opening seconds of the connection to
// the images, which ARE what the user is looking at. The browser still fetches
// each weight on demand, and `display: swap` covers the gap.
const circularStd = localFont({
  src: [
    { path: "./fonts/CircularStd-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/CircularStd-Book.otf", weight: "400", style: "normal" },
    { path: "./fonts/CircularStd-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/CircularStd-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/CircularStd-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-circular",
  display: "swap",
  preload: false,
});

// Vendored rather than imported from `geist/font/pixel`: that module declares
// five pixel variants (Circle, Square, Grid, Line, Triangle) at module scope,
// so importing any one of them registered and preloaded all five — ~130KB of
// fonts this site never renders.
const geistPixelCircle = localFont({
  src: "./fonts/GeistPixel-Circle.woff2",
  variable: "--font-geist-pixel-circle",
  weight: "500",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
  preload: false,
});

const TITLE = "Tirth Jivani - Selected Work";
const DESCRIPTION =
  "Selected projects, case studies and writing by Tirth Jivani - a senior product designer working on AI SaaS products and design systems.";

export const metadata: Metadata = {
  // Required for the file-based opengraph-image / twitter-image below to
  // resolve to absolute URLs. Without it Next falls back to localhost:3000.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Sub-pages set just their own name; this frames it.
    template: "%s - Tirth Jivani",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Tirth Jivani",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${circularStd.variable} ${geistPixelCircle.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply persisted theme before paint to avoid a dark→light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        {/* Own scroll restoration so a refresh always starts at the top and the
            preloader runs from the default position (no browser scroll restore). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('scrollRestoration'in history){history.scrollRestoration='manual';}window.scrollTo(0,0);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <SmoothScroll />
        <ClickSound />
        {children}
        <DevTools />
      </body>
    </html>
  );
}
