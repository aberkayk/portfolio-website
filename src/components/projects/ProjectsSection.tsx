'use client';

import { useRef } from 'react';
import { ProjectCard } from './ProjectCard';
import { useProjectsReveal } from '@/hooks/useProjectsReveal';

const PROJECTS = [
  { id: '1', title: 'Project 1' },
  { id: '2', title: 'Project 2' },
  { id: '3', title: 'Project 3' },
  { id: '4', title: 'Project 4' },
  { id: '5', title: 'Project 5' },
  { id: '6', title: 'Project 6' },
];

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);

  useProjectsReveal(sectionRef, cardRefs);

  return (
    <section
      ref={sectionRef}
      data-component="ProjectsSection"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      {PROJECTS.map((project, index) => (
        <ProjectCard
          key={project.id}
          ref={(el) => {
            if (el) {
              cardRefs.current[index] = el;
            }
          }}
          title={project.title}
          colorVariant={index % 2 === 0 ? 'primary' : 'accent'}
        />
      ))}
    </section>
  );
}
