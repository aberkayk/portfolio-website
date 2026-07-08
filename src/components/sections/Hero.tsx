import type { Ref } from 'react';

interface HeroProps {
  ref?: Ref<HTMLElement>;
}

export function Hero({ ref }: HeroProps) {
  return (
    <section ref={ref} data-component="Hero">
      Hero
    </section>
  );
}
