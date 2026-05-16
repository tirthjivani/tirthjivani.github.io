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
  caseStudy: boolean;
  impact?: string;
  video?: string;
  introduction?: string;
  timeline?: string;
  image: ImageEntry;
};

type ProjectSeed = {
  slug: string;
  title: string;
  client: string;
  role: string;
  year: string;
  caseStudy: boolean;
  category?: string;
  liveLink?: string;
  impact?: string;
  src?: string;
  video?: string;
  introduction?: string;
  timeline?: string;
};

const make = (seed: ProjectSeed): Project => ({
  id: seed.slug,
  title: seed.title,
  category: seed.category,
  liveLink: seed.liveLink,
  caseStudy: seed.caseStudy,
  impact: seed.impact,
  video: seed.video,
  introduction: seed.introduction,
  timeline: seed.timeline,
  image: {
    id: seed.slug,
    src: seed.src ?? `https://picsum.photos/seed/${seed.slug}/1920/1080`,
    client: seed.client,
    role: seed.role,
    category: seed.category ?? "—",
    year: seed.year,
  },
});

const HIDDEN = new Set<string>(["zappedin", "yaad-app", "humoniq", "socialgigs", "inreach", "sellerapp-enterprise"]);

const allProjects: Project[] = [
  make({
    slug: "zappedin",
    title: "ZappedIn",
    client: "Outbox Labs",
    role: "Art Direction",
    year: "2025",
    category: "Website",
    caseStudy: false,
  }),
  make({
    slug: "yaad-app",
    title: "Yaad App",
    client: "10k Assignment",
    role: "Designer / Engineer",
    year: "2025",
    category: "App Design",
    caseStudy: false,
  }),
  make({
    slug: "humoniq",
    title: "Humoniq",
    client: "10k Assignment",
    role: "Brand Designer",
    year: "2025",
    category: "Website",
    liveLink: "https://humoniq.ai",
    caseStudy: false,
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
    caseStudy: true,
    introduction:
      "We rebuilt SellerApp as the unified seller workspace, pulling fragmented marketplace tools — ads, inventory, listings, analytics — into one decision surface. The redesign moved sellers from juggling dashboards to acting on a single source of truth, with workflows tuned for the daily rhythm of Amazon, not the data team's hierarchy.",
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
    caseStudy: true,
    introduction:
      "A bet on what India's commerce stack looks like next. We partnered with ONDC and Google to design SellerApp's Quick Commerce surface — onboarding small sellers onto open networks, normalising catalogs across buyer apps, and making the unfamiliar feel ordinary on day one.",
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
    caseStudy: true,
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
    caseStudy: false,
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
    caseStudy: false,
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
    caseStudy: true,
    introduction:
      "ReachInbox needed to feel less like a tool and more like a workspace. We rebuilt the entire UX around what sequence operators actually do all day — drafting, reviewing, replying, triaging — and cut the time to get there by 80%. Every surface argues for the next action instead of asking the user to assemble one.",
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
    caseStudy: true,
    introduction:
      "Zapmail's job is to make cold email infrastructure invisible. The redesign focused on the few moments that matter — domain setup, deliverability, and inbox warm-up — and made everything else recede. ARR moved from $4M to $25M+ on the back of that focus.",
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
    caseStudy: false,
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
    caseStudy: false,
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
    caseStudy: false,
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
    caseStudy: false,
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
    caseStudy: true,
    introduction:
      "ThreadJet treats LinkedIn like an inbox, not a feed. We designed the messaging surface a power user actually wants — keyboard-first, omni-search, AI-drafted replies — pitched as Superhuman for the platform that didn't have one. The shape of the product is the argument.",
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
    caseStudy: true,
    introduction:
      "InboundIQ ships intent without the warehouse. We designed and built the product end to end — sourcing signals, scoring, and outreach — into one surface lean teams can run from. 100+ leads landed in the first 24 hours of the MVP.",
  }),
  make({
    slug: "socialgigs",
    title: "SocialGigs",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2026",
    category: "Website & Art Direction",
    caseStudy: false,
  }),
  make({
    slug: "inreach",
    title: "InReach",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2026",
    category: "0 → 1 Product",
    caseStudy: false,
  }),
  make({
    slug: "shutterhalf",
    title: "Studio Shutterhalf",
    client: "The Summer Design",
    role: "Designer / Engineer",
    year: "2026",
    category: "Website & Art Direction",
    liveLink: "https://shutterhalf.com",
    src: "/projects/shutterhalf.webp",
    caseStudy: false,
  }),
  make({
    slug: "golden",
    title: "Golden Group",
    client: "The Summer Design",
    role: "Art Director",
    year: "2026",
    category: "Website & Art Direction",
    liveLink: "https://golden-website-three.vercel.app/",
    src: "/projects/golden.webp",
    caseStudy: false,
  }),
  make({
    slug: "salesmonk",
    title: "SalesMonk",
    client: "The Summer Design",
    role: "Website",
    year: "2025",
    category: "Website & Art Direction",
    liveLink: "https://salesmonk.ai",
    video: "/projects/salesmonk.mov",
    caseStudy: false,
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
