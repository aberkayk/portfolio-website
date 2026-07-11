'use client';

import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { useProjectsReveal } from '@/hooks/useProjectsReveal';
import { OWNER_CONTEXT } from '@/lib/chat/context';

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);

  useProjectsReveal(sectionRef, cardRefs);

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-component="ProjectsSection"
      className="py-20 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div
              className="text-xs font-mono mb-2 tracking-widest"
              style={{ color: 'var(--color-accent)' }}
            >
              SELECTED WORK
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Projects
            </h2>
          </div>
          <a
            href="https://github.com/aberkayk"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            View all on GitHub <ChevronRight size={14} />
          </a>
        </div>

        {/* Cards grid — 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OWNER_CONTEXT.projects.map((project, index) => (
            <ProjectCard
              key={project.name}
              ref={(el) => {
                if (el) cardRefs.current[index] = el;
              }}
              project={project}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
