import type { Ref } from 'react';

interface ProjectCardProps {
  ref?: Ref<HTMLDivElement>;
  title: string;
  colorVariant: 'primary' | 'accent';
}

export function ProjectCard({ ref, title, colorVariant }: ProjectCardProps) {
  return (
    <div
      ref={ref}
      data-component="ProjectCard"
      className={`rounded-2xl border border-border border-t-4 bg-surface-1 p-6 ${
        colorVariant === 'primary' ? 'border-t-primary' : 'border-t-accent'
      }`}
    >
      {title}
    </div>
  );
}
