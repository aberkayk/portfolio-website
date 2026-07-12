'use client';

import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { useProjectsReveal } from '@/hooks/useProjectsReveal';
import { OWNER_CONTEXT } from '@/lib/chat/context';

const INITIAL_VISIBLE = 4;

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showAll, setShowAll] = useState(false);

  const projects = showAll
    ? OWNER_CONTEXT.projects
    : OWNER_CONTEXT.projects.slice(0, INITIAL_VISIBLE);

  useProjectsReveal(sectionRef, projects.length);

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-component="ProjectsSection"
      className="py-20 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex items-end justify-between">
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

        {/* Grid -- 1 column on mobile, 2 columns from md up. Each card slides
            in from the left or right (alternating by index) as it scrolls
            into view, see useProjectsReveal. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        {!showAll && OWNER_CONTEXT.projects.length > INITIAL_VISIBLE && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-[10px] border border-border px-6 py-2.5 text-sm font-semibold font-heading text-foreground transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-foreground)_8%,transparent)]"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
