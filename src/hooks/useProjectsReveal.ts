'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface DirectionOffset {
  x: number;
  y: number;
  rotation: number;
}

// Desktop numbers, tuned for a 3-column grid: index % 3 equals the card's
// actual column (0 = left, 1 = middle, 2 = right), so the direction cycle
// and the visual layout agree by construction, not by coincidence.
const DESKTOP_DIRECTIONS: DirectionOffset[] = [
  { x: -220, y: 0, rotation: -18 },
  { x: 0, y: 160, rotation: 18 },
  { x: 220, y: 0, rotation: -18 },
];

// Mobile is a single column -- there is no "left/middle/right" to enter
// from, and the desktop x offsets (+-220px) would fly cards in from off
// the edge of a ~375px viewport. Drop the horizontal split entirely and
// just alternate rotation direction by parity for a little variety.
function getMobileDirection(index: number): DirectionOffset {
  return { x: 0, y: 80, rotation: index % 2 === 0 ? -8 : 8 };
}

export function useProjectsReveal(
  sectionRef: RefObject<HTMLElement | null>,
  cardRefs: RefObject<HTMLElement[]>,
) {
  useGSAP(() => {
    const cards = cardRefs.current;
    if (!sectionRef.current || !cards.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(cards, { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });
      return;
    }

    const mm = gsap.matchMedia();

    mm.add({ isMobile: '(max-width: 767px)', isDesktop: '(min-width: 768px)' }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const getOffset = (i: number) =>
        isMobile ? getMobileDirection(i) : DESKTOP_DIRECTIONS[i % DESKTOP_DIRECTIONS.length];

      gsap.set(cards, {
        x: (i) => getOffset(i).x,
        y: (i) => getOffset(i).y,
        rotation: (i) => getOffset(i).rotation,
        opacity: 0,
        scale: 0.85,
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true,
        },
      }).to(cards, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        ease: 'power3.out',
        stagger: 0.15,
      });
    });
  }, { scope: sectionRef });
}
