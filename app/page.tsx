import { PortfolioView } from "@/components/PortfolioView";
import { projects } from "@/data/projects";

export default function Home() {
  // The intro pops projects in order, so its first tile is the one thing that
  // has to be on screen fast. Without this hint the image queues behind every
  // JS chunk and doesn't start downloading until ~3.6s on a slow connection.
  // React hoists <link rel="preload"> into <head>.
  const lead = projects.find((p) => p.image.src.startsWith("/"))?.image.src;
  return (
    <>
      {lead ? (
        <link rel="preload" as="image" href={lead} fetchPriority="high" />
      ) : null}
      <PortfolioView projects={projects} />
    </>
  );
}
