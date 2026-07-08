"use client";

import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function ProjectsSection() {
  return (
    <section data-component="ProjectsSection">
      ProjectsSection
      <ProjectCard />
      <ProjectModal onClose={() => {}}>
        <div>ProjectModal placeholder content</div>
      </ProjectModal>
    </section>
  );
}
