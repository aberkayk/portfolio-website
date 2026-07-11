"use client";

import { useState, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface DockedSize {
  width: number;
  height: number;
}

const DOCK_MARGIN = 24;

// Exported so Chat.tsx can deterministically re-apply the correct panel
// geometry immediately after killing a competing minimize/expand tween on
// undock (see Chat.tsx) -- ScrollTrigger.update()/refresh() are not
// reliable for this: if ScrollTrigger already considers the current
// scroll position "applied" (nothing changed since its last check), a
// forced update is a no-op and won't re-render over whatever a competing
// tween wrote afterward. Calling this directly bypasses that caching
// entirely.
export function getPanelRect(isMobile: boolean): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = isMobile ? vw * 0.92 : Math.min(vw * 0.7, 720);
  const height = isMobile ? vh * 0.7 : Math.min(vh * 0.75, 640);
  return { width, height, top: (vh - height) / 2, left: (vw - width) / 2 };
}

export function getDockedSize(isMobile: boolean): DockedSize {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.92, 360);
  const height = isMobile ? Math.min(vh * 0.6, 420) : 480;
  return { width, height };
}

// Anchors a box of the given size to the bottom-right corner, DOCK_MARGIN from
// each edge — used for both the docked widget and (in Task 3) the minimized
// button, so every state stays purely numeric (top/left only, never 'auto')
// and GSAP can smoothly tween between any two of these rects.
export function getBottomRightRect(size: DockedSize): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    width: size.width,
    height: size.height,
    top: vh - size.height - DOCK_MARGIN,
    left: vw - size.width - DOCK_MARGIN,
  };
}

export function useChatMorph(
  heroRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  suggestedPromptsRef: RefObject<HTMLElement | null>
) {
  const [isDocked, setIsDocked] = useState(false);

  useGSAP(
    () => {
      if (!heroRef.current || !containerRef.current) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.set(containerRef.current, { position: "fixed" });

      const mm = gsap.matchMedia();

      mm.add(
        { isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)" },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };
          const panel = getPanelRect(isMobile);
          const docked = getBottomRightRect(getDockedSize(isMobile));
          const scrollEnd = isMobile ? "+=300" : "+=200";

          const panelStyle = {
            top: panel.top,
            left: panel.left,
            width: panel.width,
            height: panel.height,
            borderRadius: 24,
          };
          const dockedStyle = {
            top: docked.top,
            left: docked.left,
            width: docked.width,
            height: docked.height,
            borderRadius: 16,
          };

          gsap.set(containerRef.current, panelStyle);

          if (reduced) {
            let wasDocked = false;
            ScrollTrigger.create({
              trigger: heroRef.current,
              start: "top top",
              end: scrollEnd,
              onUpdate: (self) => {
                const shouldDock = self.progress >= 0.5;
                if (shouldDock === wasDocked) return;
                wasDocked = shouldDock;
                setIsDocked(shouldDock);
                gsap
                  .timeline()
                  .to(containerRef.current, { opacity: 0, duration: 0.15 })
                  .set(
                    containerRef.current,
                    shouldDock ? dockedStyle : panelStyle
                  )
                  .to(containerRef.current, { opacity: 1, duration: 0.15 });
              },
            });
            return;
          }

          let wasDocked = false;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: scrollEnd,
              scrub: true,
              onUpdate: (self) => {
                const shouldDock = self.progress >= 0.999;
                if (shouldDock === wasDocked) return;
                wasDocked = shouldDock;
                setIsDocked(shouldDock);
              },
            },
          });

          if (suggestedPromptsRef.current) {
            tl.to(
              suggestedPromptsRef.current,
              { opacity: 0, duration: 0.3, ease: "none" },
              0
            );
          }

          tl.fromTo(
            containerRef.current,
            panelStyle,
            { ...dockedStyle, ease: "none", duration: 1 },
            0
          );
        }
      );
    },
    { scope: containerRef }
  );

  return { isDocked };
}
