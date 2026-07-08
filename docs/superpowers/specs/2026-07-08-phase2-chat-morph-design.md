# Phase 2 — Hero → Widget Chat Scroll Animation — Design

## Purpose

Implement Phase 2 of `PLAN.md`: the chat box starts as a large, centered panel in the hero
section and morphs into a small fixed widget docked at the bottom-right as the user scrolls,
reversibly. Builds on the Phase 1 skeleton (`Hero.tsx`, `Chat.tsx`, `SuggestedPrompts.tsx`,
`ChatMessage.tsx`, `ChatInput.tsx`) and the `gsap-scroll-animations` skill's Pattern A.

## Component & state model

`Chat.tsx` remains a single component per `CLAUDE.md` — never split into hero/widget variants.
It holds one piece of local state: `isMinimized: boolean` (default `false`), meaningful only in
the docked state. The panel-vs-docked *shape* is driven entirely by scroll via the `useChatMorph`
hook (`src/hooks/useChatMorph.ts`, per `PLAN.md`'s naming); the minimized state is an independent,
click-driven variant layered on top of "docked." `Hero.tsx` provides the ref `useChatMorph` needs
as its `ScrollTrigger` trigger element; `Chat` renders as a sibling in `page.tsx` (unchanged
structurally from Phase 1) but is positioned via `position: fixed` from mount, so it can occupy
the hero visually without being a DOM child of `Hero`.

## Three visual states

Two are scroll-driven; "minimized" is a click-driven variant of "docked," not a third
`ScrollTrigger` state.

| State | Desktop (`md:` and up) | Mobile (below `md`) |
|---|---|---|
| Hero panel (large, centered) | `width: min(70vw, 720px)`, `height: min(75vh, 640px)`, centered via `top/left: 50%` + `transform: translate(-50%, -50%)` | `width: 92vw`, `height: 70vh`, same centering |
| Docked widget | `width: min(92vw, 360px)`, `height: 480px`, `bottom: 24px`, `right: 24px` | same width formula, `height: min(60vh, 420px)` |
| Minimized button | `56×56px` circle, same corner offset as docked | same |

`position: fixed` is set once via `gsap.set` at mount (not eased — GSAP cannot interpolate the
`position` keyword). All three states use `gsap.matchMedia()` to give desktop and mobile their
own concrete pixel values — nothing here is a CSS `min()`/`vw` string handed to GSAP directly;
each is resolved to a number in JS from `window.innerWidth`/`innerHeight` inside the matchMedia
handler (recomputed automatically on resize/orientation change).

The scroll-linked morph uses `gsap.fromTo()`, not `.to()`, with explicit values for both the
panel and docked states — relying on `.to()` to read whatever the panel's actual computed CSS
happens to be is fragile once real Tailwind layout classes are in play on the initial render.

Scroll range: `trigger: heroRef.current`, `start: 'top top'`, `end: '+=600'` on desktop,
`end: '+=400'` on mobile (shorter hero content) — both `scrub: true`, both tunable during the
manual QA pass without being a hard spec requirement.

## Interactions

- **`SuggestedPrompts` fade-out:** a separate tween positioned in the first portion of the same
  scroll-scrubbed timeline (per the `gsap-scroll-animations` skill's Setup guidance) — opacity to
  0 *and* `pointer-events: none` once faded, so it's not just invisible but also non-interactive.
  Fully gone before the panel→widget morph completes.
- **Minimize/expand:** the icon only renders in the docked (non-hero-panel) state. Clicking it
  runs an independent tween — not tied to `ScrollTrigger`/`scrub` — collapsing the docked box to
  the 56×56 button (`duration: 0.3`, `ease: 'power2.out'`). Clicking the button reverses the same
  tween. This interaction is unaffected by scroll position as long as the user hasn't scrolled
  back up past the hero (which forces the panel state regardless of `isMinimized`).
- **Message/input persistence:** guaranteed structurally — one `Chat` component instance exists
  for the page's lifetime; nothing unmounts between states.
- **Reduced motion:** all three states still exist and are reachable, but every transition between
  them (scroll-driven or click-driven) is an instant/opacity-only change — no size, position, or
  rotation easing — per the existing reduced-motion branch pattern.

## File structure

- `src/hooks/useChatMorph.ts` — new. Exports `useChatMorph(heroRef, containerRef)`, implementing
  the scroll-linked panel↔docked morph per the `gsap-scroll-animations` skill's Pattern A, extended
  with `gsap.matchMedia()` breakpoint branching and `gsap.fromTo()` for explicit state values.
- `src/components/sections/Hero.tsx` — modified. Forwards a ref for `useChatMorph`'s trigger.
- `src/components/chat/Chat.tsx` — modified. Calls `useChatMorph`, holds `isMinimized` state, owns
  the minimize/expand tween and button, renders `SuggestedPrompts`/`ChatMessage`/`ChatInput` as
  today (Phase 1 skeleton) with the fade-out wired onto `SuggestedPrompts`.
- `src/components/chat/SuggestedPrompts.tsx` — modified minimally: accepts the fade as an external
  ref-driven GSAP target, no internal logic change.
- No changes to `ChatMessage.tsx` / `ChatInput.tsx` in this phase — they still render their Phase 1
  skeleton content; real message rendering/sending is Phase 4.

## Out of scope for this phase

- Real chat message content/sending (Phase 4).
- Visual polish beyond what's needed to demonstrate the morph (final shadows/glow/fonts — Phase 5).
- Any change to `ProjectsSection`/`ExperienceSection`/`SkillsSection`.

## Acceptance criteria (from `PLAN.md`, unchanged, plus one addition)

Scrolling smoothly morphs the chat box with no jank; message state and input persist across the
transition; scrolling back up reverses the animation. **Addition from this design's minimize
decision:** minimize/expand works independently of scroll position once docked, and reduced-motion
users get instant state changes with no eased transforms at any of the three states.
