# Phase 3 — Projects "Dealing Cards" Scroll Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Project cards animate into view staggered, from alternating directions and colors, as the user scrolls through the projects section — reversible — per Phase 3 of `PLAN.md` and `docs/superpowers/specs/2026-07-08-phase3-dealing-cards-design.md`.

**Architecture:** A new `useProjectsReveal` hook (in `src/hooks/`) owns one `ScrollTrigger`-driven timeline animating all cards together with `stagger`, using `gsap.matchMedia()` for desktop/mobile direction-offset scaling (mobile drops the horizontal left/right split entirely to avoid off-screen overflow on a single-column layout). `ProjectCard` gains a forwarded ref, a `title`, and a `colorVariant` prop; `ProjectsSection` supplies 6 placeholder projects, a 1-column-mobile/3-column-desktop grid, and collects card refs via callback refs into a stable array.

**Tech Stack:** Next.js 16 App Router, React 19 (ref-as-prop, no `forwardRef`), GSAP + `@gsap/react` (`useGSAP`) + `ScrollTrigger`, Tailwind v4 CSS variables.

## Global Constraints

- No static colors: only `bg-primary`/`bg-accent`/`border-t-primary`/`border-t-accent`/`bg-surface-1`/`border-border` utility classes — no new hex/rgb values.
- Color alternates strictly between primary and accent — never a third color (`CLAUDE.md`).
- Mobile-first responsive: `grid-cols-1` unprefixed, `md:grid-cols-3` for desktop (`CLAUDE.md`).
- Scroll-linked animation uses `useGSAP` (not raw `useEffect` + `gsap.context()`), cleaned up automatically, per the `gsap-scroll-animations` skill.
- Desktop and mobile get separate concrete direction-offset values via `gsap.matchMedia()` with **both** an `isMobile` and a complementary `isDesktop` query registered together — a single unpaired query silently never fires on the other side of the breakpoint (this exact bug shipped and was fixed in Phase 2's `useChatMorph`; do not repeat it here).
- `prefers-reduced-motion: reduce` gets a simple fade-in with no rotation/translation (`PLAN.md` Phase 3 task list).
- One `ScrollTrigger` for the whole group, never one per card (`gsap-scroll-animations` skill).
- Package manager is pnpm for every command.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

## A note on browser verification

Like Phase 2, `pnpm build` only proves the code compiles — the actual scroll reveal only exists at runtime after hydration. Tasks that touch runtime behavior require an actual browser check (`mcp__Claude_Preview__*` tools), not just a build. If those tools aren't available, say so explicitly in your report rather than claiming the animation works from build output alone.

---

### Task 1: `useProjectsReveal` hook

**Files:**
- Create: `src/hooks/useProjectsReveal.ts`

**Interfaces:**
- Produces: `useProjectsReveal(sectionRef: RefObject<HTMLElement | null>, cardRefs: RefObject<HTMLElement[]>): void` — Task 2 consumes this.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useProjectsReveal.ts`:

```ts
'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface DirectionOffset {
  x: number;
  y: number;
  rotation: number;
}

// Desktop numbers, tuned for a 3-column grid: index % 3 equals the card's
// actual column (0 = left, 1 = middle, 2 = right), so the direction cycle
// and the visual layout agree by construction, not by coincidence.
const DESKTOP_DIRECTIONS: DirectionOffset[] = [
  { x: -220, y: 0, rotation: -18 },
  { x: 0, y: 160, rotation: 18 },
  { x: 220, y: 0, rotation: -18 },
];

// Mobile is a single column -- there is no "left/middle/right" to enter
// from, and the desktop x offsets (+-220px) would fly cards in from off
// the edge of a ~375px viewport. Drop the horizontal split entirely and
// just alternate rotation direction by parity for a little variety.
function getMobileDirection(index: number): DirectionOffset {
  return { x: 0, y: 80, rotation: index % 2 === 0 ? -8 : 8 };
}

export function useProjectsReveal(
  sectionRef: RefObject<HTMLElement | null>,
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

    const mm = gsap.matchMedia();

    mm.add({ isMobile: '(max-width: 767px)', isDesktop: '(min-width: 768px)' }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const getOffset = (i: number) =>
        isMobile ? getMobileDirection(i) : DESKTOP_DIRECTIONS[i % DESKTOP_DIRECTIONS.length];

      gsap.set(cards, {
        x: (i) => getOffset(i).x,
        y: (i) => getOffset(i).y,
        rotation: (i) => getOffset(i).rotation,
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
    });
  }, { scope: sectionRef });
}
```

- [ ] **Step 2: Verify the project builds and typechecks**

Run: `pnpm build`
Expected: exits 0. (The hook isn't wired into any page yet, but `tsc` still typechecks every `.ts`/`.tsx` file, so this catches any type errors in the new file.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProjectsReveal.ts
git commit -m "$(cat <<'EOF'
Add useProjectsReveal hook

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire the reveal into `ProjectCard` and `ProjectsSection`

**Files:**
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/projects/ProjectsSection.tsx`

**Interfaces:**
- Consumes: `useProjectsReveal` from Task 1 (`src/hooks/useProjectsReveal.ts`).
- Produces: `ProjectCard` now accepts `ref?: Ref<HTMLDivElement>`, `title: string`, and `colorVariant: 'primary' | 'accent'` (React 19 ref-as-prop, no `forwardRef`).
- Produces: `ProjectsSection` renders 6 placeholder cards in a responsive grid, wired to the reveal hook.

- [ ] **Step 1: Update `ProjectCard.tsx`**

Replace the full contents of `src/components/projects/ProjectCard.tsx`:

```tsx
import type { Ref } from 'react';

interface ProjectCardProps {
  ref?: Ref<HTMLDivElement>;
  title: string;
  colorVariant: 'primary' | 'accent';
}

export function ProjectCard({ ref, title, colorVariant }: ProjectCardProps) {
  return (
    <div
      ref={ref}
      data-component="ProjectCard"
      className={`rounded-2xl border border-border border-t-4 bg-surface-1 p-6 ${
        colorVariant === 'primary' ? 'border-t-primary' : 'border-t-accent'
      }`}
    >
      {title}
    </div>
  );
}
```

- [ ] **Step 2: Update `ProjectsSection.tsx`**

Replace the full contents of `src/components/projects/ProjectsSection.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { ProjectCard } from './ProjectCard';
import { useProjectsReveal } from '@/hooks/useProjectsReveal';

const PROJECTS = [
  { id: '1', title: 'Project 1' },
  { id: '2', title: 'Project 2' },
  { id: '3', title: 'Project 3' },
  { id: '4', title: 'Project 4' },
  { id: '5', title: 'Project 5' },
  { id: '6', title: 'Project 6' },
];

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);

  useProjectsReveal(sectionRef, cardRefs);

  return (
    <section
      ref={sectionRef}
      data-component="ProjectsSection"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      {PROJECTS.map((project, index) => (
        <ProjectCard
          key={project.id}
          ref={(el) => {
            if (el) {
              cardRefs.current[index] = el;
            }
          }}
          title={project.title}
          colorVariant={index % 2 === 0 ? 'primary' : 'accent'}
        />
      ))}
    </section>
  );
}
```

Note: this drops the `ProjectModal` usage from the Phase 1 skeleton — modal-open-on-click is out of scope for this phase (see the design spec). `ProjectModal.tsx` itself is untouched.

- [ ] **Step 3: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Browser verification of the reveal**

Start the dev server (`mcp__Claude_Preview__preview_start` with the `dev` config in `.claude/launch.json`) and check, on a desktop-sized viewport (e.g. 1440×900):

1. Before scrolling the projects section into view: all 6 cards are invisible/offset (`opacity: 0`, translated per their direction).
2. Scroll the projects section into the trigger range: cards deal in staggered, column 0 from the left, column 1 from the bottom, column 2 from the right, each with rotation easing to 0.
3. Scroll back up: the reveal reverses ("undeals") smoothly (`scrub: true`).
4. Colors alternate primary/accent by index (check the `border-t-*` class or computed border-top-color on each card).
5. Resize to a mobile-sized viewport (e.g. 390×844) and repeat: cards should enter from directly below (no horizontal offset, no off-screen overflow), alternating small rotation.
6. Check the browser console for errors — expect none.
7. If the Preview tools are unavailable, say so explicitly and describe what you verified from the code instead — do not claim the animation visually works without having seen it.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectCard.tsx src/components/projects/ProjectsSection.tsx
git commit -m "$(cat <<'EOF'
Wire useProjectsReveal into ProjectCard and ProjectsSection

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Final Phase 3 acceptance verification

**Files:**
- Modify: `PLAN.md` (check off Phase 3 tasks)

**Interfaces:**
- None — this task only verifies and records completion.

- [ ] **Step 1: Full clean build and lint**

```bash
rm -rf .next
pnpm build
pnpm lint
```

Expected: both exit 0.

- [ ] **Step 2: Full manual QA pass in the browser**

Using the dev server, walk through `PLAN.md` Phase 3's acceptance criteria:
- Cards visibly deal in with rotation + directional entry, on both desktop (1440×900) and mobile (390×844) viewports.
- Staggered timing is perceptible (cards don't all appear simultaneously).
- Scroll position controls progress bidirectionally — scrolling partway through the section shows cards partway revealed, not fully in or fully out.
- Color alternates strictly primary/accent, never a third color.
- No console errors anywhere in this flow.

If the Preview tools are unavailable, state that explicitly and rely on a careful re-read of Task 1-2's implementation against this checklist instead.

- [ ] **Step 3: Check off Phase 3 in PLAN.md**

In `PLAN.md`, change every `- [ ]` under "Phase 3 — Projects Section \"Dealing Cards\" Scroll Reveal" to `- [x]`.

- [ ] **Step 4: Commit**

```bash
git add PLAN.md
git commit -m "$(cat <<'EOF'
Check off Phase 3 tasks — dealing cards reveal complete and verified

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
