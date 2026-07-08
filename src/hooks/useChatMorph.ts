'use client';

import { useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

function getPanelRect(isMobile: boolean): Rect {
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

export function useChatMorph(
  heroRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  suggestedPromptsRef: RefObject<HTMLElement | null>,
) {
  const [isDocked, setIsDocked] = useState(false);

  useGSAP(() => {
    if (!heroRef.current || !containerRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set(containerRef.current, { position: 'fixed' });

    const mm = gsap.matchMedia();

    mm.add({ isMobile: '(max-width: 767px)' }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const panel = getPanelRect(isMobile);
      const docked = getDockedSize(isMobile);
      const scrollEnd = isMobile ? '+=400' : '+=600';

      const panelStyle = {
        top: panel.top,
        left: panel.left,
        right: 'auto',
        bottom: 'auto',
        width: panel.width,
        height: panel.height,
        borderRadius: 24,
      };
      const dockedStyle = {
        top: 'auto',
        left: 'auto',
        right: 24,
        bottom: 24,
        width: docked.width,
        height: docked.height,
        borderRadius: 16,
      };

      gsap.set(containerRef.current, panelStyle);

      if (reduced) {
        let wasDocked = false;
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: scrollEnd,
          onUpdate: (self) => {
            const shouldDock = self.progress >= 0.5;
            if (shouldDock === wasDocked) return;
            wasDocked = shouldDock;
            setIsDocked(shouldDock);
            gsap
              .timeline()
              .to(containerRef.current, { opacity: 0, duration: 0.15 })
              .set(containerRef.current, shouldDock ? dockedStyle : panelStyle)
              .to(containerRef.current, { opacity: 1, duration: 0.15 });
          },
        });
        return;
      }

      let wasDocked = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
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
        tl.to(suggestedPromptsRef.current, { opacity: 0, duration: 0.3 }, 0);
      }

      tl.fromTo(
        containerRef.current,
        panelStyle,
        { ...dockedStyle, ease: 'none', duration: 1 },
        0,
      );
    });
  }, { scope: containerRef });

  return { isDocked };
}
