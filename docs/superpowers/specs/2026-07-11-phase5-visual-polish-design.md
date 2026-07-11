# Phase 5 — Visual Theme Polish — Design

## Purpose

Implement Phase 5 of `PLAN.md`, the final phase: a cohesive, playful visual layer applied
across the whole site — typography, radius, glow shadows, hover/press micro-interactions,
scroll-triggered reveals for the remaining static sections, and a subtle animated hero
background. All while keeping `CLAUDE.md`'s "no static colors" and `prefers-reduced-motion`
rules intact.

## Content scope (new, not explicitly in any prior phase)

`ExperienceSection`/`Timeline` and `SkillsSection` are still Phase 1 placeholder text
(`"ExperienceSection"`, `"SkillsSection"`). Since Phase 5's scroll-reveal animation needs
real content to animate meaningfully (the same reasoning that led Phase 3 to add 6
placeholder project cards), this phase also wires in the real data already available in
`OWNER_CONTEXT` (`src/lib/chat/context.ts`, from Phase 4):

- `Timeline` renders the 5 `OWNER_CONTEXT.experience` entries (company, role, period,
  highlights) as a vertical timeline list.
- `SkillsSection` renders the 33 `OWNER_CONTEXT.skills` as a tag/pill grid.

Both read directly from the already-exported `OWNER_CONTEXT` — no new data layer, no props
threading beyond what's already in scope for these two components.

## Typography

Replace the default `Geist`/`Geist Mono` pairing (from scaffold) with `Space Grotesk`
(headings) and `Inter` (body), both loaded via `next/font/google` in `layout.tsx` exactly
like the fonts they replace. `globals.css`'s `@theme` block gains a `--font-heading`
variable (mapped to Space Grotesk's CSS variable) alongside the existing `--font-sans`
(now mapped to Inter). Heading-level elements (`h1`-`h3`, or a `.font-heading` utility
where semantic heading tags aren't used yet) apply `--font-heading`; body text keeps the
default `--font-sans`.

## Border radius

`--radius` in `globals.css` changes from `0.625rem` to `1.25rem`. Every other radius token
(`--radius-sm/md/lg/xl`) and every `rounded-*` Tailwind utility already derives from this
one variable, so this is a single-line, fully cascading change — no per-component edits
needed for the radius bump itself.

## Glow shadows

Two new tokens in the `@theme` block: `--shadow-glow-primary` and `--shadow-glow-accent`,
each a soft, low-opacity `box-shadow` built from `var(--color-primary)`/`var(--color-accent)`
with an alpha channel (e.g. `0 0 24px color-mix(in oklab, var(--color-primary) 35%, transparent)`).
Tailwind v4 registers these as `shadow-glow-primary`/`shadow-glow-accent` utilities
automatically (same mechanism as the existing color tokens). Applied to:
- The docked chat widget container (`Chat.tsx`) — primary glow, always on while docked.
- `ProjectCard` — accent glow, only on hover (paired with the tilt effect below).
- Any future primary CTA button (none exist as dedicated components yet beyond the chat's
  own controls, so this phase does not invent a new "Button" component — it only ensures
  the glow utility exists and is used where hover/interactive elements already exist).

## `ProjectCard` hover tilt

New hook `src/hooks/useCardTilt.ts`: on `mousemove` over the card, computes the cursor's
offset from the card's center and applies `rotateX`/`rotateY` (small magnitude, e.g. max
±8deg) via `gsap.quickTo()` (per the `gsap-performance` skill's explicit guidance for
frequently-updated properties like mouse-followers, instead of creating a new tween per
event). On `mouseleave`, springs back to `rotateX: 0, rotateY: 0`. Skipped entirely under
`prefers-reduced-motion` (no fallback needed — this is a pure hover enhancement, not
content-bearing).

## Button press spring feedback

Applied to the chat's `Send` button and the minimize/expand controls (the only real
interactive buttons that exist yet): on `pointerdown`, scale to `0.94`; on `pointerup`/
`pointerleave`, spring back to `scale: 1` via GSAP `ease: 'elastic.out(1, 0.5)'`. Implemented
as a small reusable `useSpringPress` hook (ref-based, same shape as `useCardTilt`) rather
than duplicated inline handlers per button.

## Scroll-triggered fade+slide-up reveal

**New third pattern** for the `gsap-scroll-animations` skill (`.agents/skills/gsap-scroll-animations/SKILL.md`),
alongside the existing Morph and Staggered Reveal patterns — added because `CLAUDE.md`
names that skill as the single source of truth for this project's scroll-animation
patterns, and this is a genuinely new pattern shape (`toggleActions`, not `scrub`).

New hook `src/hooks/useSectionReveal.ts`: `ScrollTrigger` per section with
`toggleActions: 'play reverse play reverse'` (discrete, not `scrub`) animating `opacity`
and `y` (slide up ~40px) on enter/leave. Applied to `ExperienceSection` and `SkillsSection`.
Reduced-motion fallback: instant `opacity: 1`, no `y` offset, matching every other reveal
pattern's reduced-motion branch in this project.

## Hero background

A slow (30-60s loop), low-opacity animated gradient mesh behind `Hero`'s content: 2-3 large,
heavily-blurred radial gradients in `var(--color-primary)`/`var(--color-accent)`, animated
via a CSS `@keyframes` shifting `background-position`. Pure CSS (no new JS/GSAP, no new
dependency) — a `<div>` absolutely positioned behind Hero's content, `z-index` below the
fixed chat panel. Paused (via `@media (prefers-reduced-motion: reduce)`, setting
`animation: none`) for reduced-motion users; the mesh itself (static) still renders, only
the motion stops.

## Out of scope

- Any new shadcn UI `Button` component — this phase reuses existing interactive elements
  (chat send/minimize/expand) rather than introducing a general-purpose button system.
- Further content (projects still empty per Phase 3/4's decisions — unaffected here).
- `ProjectModal` — untouched, still the generic children+onClose shell for the future v2 slot game.

## Acceptance criteria (from `PLAN.md`, unchanged)

Visual language feels cohesive and playful across all sections, no static colors anywhere,
animations respect reduced-motion.
