'use client';

import { useRef } from 'react';
import { Hero } from '@/components/sections/Hero';
import { Chat } from '@/components/chat/Chat';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { SkillsSection } from '@/components/sections/SkillsSection';

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <>
      <Hero ref={heroRef} />
      {/* Chat is positioned fixed by GSAP — starts centered in hero, morphs to bottom-right widget on scroll */}
      <Chat heroRef={heroRef} />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
    </>
  );
}
