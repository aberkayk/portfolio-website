# PLAN.md

Phased implementation plan for the portfolio site. Work through phases in order —
each depends on the previous one's output. Check off acceptance criteria before
moving to the next phase.

---

## Phase 1 — Project Scaffold & Component Structure

**Goal:** Folder structure, base config, and empty component skeletons in place.

Tasks:
- [x] Init Next.js 16 App Router project, TypeScript, Tailwind v4, shadcn/ui
- [x] Create folder structure (see CLAUDE.md component conventions)
- [x] Set up `globals.css` with the color variables (placeholder values acceptable
      at this stage, final palette applied in Phase 5)
- [x] Map color variables into `globals.css`'s `@theme` block (Tailwind v4 is
      config-less — no `tailwind.config.ts` in this stack, see CLAUDE.md)
- [x] Create empty skeleton components for: Hero, Chat, ChatMessage, ChatInput,
      SuggestedPrompts, ProjectsSection, ProjectCard, ProjectModal,
      ExperienceSection, Timeline, SkillsSection
- [x] Create `lib/chat/context.ts` and `lib/chat/anthropic.ts` as empty modules
- [x] Create `app/api/chat/route.ts` as an empty route handler

**Acceptance criteria:** Project builds and runs (`next dev`), all pages/components
render without errors, no static color values anywhere in the code.

---

## Phase 2 — Hero → Widget Chat Scroll Animation

**Goal:** The chat box starts large and centered in the hero, and smoothly morphs
into a small fixed widget in the bottom-right corner as the user scrolls.

Tasks:
- [x] Install `gsap`, register `ScrollTrigger`
- [x] Implement `useChatMorph.ts` hook (see `gsap-scroll-animations` skill,
      "morph" pattern)
- [x] Wire the hook into `Chat.tsx`, single component with two CSS states
- [x] Fade out `SuggestedPrompts` during the transition
- [x] Add minimize icon that appears once docked as a widget
- [x] Add `prefers-reduced-motion` fallback (simple fade, no size/position jump)
- [x] Clean up ScrollTrigger on unmount

**Acceptance criteria:** Scrolling smoothly morphs the chat box with no jank, message
state and input persist across the transition, scrolling back up reverses the animation.

---

## Phase 3 — Projects Section "Dealing Cards" Scroll Reveal

**Goal:** Project cards animate into view as if being dealt from a deck, staggered,
alternating entry direction and color (primary/accent).

Tasks:
- [x] Implement `useProjectsReveal.ts` hook (see `gsap-scroll-animations` skill,
      "staggered reveal" pattern)
- [x] Wire refs from `ProjectCard` instances into the hook via `ProjectsSection`
- [x] Alternate entry direction (left / bottom / right) and color (primary / accent)
      per card index
- [x] Use `scrub: true` so scrolling back up "undeals" the cards
- [x] Add `prefers-reduced-motion` fallback (simple fade-in, no rotation/translation)
- [x] Clean up ScrollTrigger/timeline on unmount

**Acceptance criteria:** Cards visibly deal in with rotation + directional entry,
staggered timing is perceptible, scroll position controls progress bidirectionally.

---

## Phase 4 — Chatbot Backend

**Goal:** Streaming chatbot that answers questions about the owner using a
system prompt built from structured personal/project data.

Tasks:
- [ ] Fill in `lib/chat/context.ts` with structured info (name, summary, skills,
      projects, experience) and generate the system prompt from it
- [ ] Implement `app/api/chat/route.ts`: Anthropic SDK, streaming response,
      Vercel AI SDK compatible with `useChat`
- [ ] Use Haiku model
- [ ] Add in-memory rate limiting behind a `RateLimiter` interface
- [ ] Return meaningful error responses (rate limit, API failure)
- [ ] Wire `useChat` into `Chat.tsx`, render streaming messages via `ChatMessage`

**Acceptance criteria:** Chatbot answers portfolio-related questions accurately,
declines unrelated questions gracefully, rate limiting triggers correctly, streaming
renders token-by-token in the UI.

---

## Phase 5 — Visual Theme Polish

**Goal:** Final playful/interactive visual layer applied across the whole site.

Tasks:
- [ ] Apply final color palette values in `globals.css` (see CLAUDE.md)
- [ ] Set up heading/body fonts via `next/font`
- [ ] Apply large border-radius system-wide
- [ ] Add soft colored glow shadows using the primary/accent variables
- [ ] Add `ProjectCard` hover tilt effect (mouse-position based)
- [ ] Add button press spring feedback
- [ ] Add scroll-triggered fade+slide-up reveal for remaining sections
      (Experience, Skills) via GSAP `toggleActions`
- [ ] Add subtle animated hero background (gradient mesh or grain, low intensity)

**Acceptance criteria:** Visual language feels cohesive and playful across all
sections, no static colors anywhere, animations respect reduced-motion.

---

## V2 — Not in Scope Yet

iGaming slot game opened via `ProjectModal`. Do not implement — only keep
`ProjectModal` generic (children-based) so this slots in later without rework.
