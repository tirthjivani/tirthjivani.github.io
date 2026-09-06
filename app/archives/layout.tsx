import type { Metadata } from "next";

// The page itself is a client component (lenis scroll reset), so its metadata
// lives here.
export const metadata: Metadata = {
  title: "Archives",
  description:
    "An archive of unreleased screens, explorations and shelved work by Tirth Jivani.",
  alternates: { canonical: "/archives" },
  openGraph: {
    title: "Archives - Tirth Jivani",
    description:
      "An archive of unreleased screens, explorations and shelved work.",
    url: "/archives",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archives - Tirth Jivani",
    description:
      "An archive of unreleased screens, explorations and shelved work.",
  },
};

export default function ArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
