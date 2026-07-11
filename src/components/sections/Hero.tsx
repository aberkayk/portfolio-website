'use client';

import { useRef, type Ref } from 'react';
import { Code2, Dumbbell } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface HeroProps {
  ref?: Ref<HTMLElement>;
}

export function Hero({ ref }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scrub the hero text in from invisible to visible across the same
  // scroll range that useChatMorph uses to morph the chat to the widget.
  // This way: scroll=0 → only chat visible; scroll~400px → chat docked,
  // hero text fully visible.
  useGSAP(
    () => {
      if (!contentRef.current || !sectionRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(contentRef.current, { opacity: 0, y: 24 });

      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=500',
          scrub: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      data-component="Hero"
      className="relative isolate overflow-hidden min-h-screen px-6 flex flex-col justify-center"
    >
      {/* Animated mesh background */}
      <div
        aria-hidden="true"
        className="animate-hero-mesh pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, var(--color-primary) 0%, transparent 45%), ' +
            'radial-gradient(circle at 80% 20%, var(--color-accent) 0%, transparent 40%), ' +
            'radial-gradient(circle at 50% 80%, var(--color-primary-700) 0%, transparent 45%)',
          backgroundSize: '200% 200%',
          filter: 'blur(60px)',
        }}
      />

      {/* Radial top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(55,138,221,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Hero text — hidden initially, fades in as chat morphs away */}
      <div ref={contentRef} className="max-w-6xl mx-auto w-full pt-32 pb-64">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{
            background: 'rgba(55,138,221,0.10)',
            border: '1px solid rgba(55,138,221,0.25)',
            color: 'var(--color-primary)',
          }}
        >
          <Code2 size={12} />
          Available for new projects
          <Dumbbell size={12} style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading leading-none tracking-tight mb-5">
          Frontend Engineer
          <br />
          <span className="text-primary">&amp;</span>{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-100))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hybrid Athlete
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg max-w-xl leading-relaxed text-muted-foreground">
          I build high-performance digital products by day and train across running,
          CrossFit &amp; Hyrox at weekends.{' '}
          <span className="text-foreground font-medium">Ahmet Berkay Koçak</span> — full-stack
          software developer based in Istanbul.
        </p>
      </div>
    </section>
  );
}
