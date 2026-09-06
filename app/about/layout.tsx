import type { Metadata } from "next";

// The page itself is a client component (scroll-driven photo flip + signature
// animation), so its metadata lives here.
export const metadata: Metadata = {
  title: "About",
  description:
    "Tirth Jivani is a senior product designer, engineer, and photographer based in Bangalore, India - working across UX, design systems, and AI.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About - Tirth Jivani",
    description:
      "Senior product designer, engineer, and photographer based in Bangalore, India.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Tirth Jivani",
    description:
      "Senior product designer, engineer, and photographer based in Bangalore, India.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
