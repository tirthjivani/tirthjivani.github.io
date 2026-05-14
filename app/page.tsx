import { PortfolioView } from "@/components/PortfolioView";
import { projects } from "@/data/projects";

export default function Home() {
  return <PortfolioView projects={projects} />;
}
