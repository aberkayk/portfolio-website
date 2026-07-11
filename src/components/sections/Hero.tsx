import type { Ref } from 'react';

interface HeroProps {
  ref?: Ref<HTMLElement>;
}

export function Hero({ ref }: HeroProps) {
  return (
    <section
      ref={ref}
      data-component="Hero"
      className="relative isolate overflow-hidden"
    >
      {/* Three overlapping var()-driven radial gradients -- an inline style is
          clearer here than a giant Tailwind arbitrary-value class string, and
          every color is still a CSS variable, never a raw literal. */}
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
      Hero
    </section>
  );
}
