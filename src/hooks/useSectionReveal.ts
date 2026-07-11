'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useSectionReveal(sectionRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(sectionRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(sectionRef.current, { opacity: 0, y: 40 });

    gsap.to(sectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'bottom 60%',
        toggleActions: 'play reverse play reverse',
      },
    });
  }, { scope: sectionRef });
}
