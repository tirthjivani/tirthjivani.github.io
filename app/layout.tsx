import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistPixelCircle } from "geist/font/pixel";
import { ClickSound } from "@/components/ClickSound";
import { DevTools } from "@/components/DevTools";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const circularStd = localFont({
  src: [
    {
      path: "./fonts/CircularStd-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/CircularStd-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/CircularStd-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/CircularStd-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/CircularStd-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-circular",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tirth Jivani - Selected Work",
  description: "Selected projects, case studies and writing by Tirth Jivani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${circularStd.variable} ${GeistPixelCircle.variable} h-full antialiased`}
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
