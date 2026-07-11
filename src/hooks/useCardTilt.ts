'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const MAX_TILT_DEG = 8;

export function useCardTilt(cardRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.set(card, { transformPerspective: 800 });

    const setRotateX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power3.out' });
    const setRotateY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power3.out' });

    function handleMouseMove(event: MouseEvent) {
      const rect = card!.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      setRotateY(offsetX * MAX_TILT_DEG * 2);
      setRotateX(-offsetY * MAX_TILT_DEG * 2);
    }

    function handleMouseLeave() {
      setRotateX(0);
      setRotateY(0);
    }

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: cardRef });
}
