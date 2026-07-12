'use client';

import { useRef } from 'react';
import { Timeline } from './Timeline';
import { useExperienceReveal } from '@/hooks/useExperienceReveal';

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useExperienceReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="experience"
      data-component="ExperienceSection"
      className="py-20 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div
            className="text-xs font-mono mb-2 tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            CAREER HISTORY
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Experience
          </h2>
        </div>
        <Timeline />
      </div>
    </section>
  );
}
