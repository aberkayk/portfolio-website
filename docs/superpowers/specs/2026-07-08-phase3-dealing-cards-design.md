# Phase 3 — Projects "Dealing Cards" Scroll Reveal — Design

## Purpose

Implement Phase 3 of `PLAN.md`: project cards animate into view as if dealt from a
deck as the user scrolls through the projects section, staggered, alternating entry
direction and color, reversible (scrolling back up "undeals" them). Builds on the
Phase 1 skeleton (`ProjectsSection.tsx`, `ProjectCard.tsx`) and the `gsap-scroll-animations`
skill's Pattern B.

## Scope

This phase covers only the scroll-triggered reveal animation and the placeholder card
data needed to demonstrate it meaningfully (currently `ProjectsSection` renders a
single hardcoded `ProjectCard`, which isn't enough to show a staggered multi-card
effect). Explicitly out of scope:

- Clicking a card to open `ProjectModal` — no such task exists in `PLAN.md` Phase 3;
  this interaction lands whenever real project content/modal-opening is assigned to
  a phase.
- Real project data/content — `ProjectsSection` uses a local placeholder array
  (`{ id, title }`) for now, swappable later without touching the animation logic.
- `ProjectCard` hover tilt effect — explicitly Phase 5.
- Full visual polish of the card (shadows, radius, typography) — Phase 5.

## Placeholder data & layout

`ProjectsSection` defines a local array of 6 placeholder projects (`"Project 1"` ..
`"Project 6"`) and renders one `ProjectCard` per entry.

Grid: `grid-cols-1` on mobile (stacked, per `CLAUDE.md`'s mobile-first responsive
rule), `md:grid-cols-3` on desktop — a 3×2 grid for 6 cards.

## Direction & color mapping

Column position maps directly to entry direction, reusing the `gsap-scroll-animations`
skill's existing `DIRECTIONS` cycle (`index % 3` → left / bottom / right): column 0
(leftmost) cards fly in from the left, column 1 (middle) from the bottom, column 2
(rightmost) from the right. This is not arbitrary — with a 3-column grid, `index % 3`
already equals the card's column, so the direction cycle and the visual layout agree
naturally instead of needing a separate mapping.

Color alternates strictly between `primary`/`accent` by `index % 2` (`CLAUDE.md`'s
"only primary and accent" rule for scroll-reveal alternation). Applied as a minimal
visual marker appropriate for this phase — a colored top border/accent bar on each
card (`border-t-4 border-primary` / `border-t-4 border-accent`) — not full Phase-5
card styling.

## Architecture

- `src/hooks/useProjectsReveal.ts` — new. Exports `useProjectsReveal(sectionRef,
  cardRefs)` per the `gsap-scroll-animations` skill's Pattern B: one `ScrollTrigger`
  driving one timeline (never one `ScrollTrigger` per card), `stagger: 0.15`,
  `scrub: true` (bidirectional — scrolling back up reverses/"undeals" the cards),
  `gsap.matchMedia()` for responsive direction-offset scaling (smaller `x`/`y`
  magnitudes below `md:`, per the skill's existing guidance), reduced-motion fallback
  (simple fade-in, no rotation/translation, per `PLAN.md`'s explicit requirement).
- `src/components/projects/ProjectCard.tsx` — modified. Accepts a forwarded `ref`
  (React 19 ref-as-prop, same pattern as `Hero`/`SuggestedPrompts` from Phase 2), plus
  `title: string` and `colorVariant: 'primary' | 'accent'` props for the placeholder
  content and border color.
- `src/components/projects/ProjectsSection.tsx` — modified. Defines the placeholder
  array, a `sectionRef` and a `cardRefs` array (`RefObject<HTMLElement[]>`, populated
  via callback refs), calls `useProjectsReveal(sectionRef, cardRefs)`, renders the
  grid. Drops the `ProjectModal` usage from the Phase 1 skeleton (out of scope here —
  `ProjectModal.tsx` itself is untouched and still available for whichever later
  phase wires up the click-to-open interaction).

## Acceptance criteria (from `PLAN.md`, unchanged)

Cards visibly deal in with rotation + directional entry, staggered timing is
perceptible, scroll position controls progress bidirectionally (scrub, not a one-shot
trigger). Reduced-motion users get a simple fade-in with no rotation/translation.
