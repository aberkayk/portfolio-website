'use client';

import { useRef, type Ref } from 'react';
import { useCardTilt } from '@/hooks/useCardTilt';

interface ProjectCardProps {
  ref?: Ref<HTMLDivElement>;
  title: string;
  colorVariant: 'primary' | 'accent';
}

export function ProjectCard({ ref, title, colorVariant }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(cardRef);

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-component="ProjectCard"
      className={`rounded-2xl border border-border border-t-4 bg-surface-1 p-6 transition-shadow hover:shadow-glow-accent ${
        colorVariant === 'primary' ? 'border-t-primary' : 'border-t-accent'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {title}
    </div>
  );
}
