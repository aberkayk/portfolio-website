"use client";

import { type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface UseScrollRevealOptions {
  /**
   * When true, the element fades back out as it scrolls past the bottom of
   * the trigger zone (and back in if the user scrolls up again) instead of
   * staying revealed permanently after the first reveal. Used for elements
   * that appear one-by-one down a long scroll (e.g. stacked project cards),
   * where leaving every prior one visible would defeat the "one at a time"
   * effect.
   */
  reversible?: boolean;
}

export function useScrollReveal(
  sectionRef: RefObject<HTMLElement | null>,
  options: UseScrollRevealOptions = {}
) {
  const { reversible = false } = options;

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set(sectionRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(sectionRef.current, { opacity: 0, y: 40 });

      gsap.to(sectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          // Reversible elements also need an `end` -- without one, ScrollTrigger
          // has no bottom boundary to fire the "leave" (reverse) action from.
          end: reversible ? "bottom 60%" : undefined,
          toggleActions: reversible
            ? "play reverse play reverse"
            : "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );
}
