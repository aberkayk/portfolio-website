---
name: gsap-scroll-animations
description: Use whenever implementing or reviewing a scroll-linked animation in this portfolio project — specifically the hero-to-widget chat morph (Phase 2 of PLAN.md) and the staggered "dealing cards" projects reveal (Phase 3). Covers the shared GSAP + ScrollTrigger + useGSAP setup, both established patterns, and this project's rules (reduced-motion fallback, no static colors, single-component Chat). Check here before writing a new scroll animation from scratch.
---

# GSAP Scroll Animations (this project)

Two scroll-linked animations are planned for this site: the hero chat box morphing into a
docked widget (Phase 2), and project cards "dealing" into view (Phase 3). Both share one
setup and one set of rules — read this before writing either.

**See also (official GSAP skills installed in this project):** [gsap-react](../gsap-react/SKILL.md)
for `useGSAP()`/cleanup details, [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) for the
full ScrollTrigger config reference, [gsap-core](../gsap-core/SKILL.md) for tween/stagger/easing
basics, [gsap-performance](../gsap-performance/SKILL.md) for the transform-vs-layout-property
tradeoff referenced below.

## Setup (shared by both patterns)

This project uses `useGSAP()` from `@gsap/react` (already installed), not a raw `useEffect`
+ `gsap.context()`. `useGSAP` scopes selectors to a ref automatically and reverts every
tween/timeline/ScrollTrigger it created on unmount by itself — there is no manual cleanup
function to write.

```ts
'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);
```

Always guard against `prefers-reduced-motion` at the top of the `useGSAP` callback — check
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` and, if true, apply the
end state directly with `gsap.set` instead of building the scroll-linked timeline.

Always pass `{ scope: ref }` as the second argument to `useGSAP`. It's not load-bearing for
the two patterns below (they target refs directly, not selector strings), but it's cheap
insurance if a child tween keyed off a class selector gets added later.

## Responsive: branch by breakpoint, don't reuse desktop numbers

Per `CLAUDE.md`'s responsive rule, neither pattern below may reuse the same pixel values across
all screen sizes — a morph tuned for a 1440px hero or a stagger tuned for a 3-column desktop grid
does not translate to a 375px phone. Use `gsap.matchMedia()` (see `gsap-core`) inside the
`useGSAP` callback to give `md:` (768px) and up its own numbers, separate from the small-screen
defaults:

```ts
const mm = gsap.matchMedia();

mm.add(
  { isDesktop: '(min-width: 768px)' },
  (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean };
    // build the timeline using isDesktop to pick start/end/offset values
  },
);
```

`matchMedia` re-runs its handler (and reverts the previous run) whenever the query flips, so it
also covers viewport resizes and orientation changes for free — no manual resize listener needed.

## Pattern A — Morph (element changes size/position tied to scroll)

Use when a single element needs to smoothly transform between two layout states as the user
scrolls through a defined range (hero chat box → docked widget). Implement as `useChatMorph.ts`
per `PLAN.md`.

Key properties:

* `trigger`: the section that defines the scroll range — pass the section's own ref rather than
  an assumed `id` selector like `#hero`, since none of this project's skeleton sections currently
  set one.
* `start` / `end`: define where the morph begins and completes (e.g. `"top top"` to `"+=600"`).
* `scrub: true`: ties animation progress directly to scroll position, not a one-shot trigger.
* Animate `width`, `height`, and the numeric offsets (`top`/`right`/`bottom`) together in one tween.
* **`position: fixed` itself is not animatable.** GSAP can only interpolate numeric/color values —
  a discrete CSS keyword like `fixed` can't be eased from `relative`. Set `position: 'fixed'` once,
  up front with `gsap.set`, before the scroll-linked timeline starts; only the numeric offsets and
  dimensions belong in the eased tween.
* Secondary elements (e.g. suggestion chips) fade out via a separate tween positioned earlier in
  the same timeline, so they're gone before the morph completes.
* Animating `width`/`height`/`top`/`right`/`bottom` is a deliberate exception to the general
  "prefer transforms over layout properties" performance rule (see gsap-performance) — the box's
  content must actually reflow into the widget's compact layout, not just visually scale down. Add
  `will-change: width, height, top, right, bottom` in CSS on the container to hint the browser, and
  keep an eye on frame rate during Phase 2's manual QA pass.
* **Docked widget size must be relative, per `CLAUDE.md`** (e.g. `min(92vw, 360px)`), not a bare
  `360`. GSAP tweens numeric values, not CSS math functions — compute the actual pixel target in
  JS from `window.innerWidth` inside the `matchMedia` handler below (so it's recalculated on
  resize) instead of animating a literal `"min(92vw, 360px)"` string.

```tsx
'use client';
import { useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useChatMorph(
  heroRef: RefObject<HTMLElement>,
  containerRef: RefObject<HTMLElement>,
) {
  useGSAP(() => {
    if (!heroRef.current || !containerRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(containerRef.current, { opacity: 1 });
      return;
    }

    gsap.set(containerRef.current, { position: 'fixed' });

    // Relative, capped width per CLAUDE.md — computed here since GSAP needs a
    // number, not a CSS min() string. Recomputed on resize by matchMedia.
    const dockedWidth = Math.min(window.innerWidth * 0.92, 360);

    gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: '+=600',
        scrub: true,
      },
    }).to(containerRef.current, {
      width: dockedWidth,
      height: 500,
      top: 'auto',
      bottom: 24,
      right: 24,
      borderRadius: 16,
      ease: 'none',
    });
  }, { scope: heroRef });
}
```

## Pattern B — Staggered reveal ("dealing cards")

Use when a group of elements should enter the viewport one after another, each from a different
direction, tied to scroll progress through the section (bidirectional — scrolling back up reverses
the reveal). Implement as `useProjectsReveal.ts` per `PLAN.md`.

Key properties:

* One `ScrollTrigger` controlling a single timeline, **not** one ScrollTrigger per card.
* `stagger` on the tween controls the "dealt one at a time" feel.
* Each card gets a starting `x`/`y` offset and initial rotation from a small lookup table, applied
  per index — **function-based values in GSAP apply to individual vars properties, not to the whole
  `vars` object.** `gsap.set(cards, (i) => ({...}))` is not valid GSAP usage; write
  `x: (i) => ..., y: (i) => ..., rotation: (i) => ...` as separate per-property functions instead.
* Alternate colors strictly between the two theme colors (primary/accent) — never a third. Do this
  by toggling a `data-color="primary" | "accent"` attribute (or the matching Tailwind class) per
  card index, not by animating a color property through GSAP — that would require resolving a raw
  color value at tween time and risks silently drifting from the CSS-variable system.
* `scrub: true` so the reveal is scroll-position-driven, not a one-time trigger.
* The `DIRECTIONS` offsets below (`x: ±220`, `y: 160`) are desktop numbers tuned for a multi-column
  grid — per the responsive rule, scale or shrink them inside the `matchMedia` `isDesktop` branch
  before `md:` (e.g. smaller `x`/`y` magnitudes, or drop the left/right split entirely) so cards
  don't fly in from off-screen on a single-column mobile layout.

```tsx
'use client';
import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DIRECTIONS = [
  { x: -220, y: 0, rotation: -18 },
  { x: 0, y: 160, rotation: 18 },
  { x: 220, y: 0, rotation: -18 },
];

export function useProjectsReveal(
  sectionRef: RefObject<HTMLElement>,
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

    gsap.set(cards, {
      x: (i) => DIRECTIONS[i % DIRECTIONS.length].x,
      y: (i) => DIRECTIONS[i % DIRECTIONS.length].y,
      rotation: (i) => DIRECTIONS[i % DIRECTIONS.length].rotation,
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
  }, { scope: sectionRef });
}
```

## Pattern C — Fade + slide-up reveal (`toggleActions`, not `scrub`)

Use when a whole section should discretely fade and slide into view once, the first time
it's scrolled into the viewport (not continuously tied to scroll position like Pattern A/B).
Implement as `useSectionReveal.ts` per `PLAN.md` Phase 5.

Key properties:

* `toggleActions: 'play reverse play reverse'` (not `scrub`) — this is a discrete
  play/reverse on enter/leave, not a scroll-position-driven scrub. Using `scrub` and
  `toggleActions` together on the same trigger is invalid (per `gsap-scrolltrigger`'s own
  "Do Not" list) — pick one. This pattern deliberately picks `toggleActions`.
* Animate `opacity` and `y` (a modest translate, ~40px) together — no rotation, no scale,
  unlike the staggered-cards pattern; this is a single-element reveal, not a group.
* `start: 'top 85%'` triggers a bit earlier than Pattern A/B's typical `'top 80%'`, since
  there's no morph/deal choreography to time precisely — just "become visible while mostly
  in view."
* Reduced-motion fallback: instant `opacity: 1`, no `y` offset at all — matching every
  other reduced-motion branch in this project.

```tsx
'use client';
import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useSectionReveal(sectionRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(sectionRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(sectionRef.current, { opacity: 0, y: 40 });

    gsap.to(sectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'bottom 60%',
        toggleActions: 'play reverse play reverse',
      },
    });
  }, { scope: sectionRef });
}
```

## Common mistakes to avoid

* Don't create a separate `ScrollTrigger` per element in a staggered group — batch them into one
  timeline with `stagger`, or the scroll ranges will conflict.
* Don't put the `scrollTrigger` config on a child tween inside a timeline — it belongs on the
  timeline itself (or a standalone top-level tween), never nested.
* Don't skip `useGSAP`'s `scope` option — it's what keeps a selector-based tween from accidentally
  matching elements outside this component.
* Don't hand-roll `useEffect` + `gsap.context()` + `ctx.revert()` for these two patterns — that's
  the official fallback for when `@gsap/react` isn't available, and this project has it installed.
  Use `useGSAP()` and get cleanup for free.
* Don't pass a function as the entire second argument to `gsap.set()`/`gsap.to()` — function-based
  values are per-property only.
* Don't animate `position` itself, or expect GSAP to ease between `relative` and `fixed` — set it
  once, outside the eased tween.
* Don't hardcode colors inside the animation logic — alternate via the `primary`/`accent` Tailwind
  classes (backed by this project's CSS variables), never a raw value or a third color.
* Don't skip the reduced-motion branch — it's required for every scroll animation in this project.
