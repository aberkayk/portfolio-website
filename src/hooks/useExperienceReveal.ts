'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useExperienceReveal(sectionRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Target the content cards (the rounded divs with job details)
      const cards = sectionRef.current.querySelectorAll('[data-component="ExperienceCard"]');
      if (!cards.length) return;

      if (reduced) {
        gsap.set(cards, { opacity: 1, x: 0 });
        return;
      }

      // Set initial state - cards start from the left and invisible
      gsap.set(cards, { opacity: 0, x: -80 });

      // Animate each card from left to right with stagger
      gsap.to(cards, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: sectionRef }
  );
}
