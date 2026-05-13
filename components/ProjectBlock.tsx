import Image from "next/image";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
};

export function ProjectBlock({ project }: Props) {
  return (
    <section
      id={project.id}
      data-project-id={project.id}
      className="grid grid-cols-12 px-[10px] [scroll-margin-top:calc(50vh-(25vw-5px)*240/348)]"
    >
      <div className="col-start-3 col-span-3 flex flex-col gap-[10px]">
        {project.images.map((img, i) => (
          <div
            key={img.id}
            data-image-id={img.id}
            className="relative aspect-[348/480] w-full bg-[#1a1a1a]"
          >
            <Image
              src={img.src}
              alt={`${project.title} — image ${i + 1}`}
              fill
              sizes="(min-width: 768px) 25vw, 90vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
