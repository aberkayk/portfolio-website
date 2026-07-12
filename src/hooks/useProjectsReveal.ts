"use client";

import { type RefObject, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SLIDE_DISTANCE = 80;

/**
 * Reveals project cards as they scroll into view, alternating entrance
 * direction by index -- even cards slide in from the left, odd cards from
 * the right. Each card gets its own ScrollTrigger (rather than one trigger
 * animating the whole set) so a 2-column grid reveals row by row as the
 * user scrolls, not all at once.
 *
 * `count` is the number of cards currently rendered -- pass the (possibly
 * growing, e.g. after a "Load more" click) project count so newly-mounted
 * cards get the same reveal treatment. Already-revealed cards are tracked
 * in `revealedRef` (persists across re-runs since it's a ref, and React
 * reuses the same DOM nodes for unchanged keys) so a dependency change
 * doesn't re-hide/re-animate cards that are already on screen.
 */
export function useProjectsReveal(
  sectionRef: RefObject<HTMLElement | null>,
  count: number
) {
  const revealedRef = useRef<Set<Element>>(new Set());

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const cards = sectionRef.current.querySelectorAll(
        '[data-component="ProjectCard"]'
      );
      if (!cards.length) return;

      if (reduced) {
        gsap.set(cards, { opacity: 1, x: 0 });
        return;
      }

      cards.forEach((card, i) => {
        if (revealedRef.current.has(card)) return;
        revealedRef.current.add(card);

        const fromX = i % 2 === 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
        gsap.set(card, { opacity: 0, x: fromX });
        gsap.to(card, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [count] }
  );
}
