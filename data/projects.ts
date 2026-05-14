export type ImageEntry = {
  id: string;
  src: string;
  client: string;
  role: string;
  category: string;
  year: string;
};

export type Project = {
  id: string;
  title: string;
  category?: string;
  liveLink?: string;
  impact?: string;
  video?: string;
  image: ImageEntry;
};

type ProjectSeed = {
  slug: string;
  title: string;
  client: string;
  role: string;
  year: string;
  category?: string;
  liveLink?: string;
  impact?: string;
  src?: string;
  video?: string;
};

const make = (seed: ProjectSeed): Project => ({
  id: seed.slug,
  title: seed.title,
  category: seed.category,
  liveLink: seed.liveLink,
  impact: seed.impact,
  video: seed.video,
  image: {
    id: seed.slug,
    src: seed.src ?? `https://picsum.photos/seed/${seed.slug}/1920/1080`,
    client: seed.client,
    role: seed.role,
    category: seed.category ?? "—",
    year: seed.year,
  },
});

const HIDDEN = new Set<string>(["zappedin", "yaad-app", "humoniq"]);

const allProjects: Project[] = [
  make({
    slug: "zappedin",
    title: "ZappedIn",
    client: "Outbox Labs",
    role: "Art Direction",
    year: "2025",
    category: "Website",
  }),
  make({
    slug: "yaad-app",
    title: "Yaad App",
    client: "10k Assignment",
    role: "Designer / Engineer",
    year: "2025",
    category: "App Design",
  }),
  make({
    slug: "humoniq",
    title: "Humoniq",
    client: "10k Assignment",
    role: "Brand Designer",
    year: "2025",
    category: "Website",
    liveLink: "https://humoniq.ai",
  }),
  make({
    slug: "sellerapp",
    title: "SellerApp",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2022 – 2024",
    category: "Product Redesign",
    liveLink: "https://sellerapp.com",
    src: "/projects/sellerapp.webp",
  }),
  make({
    slug: "sellerapp-qc",
    title: "SellerApp × QC",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 – 2024",
    category: "Product Redesign",
    liveLink: "https://www.sellerapp.com/quick-commerce.html",
    impact: "Partnered with ONDC & Google",
    src: "/projects/sellerapp-qc.webp",
  }),
  make({
    slug: "sellerapp-enterprise",
    title: "SellerApp × Enterprise",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 – 2024",
    category: "Exploration",
    liveLink: "https://www.sellerapp.com/ecommerce-data-api.html",
    impact: "Presented to 50+ Enterprise Companies",
  }),
  make({
    slug: "google",
    title: "Google",
    client: "Google × SellerApp",
    role: "UX Designer II",
    year: "2023",
    category: "UX Flow",
    liveLink: "https://opencommerce.withgoogle.com/",
    impact: "Featured in Google I/O",
    src: "/projects/google.webp",
  }),
  make({
    slug: "outbox-labs",
    title: "Outbox Labs",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "Website",
    liveLink: "https://outbox.vc",
    impact: "0 → 30M+ ARR",
    video: "/projects/outbox.mp4",
  }),
  make({
    slug: "reachinbox",
    title: "ReachInbox",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    category: "Product Redesign",
    liveLink: "https://reachinbox.ai",
    impact: "80%+ UX Improvement",
    src: "/projects/reachinbox.webp",
  }),
  make({
    slug: "zapmail",
    title: "Zapmail",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    category: "Product Redesign",
    liveLink: "https://zapmail.ai",
    impact: "4 → 25M+ ARR",
    src: "/projects/zapmail.webp",
  }),
  make({
    slug: "mailwarmup",
    title: "MailWarmup",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://mailwarmup.ai",
    src: "/projects/mailwarmup.webp",
  }),
  make({
    slug: "visitoriq",
    title: "VisitorIQ",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://visitoriq.co",
    src: "/projects/visitoriq.webp",
  }),
  make({
    slug: "coldstats",
    title: "ColdStats",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://coldstats.ai",
    impact: "Partnered with outboundleads.com",
    src: "/projects/coldstats.webp",
  }),
  make({
    slug: "referralstack",
    title: "ReferralStack",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://referralstack.ai",
    src: "/projects/referralstack.webp",
  }),
  make({
    slug: "threadjet",
    title: "ThreadJet",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://threadjet.ai",
    impact: "Superhuman for LinkedIn Messaging",
    src: "/projects/threadjet.webp",
  }),
  make({
    slug: "inboundiq",
    title: "InboundIQ",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://inboundiq-website.vercel.app/",
    impact: "100+ leads in 24hrs of MVP",
    src: "/projects/inboundiq.webp",
  }),
  make({
    slug: "socialgigs",
    title: "SocialGigs",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2026",
    category: "0 → 1 Product",
  }),
  make({
    slug: "inreach",
    title: "InReach",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2026",
    category: "0 → 1 Product",
  }),
];

function latestYear(yearStr: string): number {
  const matches = yearStr.match(/\d{4}/g);
  if (!matches) return -Infinity;
  return Math.max(...matches.map(Number));
}

export const projects: Project[] = allProjects
  .filter((p) => !HIDDEN.has(p.id))
  .sort((a, b) => latestYear(b.image.year) - latestYear(a.image.year));
