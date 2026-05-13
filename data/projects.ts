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
  images: [ImageEntry, ImageEntry];
};

type ProjectSeed = {
  slug: string;
  title: string;
  client: string;
  role: string;
  year: string;
  category?: string;
  liveLink?: string;
};

const make = (seed: ProjectSeed): Project => ({
  id: seed.slug,
  title: seed.title,
  category: seed.category,
  liveLink: seed.liveLink,
  images: [
    {
      id: `${seed.slug}__0`,
      src: `https://picsum.photos/seed/${seed.slug}a/900/1240`,
      client: seed.client,
      role: seed.role,
      category: seed.category ?? "—",
      year: seed.year,
    },
    {
      id: `${seed.slug}__1`,
      src: `https://picsum.photos/seed/${seed.slug}b/900/1240`,
      client: seed.client,
      role: seed.role,
      category: seed.category ?? "—",
      year: seed.year,
    },
  ],
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
  }),
  make({
    slug: "sellerapp-qc",
    title: "SellerApp × QC",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 – 2024",
    category: "Product Redesign",
    liveLink: "https://www.sellerapp.com/quick-commerce.html",
  }),
  make({
    slug: "sellerapp-enterprise",
    title: "SellerApp × Enterprise",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 – 2024",
    category: "Exploration",
    liveLink: "https://www.sellerapp.com/ecommerce-data-api.html",
  }),
  make({
    slug: "google",
    title: "Google",
    client: "Google × SellerApp",
    role: "UX Designer II",
    year: "2023",
    category: "UX Flow",
    liveLink: "https://opencommerce.withgoogle.com/",
  }),
  make({
    slug: "outbox-labs",
    title: "Outbox Labs",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "Website",
    liveLink: "https://outbox.vc",
  }),
  make({
    slug: "reachinbox",
    title: "ReachInbox",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    category: "Product Redesign",
    liveLink: "https://reachinbox.ai",
  }),
  make({
    slug: "zapmail",
    title: "Zapmail",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    category: "Product Redesign",
    liveLink: "https://zapmail.ai",
  }),
  make({
    slug: "mailwarmup",
    title: "MailWarmup",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://mailwarmup.ai",
  }),
  make({
    slug: "visitoriq",
    title: "VisitorIQ",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://visitoriq.co",
  }),
  make({
    slug: "coldstats",
    title: "ColdStats",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://coldstats.ai",
  }),
  make({
    slug: "referralstack",
    title: "ReferralStack",
    client: "Outbox Labs",
    role: "Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://referralstack.ai",
  }),
  make({
    slug: "threadjet",
    title: "ThreadJet",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://threadjet.ai",
  }),
  make({
    slug: "inboundiq",
    title: "InboundIQ",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2025",
    category: "0 → 1 Product",
    liveLink: "https://inboundiq-website.vercel.app/",
  }),
  make({
    slug: "socialgigs",
    title: "SocialGigs",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    category: "0 → 1 Product",
  }),
  make({
    slug: "inreach",
    title: "InReach",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
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
  .sort(
    (a, b) => latestYear(b.images[0].year) - latestYear(a.images[0].year)
  );
