'use client';

import { useRef } from 'react';
import { Timeline } from './Timeline';
import { useSectionReveal } from '@/hooks/useSectionReveal';

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      data-component="ExperienceSection"
      className="flex flex-col gap-8 px-6 py-16"
    >
      <h2 className="text-3xl">Experience</h2>
      <Timeline />
    </section>
  );
}
