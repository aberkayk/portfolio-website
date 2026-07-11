# Phase 5 — Visual Theme Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A cohesive, playful visual layer across the whole site — typography, radius, glow shadows, hover/press micro-interactions, scroll-triggered reveals for the remaining static sections, and a subtle animated hero background — per Phase 5 of `PLAN.md` and `docs/superpowers/specs/2026-07-11-phase5-visual-polish-design.md`.

**Architecture:** Theme-level changes (fonts, radius, shadow tokens) land once in `globals.css`/`layout.tsx` and cascade everywhere. Three new small, single-purpose hooks (`useCardTilt`, `useSpringPress`, `useSectionReveal`) each own one micro-interaction, following the exact `useGSAP` + `prefers-reduced-motion` pattern established in every prior phase. `ExperienceSection`/`Timeline`/`SkillsSection` gain real content from `OWNER_CONTEXT` (Phase 4) so the new reveal animation has something real to animate.

**Tech Stack:** Next.js 16, GSAP + `@gsap/react` (`useGSAP`) + `ScrollTrigger` (all already installed), Tailwind v4 CSS-native theming, `next/font/google`.

## Global Constraints

- No static colors: every new color (glow shadows, hero gradient mesh) resolves from an existing `var(--color-*)` — no new hex/rgb/hsl literals.
- **Font CSS variable names must differ from the `@theme` token names that reference them** (e.g. next/font's `variable: "--font-heading-sans"` → `@theme`'s `--font-heading: var(--font-heading-sans)`). Using the *same* name on both sides was the exact bug found and fixed in Phase 1 Task 2 (`--font-sans: var(--font-sans)` — an unresolvable self-reference) — do not repeat it.
- Every scroll/hover/press animation uses `useGSAP` (never raw `useEffect` + `gsap.context()`), is cleaned up automatically, and has a `prefers-reduced-motion` fallback, per the `gsap-scroll-animations` skill and every prior phase's established pattern.
- Do not touch `Chat.tsx`'s existing Phase 2 morph/minimize `useGSAP` effects, `isDockedRef`, or `minimizeTweenRef` logic — that file has already been through 5 rounds of subtle timing bug fixes. Phase 5 deliberately does **not** add spring-press to `Chat.tsx`'s minimize/expand buttons for this reason (see Task 6) — only to `ChatInput`'s Send button, a simpler, isolated component.
- Package manager is pnpm for every command.
- No test framework in this project (explicitly declined) — verification is `pnpm build`/`pnpm lint` plus browser checks (computed styles, screenshots), matching every prior phase.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

---

### Task 1: Theme tokens — fonts, radius, glow shadows

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Tailwind utilities `font-heading`, `font-sans` (now Space Grotesk / Inter), `shadow-glow-primary`, `shadow-glow-accent`, and a bumped `--radius` cascading through the existing `--radius-sm/md/lg/xl` tokens. No later task needs to import anything from this one — these are global CSS effects.

- [ ] **Step 1: Replace `layout.tsx`'s font setup**

Replace the full contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading-sans",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio with an AI chatbot centerpiece feature.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Update `globals.css`'s `@theme` block and base layer**

In `src/app/globals.css`, add these lines inside the existing `@theme { ... }` block (anywhere after the `--color-border` line is fine — grouping with the other non-color tokens near `--radius` is clearest):

```css
  --font-heading: var(--font-heading-sans), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-body-sans), ui-sans-serif, system-ui, sans-serif;

  --shadow-glow-primary: 0 0 24px 4px color-mix(in oklab, var(--color-primary) 45%, transparent);
  --shadow-glow-accent: 0 0 24px 4px color-mix(in oklab, var(--color-accent) 45%, transparent);
```

Change the existing radius line:

```css
  --radius: 0.625rem;
```

to:

```css
  --radius: 1.25rem;
```

Update the existing `@layer base` block to apply the new fonts:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

- [ ] **Step 3: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Browser verification**

Start the dev server (`mcp__Claude_Preview__preview_start` with the `dev` config), then use `preview_inspect` (or `preview_eval` + `getComputedStyle`) on the `<body>` element and confirm:
- `font-family` includes `"Inter"` (or the CSS variable resolves to Inter's generated font name).
- A quick check on any element using `rounded-lg`/`rounded-2xl` shows `border-radius: 20px` (i.e. `1.25rem`), not the old `10px`.

No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
Add heading/body fonts, larger radius, and glow shadow tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useSectionReveal` hook (new gsap-scroll-animations pattern)

**Files:**
- Create: `src/hooks/useSectionReveal.ts`
- Modify: `.agents/skills/gsap-scroll-animations/SKILL.md`

**Interfaces:**
- Produces: `useSectionReveal(sectionRef: RefObject<HTMLElement | null>): void` — Tasks 3 and 4 consume this.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useSectionReveal.ts`:

```ts
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

- [ ] **Step 2: Add the new pattern to the `gsap-scroll-animations` skill**

In `.agents/skills/gsap-scroll-animations/SKILL.md`, add a new section right after the existing "## Pattern B — Staggered reveal" section (before "## Common mistakes to avoid"):

```markdown
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
```

- [ ] **Step 3: Verify the project builds**

Run: `pnpm build`
Expected: exits 0. (Not wired into any component yet — this checks the new file typechecks in isolation.)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSectionReveal.ts .agents/skills/gsap-scroll-animations/SKILL.md
git commit -m "$(cat <<'EOF'
Add useSectionReveal hook and Pattern C to gsap-scroll-animations skill

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Real experience content (`ExperienceSection` + `Timeline`)

**Files:**
- Modify: `src/components/sections/ExperienceSection.tsx`
- Modify: `src/components/sections/Timeline.tsx`

**Interfaces:**
- Consumes: `useSectionReveal` from Task 2; `OWNER_CONTEXT` from `src/lib/chat/context.ts` (Phase 4, already exported).
- Produces: no new exports for later tasks — this is a leaf content update.

- [ ] **Step 1: Update `Timeline.tsx`**

Replace the full contents of `src/components/sections/Timeline.tsx`:

```tsx
import { OWNER_CONTEXT } from '@/lib/chat/context';

export function Timeline() {
  return (
    <ol data-component="Timeline" className="flex flex-col gap-8">
      {OWNER_CONTEXT.experience.map((entry) => (
        <li key={`${entry.company}-${entry.period}`} className="border-l-2 border-border pl-6">
          <h3 className="text-lg font-semibold text-foreground">{entry.role}</h3>
          <p className="text-sm text-muted-foreground">
            {entry.company} · {entry.period}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground">
            {entry.highlights.map((highlight) => (
              <li key={highlight}>- {highlight}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Update `ExperienceSection.tsx`**

Replace the full contents of `src/components/sections/ExperienceSection.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { Timeline } from './Timeline';
import { useSectionReveal } from '@/hooks/useSectionReveal';

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      data-component="ExperienceSection"
      className="flex flex-col gap-8 px-6 py-16"
    >
      <h2 className="text-3xl">Experience</h2>
      <Timeline />
    </section>
  );
}
```

- [ ] **Step 3: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Browser verification**

Start the dev server, force enough scrollable height if needed (same `document.body.style.minHeight` trick used in Phase 2/3 testing), and confirm:
- All 5 experience entries render (FreshDirect, Tintech, Dexport, Hogarth Worldwide, Independent/Fitness Trainer).
- The section is invisible (`opacity: 0`) before scrolling it into view, and fades+slides in as it enters the viewport (check via `preview_eval` reading computed `opacity`/`transform` at a scroll position before vs. within the trigger range).
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ExperienceSection.tsx src/components/sections/Timeline.tsx
git commit -m "$(cat <<'EOF'
Render real experience data in ExperienceSection/Timeline, wire reveal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Real skills content (`SkillsSection`)

**Files:**
- Modify: `src/components/sections/SkillsSection.tsx`

**Interfaces:**
- Consumes: `useSectionReveal` from Task 2; `OWNER_CONTEXT` from `src/lib/chat/context.ts`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update `SkillsSection.tsx`**

Replace the full contents of `src/components/sections/SkillsSection.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { OWNER_CONTEXT } from '@/lib/chat/context';
import { useSectionReveal } from '@/hooks/useSectionReveal';

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      data-component="SkillsSection"
      className="flex flex-col gap-8 px-6 py-16"
    >
      <h2 className="text-3xl">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {OWNER_CONTEXT.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-foreground"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 3: Browser verification**

Same approach as Task 3: confirm all 33 skills render as pills, the section reveals correctly on scroll (hidden before, fades+slides in within the trigger range), no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/SkillsSection.tsx
git commit -m "$(cat <<'EOF'
Render real skills data in SkillsSection, wire reveal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `useCardTilt` hook + `ProjectCard` hover tilt/glow

**Files:**
- Create: `src/hooks/useCardTilt.ts`
- Modify: `src/components/projects/ProjectCard.tsx`

**Interfaces:**
- Produces: `useCardTilt(cardRef: RefObject<HTMLElement | null>): void`.
- Consumes/modifies: `ProjectCard` already accepts a forwarded `ref` prop (Phase 3, used by `ProjectsSection`'s stagger-reveal `cardRefs` array) — this task must merge that external ref with a new internal ref the tilt hook needs, without breaking the existing stagger-reveal wiring.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useCardTilt.ts`:

```ts
'use client';

import { type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const MAX_TILT_DEG = 8;

export function useCardTilt(cardRef: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.set(card, { transformPerspective: 800 });

    const setRotateX = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power3.out' });
    const setRotateY = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power3.out' });

    function handleMouseMove(event: MouseEvent) {
      const rect = card!.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      setRotateY(offsetX * MAX_TILT_DEG * 2);
      setRotateX(-offsetY * MAX_TILT_DEG * 2);
    }

    function handleMouseLeave() {
      setRotateX(0);
      setRotateY(0);
    }

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: cardRef });
}
```

- [ ] **Step 2: Update `ProjectCard.tsx`**

Replace the full contents of `src/components/projects/ProjectCard.tsx`:

```tsx
'use client';

import { useRef, type Ref } from 'react';
import { useCardTilt } from '@/hooks/useCardTilt';

interface ProjectCardProps {
  ref?: Ref<HTMLDivElement>;
  title: string;
  colorVariant: 'primary' | 'accent';
}

export function ProjectCard({ ref, title, colorVariant }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(cardRef);

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-component="ProjectCard"
      className={`rounded-2xl border border-border border-t-4 bg-surface-1 p-6 transition-shadow hover:shadow-glow-accent ${
        colorVariant === 'primary' ? 'border-t-primary' : 'border-t-accent'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {title}
    </div>
  );
}
```

Note: `cardRef` is a *new*, purely internal ref used only by `useCardTilt`. The forwarded `ref` prop (used by `ProjectsSection`'s `cardRefs` array for Phase 3's stagger reveal) is still correctly populated via the callback ref above — both consumers get the same DOM node, neither is broken.

- [ ] **Step 3: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Browser verification**

Start the dev server, scroll the 6 project cards into view (so Phase 3's reveal has completed and they're visible), then:
- Move the mouse across a card and confirm (via `preview_eval` reading `getComputedStyle(card).transform`) that the transform changes as the cursor moves toward different corners, and returns to no rotation on mouse-leave.
- Confirm hovering shows the accent glow (`box-shadow` becomes non-`none`) and it's gone when not hovering.
- Confirm Phase 3's stagger-reveal animation (cards dealing in on scroll) still works — this task must not have broken it.
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCardTilt.ts src/components/projects/ProjectCard.tsx
git commit -m "$(cat <<'EOF'
Add useCardTilt hook and hover tilt/glow to ProjectCard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `useSpringPress` hook + `ChatInput` Send button feedback

**Files:**
- Create: `src/hooks/useSpringPress.ts`
- Modify: `src/components/chat/ChatInput.tsx`
- Modify: `src/components/chat/Chat.tsx` (className only — see Step 2)

**Interfaces:**
- Produces: `useSpringPress(buttonRef: RefObject<HTMLElement | null>): void`.

**Scope note:** this task intentionally does **not** add spring-press to `Chat.tsx`'s minimize/expand buttons, and its one `Chat.tsx` edit (Step 2) is a plain className string, not a GSAP/ref change — see this plan's Global Constraints for why the existing morph/minimize `useGSAP` logic in that file is off-limits. `ChatInput`'s Send button is a simpler, isolated component with no existing GSAP logic to conflict with.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useSpringPress.ts`:

```ts
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
```

- [ ] **Step 2: Give the docked chat widget an always-on primary glow**

Per the design spec, the docked chat container itself (not just its buttons) should show a
soft primary glow while docked. This is a pure className change on `Chat.tsx`'s existing
container `<div>` — it does not touch any `useGSAP` effect, ref, or timing logic in that
file.

In `src/components/chat/Chat.tsx`, find this line (around line 167):

```tsx
      className="z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg"
```

Replace it with:

```tsx
      className={`z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 ${
        isDocked ? 'shadow-glow-primary' : 'shadow-lg'
      }`}
```

- [ ] **Step 3: Update `ChatInput.tsx`**

Replace the full contents of `src/components/chat/ChatInput.tsx`:

```tsx
'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSpringPress } from '@/hooks/useSpringPress';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  useSpringPress(sendButtonRef);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <form
      data-component="ChatInput"
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-border p-3"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Ask me anything..."
        className="flex-1 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-foreground outline-none disabled:opacity-50"
      />
      <button
        ref={sendButtonRef}
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-glow-primary disabled:opacity-50 disabled:shadow-none"
      >
        Send
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 5: Browser verification**

Start the dev server, dock the chat (per Phase 2's scroll-morph), type a message, and:
- Confirm (via `preview_eval` simulating `pointerdown`/`pointerup` events, or a real `preview_click`) that the Send button's computed `transform` scales down briefly then springs back.
- Confirm the button shows the primary glow shadow.
- Confirm the docked chat container itself shows the primary glow (`shadow-glow-primary`) while docked, and the plain `shadow-lg` while hero-centered/undocked.
- Confirm the chat still sends/receives messages correctly (Phase 4's functionality unaffected) and Phase 2's morph/minimize animations are unaffected.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useSpringPress.ts src/components/chat/ChatInput.tsx src/components/chat/Chat.tsx
git commit -m "$(cat <<'EOF'
Add useSpringPress hook, Send button feedback, and docked chat glow

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Hero animated gradient mesh background

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- None — purely visual, no new exports.

- [ ] **Step 1: Add the keyframes and animation class to `globals.css`**

In `src/app/globals.css`, add this block after the existing `@layer base { ... }` block (plain CSS, not inside `@theme`):

```css
@keyframes hero-mesh {
  0%,
  100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
}

.animate-hero-mesh {
  animation: hero-mesh 45s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-hero-mesh {
    animation: none;
  }
}
```

- [ ] **Step 2: Update `Hero.tsx`**

Replace the full contents of `src/components/sections/Hero.tsx`:

```tsx
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
```

- [ ] **Step 3: Verify the project builds and lints**

Run: `pnpm build && pnpm lint`
Expected: both exit 0.

- [ ] **Step 4: Browser verification**

Start the dev server and:
- Confirm the Hero section shows a soft, blurred, colored gradient behind its content (screenshot or `preview_inspect` on the mesh `div`).
- Confirm the gradient's `background-position` changes over time (sample `getComputedStyle` twice, several seconds apart, via `preview_eval`) — or, faster: check that the `animation` CSS property is present and non-`none`.
- Resize to `colorScheme`/reduced-motion emulation if the Preview tool supports it, or simply confirm the CSS rule `@media (prefers-reduced-motion: reduce) { .animate-hero-mesh { animation: none; } }` is present in the built CSS.
- Confirm the mesh sits behind Hero's content and the fixed chat panel (no stacking/z-index issues) — the chat panel is `position: fixed` with `z-50` on a *different* element outside Hero's `isolate` stacking context, so this is expected to already be fine; just visually confirm nothing looks wrong.
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
Add animated gradient mesh background to Hero

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Final Phase 5 acceptance verification

**Files:**
- Modify: `PLAN.md` (check off Phase 5 tasks)

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

Using the dev server, walk through `PLAN.md` Phase 5's acceptance criteria end to end, on both a desktop (1440×900) and mobile (390×844) viewport:
- Fonts: headings render in Space Grotesk, body text in Inter.
- Radius: cards/buttons/inputs show the larger `1.25rem` radius.
- Glow shadows: visible on the chat send button and on `ProjectCard` hover.
- `ProjectCard` hover tilt responds to mouse position and reverts on mouse-leave.
- Send button shows press/spring feedback.
- `ExperienceSection` (real 5 entries) and `SkillsSection` (real 33 skills) fade+slide-up into view on scroll, reversibly.
- Hero shows the slow-moving gradient mesh background.
- No console errors anywhere in this flow.
- Nothing from Phases 1-4 regressed (chat morph/minimize, projects stagger reveal, chatbot streaming still all work).

- [ ] **Step 3: Check off Phase 5 in PLAN.md**

In `PLAN.md`, change every `- [ ]` under "Phase 5 — Visual Theme Polish" to `- [x]`.

- [ ] **Step 4: Commit**

```bash
git add PLAN.md
git commit -m "$(cat <<'EOF'
Check off Phase 5 tasks — visual theme polish complete and verified

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
