import { Navbar } from "@/components/Navbar";
import { ProjectList } from "@/components/ProjectList";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ProjectList projects={projects} />
      </main>
    </>
  );
}
