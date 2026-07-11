'use client';

import { useRef } from 'react';
import { OWNER_CONTEXT } from '@/lib/chat/context';
import { useSectionReveal } from '@/hooks/useSectionReveal';

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      data-component="SkillsSection"
      className="flex flex-col gap-8 px-6 py-16"
    >
      <h2 className="text-3xl">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {OWNER_CONTEXT.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-foreground"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
