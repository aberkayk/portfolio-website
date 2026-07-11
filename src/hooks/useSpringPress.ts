'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function useSpringPress(buttonRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const button = buttonRef.current;
    if (!button) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    function handlePointerDown() {
      gsap.to(button!, { scale: 0.94, duration: 0.1, ease: 'power2.out' });
    }

    function handlePointerUp() {
      gsap.to(button!, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    }

    button.addEventListener('pointerdown', handlePointerDown);
    button.addEventListener('pointerup', handlePointerUp);
    button.addEventListener('pointerleave', handlePointerUp);

    return () => {
      button.removeEventListener('pointerdown', handlePointerDown);
      button.removeEventListener('pointerup', handlePointerUp);
      button.removeEventListener('pointerleave', handlePointerUp);
    };
  }, { scope: buttonRef });
}
