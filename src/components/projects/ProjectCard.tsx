'use client';

import { useRef, type Ref } from 'react';
import { ExternalLink } from 'lucide-react';
import { useCardTilt } from '@/hooks/useCardTilt';
import type { ProjectEntry } from '@/lib/chat/context';

interface ProjectCardProps {
  ref?: Ref<HTMLDivElement>;
  project: ProjectEntry;
}

export function ProjectCard({ ref, project }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(cardRef);

  const isBlue = project.accent === 'blue';
  const accentColor = isBlue ? 'var(--color-primary)' : 'var(--color-accent)';
  const accentBg = isBlue ? 'rgba(55,138,221,0.10)' : 'rgba(99,153,34,0.10)';
  const accentBorder = isBlue ? 'rgba(55,138,221,0.25)' : 'rgba(99,153,34,0.25)';
  const hoverGlow = isBlue
    ? '0 0 0 1px var(--color-primary), 0 8px 32px rgba(55,138,221,0.20)'
    : '0 0 0 1px var(--color-accent), 0 8px 32px rgba(99,153,34,0.20)';

  return (
    <div
      ref={(node) => {
        cardRef.current = node!;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-component="ProjectCard"
      data-accent={project.accent}
      className="rounded-[20px] p-6 flex flex-col gap-4 transition-all duration-250 cursor-default"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = hoverGlow;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
    >
      {/* Top row: year + link */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono text-muted-foreground">{project.year}</span>
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${project.name} on GitHub`}
          className="text-muted-foreground transition-colors duration-200"
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = accentColor)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '')}
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="text-lg font-bold font-heading text-foreground mb-2">{project.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      </div>

      {/* Technology tags */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: accentBg,
              color: accentColor,
              border: `1px solid ${accentBorder}`,
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
