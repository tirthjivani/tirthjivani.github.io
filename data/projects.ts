export type ImageEntry = {
  id: string;
  src: string;
  client: string;
  role: string;
  category: string;
  year: string;
};

export type CaseStudyImage = {
  src: string;
  alt?: string;
  // 12-column grid. Defaults: colStart auto-flow, colSpan 12, rowSpan 1.
  colStart?: number;
  colSpan?: number;
  rowSpan?: number;
  // width/height ratio used to size the cell (e.g. 16/9 = 1.78). Default 16/9.
  aspect?: number;
  video?: boolean;
  // optional caption rendered below the image
  caption?: string;
};

export type CaseStudySection =
  | { kind: "body"; text: string }
  | { kind: "intro"; label: string; heading: string }
  | { kind: "images"; items: CaseStudyImage[]; gap?: number };

export type CaseStudyLink = { title: string; href?: string };

export type Project = {
  id: string;
  title: string;
  category?: string;
  liveLink?: string;
  caseStudy: boolean;
  impact?: string;
  video?: string;
  introduction?: string;
  seoDescription?: string;
  timeline?: string;
  caseStudies?: CaseStudyLink[];
  sections?: CaseStudySection[];
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
  seoDescription?: string;
  timeline?: string;
  caseStudies?: CaseStudyLink[];
  sections?: CaseStudySection[];
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
  seoDescription: seed.seoDescription,
  timeline: seed.timeline,
  caseStudies: seed.caseStudies,
  sections: seed.sections,
  image: {
    id: seed.slug,
    src: seed.src ?? `https://picsum.photos/seed/${seed.slug}/1920/1080`,
    client: seed.client,
    role: seed.role,
    category: seed.category ?? "-",
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
    year: "2022 - 2024",
    timeline: "5-6 months",
    category: "Product Redesign",
    liveLink: "https://sellerapp.com",
    src: "/projects/sellerapp.webp",
    caseStudy: true,
    caseStudies: [
      {
        title: "SellerApp Dashboard",
        href: "https://www.sellerapp.com/dashboard.html",
      },
      {
        title: "SellerApp Website",
        href: "https://www.sellerapp.com/website.html",
      },
    ],
    introduction:
      "SellerApp's product lived across a dozen tabs. I rebuilt it as one workspace covering ads, inventory, listings, and analytics, tuned to the seller's day rather than the data model. A fully responsive, automated design system carried that same logic into a refreshed marketing site and net-new growth assets.",
    seoDescription:
      "SellerApp dashboard and website redesign: a data-driven overhaul of the seller workspace with new flows, a responsive automated design system, and high-impact marketing assets.",
  }),
  make({
    slug: "sellerapp-qc",
    title: "SellerApp × QC",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 - 2024",
    timeline: "2 months",
    category: "Product Redesign",
    liveLink: "https://www.sellerapp.com/quick-commerce.html",
    impact: "Partnered with ONDC & Google",
    src: "/projects/sellerapp-qc.webp",
    caseStudy: true,
    introduction:
      "India's commerce stack is rewiring itself around open networks. SellerApp × QC, designed with ONDC and Google, onboards small sellers in a few taps, normalises their catalogs across every buyer app, and makes a brand-new protocol feel ordinary on day one.",
    seoDescription:
      "Designing SellerApp's Quick Commerce surface with ONDC and Google: onboarding small sellers onto open networks and normalising catalogs across buyer apps.",
  }),
  make({
    slug: "sellerapp-enterprise",
    title: "SellerApp × Enterprise",
    client: "SellerApp",
    role: "UX Designer II",
    year: "2023 - 2024",
    timeline: "5 months",
    category: "Exploration",
    liveLink: "https://www.sellerapp.com/ecommerce-data-api.html",
    impact: "Presented to 50+ Enterprise Companies",
    caseStudy: true,
    introduction:
      "Enterprises don't buy a dashboard; they buy a data layer. I repositioned SellerApp's product as an API-first proposition for retailers and FMCG, a controlled exploration we walked into 50+ enterprise rooms with.",
    seoDescription:
      "Repositioning SellerApp as an API-first ecommerce data layer for enterprise retail and FMCG, an exploration presented to 50+ enterprise companies.",
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
    timeline: "7 months",
    category: "Product Redesign",
    liveLink: "https://reachinbox.ai",
    impact: "80%+ UX Improvement",
    src: "/projects/reachinbox.webp",
    caseStudy: true,
    introduction:
      "ReachInbox should feel less like a tool and more like a workspace. I rebuilt the UX around what sequence operators actually do all day: draft, review, reply, triage. The time to do it dropped by 80%+, and every surface argues for the next action instead of asking the user to assemble one.",
    seoDescription:
      "Rebuilding ReachInbox as a workspace for sequence operators: drafting, reviewing, replying and triaging in 80% less time, with every surface arguing for the next action.",
  }),
  make({
    slug: "zapmail",
    title: "Zapmail",
    client: "Outbox Labs",
    role: "Sr. Product Designer",
    year: "2026",
    timeline: "3 months",
    category: "Product Redesign",
    liveLink: "https://zapmail.ai",
    impact: "4 → 25M+ ARR",
    src: "/projects/zapmail.webp",
    caseStudy: true,
    introduction:
      "Cold email infrastructure is plumbing, so it should be invisible. Zapmail's redesign focused on the three moments that decide whether sending works at all: domain setup, deliverability, and inbox warm-up. ARR moved from $4M to $25M+ on the back of that focus.",
    seoDescription:
      "Redesigning Zapmail to make cold email infrastructure invisible, focused on domain setup, deliverability and warm-up. ARR scaled from $4M to $25M+.",
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
    timeline: "2 months",
    category: "0 → 1 Product",
    liveLink: "https://threadjet.ai",
    impact: "Superhuman for LinkedIn Messaging",
    src: "/projects/threadjet.webp",
    caseStudy: true,
    introduction:
      "ThreadJet treats LinkedIn like an inbox, not a feed. We designed the messaging surface a power user actually wants: keyboard-first, omni-search, AI-drafted replies, pitched as Superhuman for the platform that didn't have one. The shape of the product is the argument.",
    seoDescription:
      "ThreadJet: an AI-powered, keyboard-first workspace that reimagines LinkedIn DMs around speed, shortcuts, focus and privacy, with context-aware replies and inbox-zero triage.",
  }),
  make({
    slug: "inboundiq",
    title: "InboundIQ",
    client: "Outbox Labs",
    role: "Designer / Engineer",
    year: "2025",
    timeline: "1 month",
    category: "0 → 1 Product",
    liveLink: "https://inboundiq-website.vercel.app/",
    impact: "100+ leads in 24hrs of MVP",
    src: "/projects/inboundiq.webp",
    video: "/projects/inboundiq.mp4",
    caseStudy: true,
    introduction:
      "InboundIQ ships intent without the warehouse. I designed and built the whole thing end to end (sourcing signals, scoring, outreach) into one surface lean teams can actually run from. 100+ leads landed in the first 24 hours of the MVP.",
    seoDescription:
      "InboundIQ: an AI outbound engine that identifies high-intent buyers and runs hyper-personalised outreach, charging only for interested leads. 100+ leads in the first 24 hours of the MVP.",
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
