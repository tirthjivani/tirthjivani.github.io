import { PreloaderStep } from "@/components/PreloaderStep";
import { projects } from "@/data/projects";

export default function PreloaderPage() {
  return <PreloaderStep projects={projects} />;
}
