# Phase 2 — Hero → Widget Chat Scroll Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The hero chat panel morphs into a small docked widget as the user scrolls, reversibly, with a minimize/expand control once docked — per Phase 2 of `PLAN.md` and `docs/superpowers/specs/2026-07-08-phase2-chat-morph-design.md`.

**Architecture:** A new `useChatMorph` hook (in `src/hooks/`) owns the scroll-linked panel↔docked morph via `useGSAP` + `ScrollTrigger`, using `gsap.matchMedia()` for desktop/mobile breakpoint branching and `gsap.fromTo()` with explicit pixel values for both states (never relying on implicit "current computed style" reads). `Chat.tsx` consumes the hook for shape/scroll state and separately owns a click-driven minimize/expand tween layered on top of the docked shape.

**Tech Stack:** Next.js 16 App Router, React 19 (ref-as-prop, no `forwardRef`), GSAP + `@gsap/react` (`useGSAP`) + `ScrollTrigger`, Tailwind v4 CSS variables, `lucide-react` icons.

## Global Constraints

- `Chat` stays one component — never split into hero/widget variants (`CLAUDE.md`).
- No static colors: every color comes from the existing `bg-primary`/`text-primary-foreground`/`text-muted-foreground`/`bg-surface-1`/`border-border` utility classes — no new hex/rgb values anywhere.
- Every scroll-linked animation uses `useGSAP` (not raw `useEffect` + `gsap.context()`) and is cleaned up automatically per the `gsap-scroll-animations` skill.
- `position: fixed` is set via `gsap.set`/plain assignment, never eased (GSAP cannot interpolate the CSS `position` keyword).
- Responsive: desktop (`md:` / ≥768px) and mobile get separate concrete pixel values via `gsap.matchMedia()` — never a bare desktop number reused unscaled on mobile (`CLAUDE.md` responsive rule).
- `prefers-reduced-motion: reduce` gets a fade-only fallback — no eased size/position/rotation transforms, but the docked/panel state still discretely changes (`PLAN.md` Phase 2 task list).
- Package manager is pnpm for every command.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

## A note on browser verification

`pnpm build` only proves the code compiles — it cannot prove the scroll morph actually works, since GSAP applies all of this phase's behavior at runtime after hydration (nothing shows up in the server-rendered HTML `curl` would see). Each task below that touches runtime behavior requires an actual browser check, not just a build. If the Preview MCP tools (`mcp__Claude_Preview__*`) aren't available in your environment, say so explicitly in your report (`DONE_WITH_CONCERNS`) rather than claiming the animation works from build output alone.

---

### Task 1: `useChatMorph` hook + `SuggestedPrompts` ref forwarding

**Files:**
- Create: `src/hooks/useChatMorph.ts`
- Modify: `src/components/chat/SuggestedPrompts.tsx`

**Interfaces:**
- Produces: `useChatMorph(heroRef: RefObject<HTMLElement | null>, containerRef: RefObject<HTMLElement | null>, suggestedPromptsRef: RefObject<HTMLElement | null>): { isDocked: boolean }` — Task 2 consumes this.
- Produces: `getDockedSize(isMobile: boolean): { width: number; height: number }` — exported alongside the hook; Task 3's minimize/expand tween reuses it.
- Produces: `SuggestedPrompts` now accepts an optional `ref` prop (React 19 ref-as-prop, no `forwardRef`) forwarding to its root `<div>`.

- [ ] **Step 1: Update `SuggestedPrompts.tsx` to accept a ref**

Replace the full contents of `src/components/chat/SuggestedPrompts.tsx`:

```tsx
import type { Ref } from 'react';

interface SuggestedPromptsProps {
  ref?: Ref<HTMLDivElement>;
}

export function SuggestedPrompts({ ref }: SuggestedPromptsProps) {
  return (
    <div ref={ref} data-component="SuggestedPrompts">
      SuggestedPrompts
    </div>
  );
}
```

- [ ] **Step 2: Create the `useChatMorph` hook**

Create `src/hooks/useChatMorph.ts`:

```ts
'use client';

import { useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface DockedSize {
  width: number;
  height: number;
}

function getPanelRect(isMobile: boolean): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = isMobile ? vw * 0.92 : Math.min(vw * 0.7, 720);
  const height = isMobile ? vh * 0.7 : Math.min(vh * 0.75, 640);
  return { width, height, top: (vh - height) / 2, left: (vw - width) / 2 };
}

export function getDockedSize(isMobile: boolean): DockedSize {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.92, 360);
  const height = isMobile ? Math.min(vh * 0.6, 420) : 480;
  return { width, height };
}

export function useChatMorph(
  heroRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  suggestedPromptsRef: RefObject<HTMLElement | null>,
) {
  const [isDocked, setIsDocked] = useState(false);

  useGSAP(() => {
    if (!heroRef.current || !containerRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set(containerRef.current, { position: 'fixed' });

    const mm = gsap.matchMedia();

    mm.add({ isMobile: '(max-width: 767px)' }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const panel = getPanelRect(isMobile);
      const docked = getDockedSize(isMobile);
      const scrollEnd = isMobile ? '+=400' : '+=600';

      const panelStyle = {
        top: panel.top,
        left: panel.left,
        right: 'auto',
        bottom: 'auto',
        width: panel.width,
        height: panel.height,
        borderRadius: 24,
      };
      const dockedStyle = {
        top: 'auto',
        left: 'auto',
        right: 24,
        bottom: 24,
        width: docked.width,
        height: docked.height,
        borderRadius: 16,
      };

      gsap.set(containerRef.current, panelStyle);

      if (reduced) {
        let wasDocked = false;
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: scrollEnd,
          onUpdate: (self) => {
            const shouldDock = self.progress >= 0.5;
            if (shouldDock === wasDocked) return;
            wasDocked = shouldDock;
            setIsDocked(shouldDock);
            gsap
              .timeline()
              .to(containerRef.current, { opacity: 0, duration: 0.15 })
              .set(containerRef.current, shouldDock ? dockedStyle : panelStyle)
              .to(containerRef.current, { opacity: 1, duration: 0.15 });
          },
        });
        return;
      }

      let wasDocked = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: scrollEnd,
          scrub: true,
          onUpdate: (self) => {
            const shouldDock = self.progress >= 0.999;
            if (shouldDock === wasDocked) return;
            wasDocked = shouldDock;
            setIsDocked(shouldDock);
          },
        },
      });

      if (suggestedPromptsRef.current) {
        tl.to(suggestedPromptsRef.current, { opacity: 0, duration: 0.3 }, 0);
      }

      tl.fromTo(
        containerRef.current,
        panelStyle,
        { ...dockedStyle, ease: 'none', duration: 1 },
        0,
      );
    });
  }, { scope: containerRef });

  return { isDocked };
}
```

- [ ] **Step 3: Verify the project builds and typechecks**

Run: `pnpm build`
Expected: exits 0. (The hook isn't wired into any page yet, but `tsc` still typechecks every `.ts`/`.tsx` file per `tsconfig.json`'s `include` glob, so this catches any type errors in the new file.)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useChatMorph.ts src/components/chat/SuggestedPrompts.tsx
git commit -m "$(cat <<'EOF'
Add useChatMorph hook and SuggestedPrompts ref forwarding

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire the morph into `Hero`, `page.tsx`, and `Chat`

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/chat/Chat.tsx`

**Interfaces:**
- Consumes: `useChatMorph` and `getDockedSize` from Task 1 (`src/hooks/useChatMorph.ts`).
- Produces: `Hero` now accepts an optional `ref` prop (React 19 ref-as-prop) applied to its root `<section>` — this is the `ScrollTrigger` trigger element.
- Produces: `Chat` now takes a required prop `heroRef: RefObject<HTMLElement | null>`. `page.tsx` owns the shared `heroRef` and passes it to both `Hero` and `Chat`.
- Produces: `Chat` renders a single fixed-position container (`containerRef`) whose shape is fully controlled by `useChatMorph`; no minimize/expand behavior yet (Task 3).

- [ ] **Step 1: Update `Hero.tsx` to accept and apply a ref**

Replace the full contents of `src/components/sections/Hero.tsx`:

```tsx
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
```

- [ ] **Step 2: Update `Chat.tsx` to consume `useChatMorph`**

Replace the full contents of `src/components/chat/Chat.tsx`:

```tsx
'use client';

import { useRef, type RefObject } from 'react';
import { useChatMorph } from '@/hooks/useChatMorph';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function Chat({ heroRef }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement>(null);

  const { isDocked } = useChatMorph(heroRef, containerRef, suggestedPromptsRef);

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className="z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg"
    >
      <div className="flex h-full flex-col">
        <SuggestedPrompts ref={suggestedPromptsRef} />
        <ChatMessage />
        <ChatInput />
      </div>
    </div>
  );
}
```

(`data-docked` is a plain boolean-reflecting attribute for QA/inspection in this task; Task 3 uses `isDocked` for the minimize button instead of relying on this attribute.)

- [ ] **Step 3: Update `page.tsx` to own the shared `heroRef`**

Replace the full contents of `src/app/page.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { Hero } from '@/components/sections/Hero';
import { Chat } from '@/components/chat/Chat';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { SkillsSection } from '@/components/sections/SkillsSection';

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <main>
      <Hero ref={heroRef} />
      <Chat heroRef={heroRef} />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
    </main>
  );
}
```

- [ ] **Step 4: Verify the project builds**

Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 5: Browser verification of the morph**

Start the dev server (`mcp__Claude_Preview__preview_start` with the `dev` config in `.claude/launch.json`, or `pnpm dev` via Bash if the Preview tools aren't available in your environment) and check:

1. At scroll position 0: the chat container is large and centered on screen (roughly `min(70vw, 720px)` × `min(75vh, 640px)` on a desktop-sized viewport), `SuggestedPrompts` visible.
2. Scroll down ~600px (desktop) inside the hero's scroll range: the container smoothly shrinks and moves to the bottom-right corner (~360px wide, docked), `SuggestedPrompts` has faded out.
3. Scroll back to the top: the container smoothly returns to the large centered panel and `SuggestedPrompts` reappears.
4. Check the browser console for errors (`mcp__Claude_Preview__preview_console_logs` or equivalent) — expect none.
5. If the Preview tools are unavailable, note this explicitly in your report and describe what you verified by reading the code instead (e.g., confirming the `gsap.matchMedia` branch and `fromTo` values match the design spec) — do not claim the animation visually works without having seen it.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/page.tsx src/components/chat/Chat.tsx
git commit -m "$(cat <<'EOF'
Wire useChatMorph into Hero, page, and Chat

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Minimize/expand control

**Files:**
- Modify: `src/components/chat/Chat.tsx`

**Interfaces:**
- Consumes: `getDockedSize` from Task 1's `src/hooks/useChatMorph.ts`.
- Produces: `Chat` now renders a minimize button (visible only when `isDocked`) and an expand button (the collapsed 56×56 circular state) — both operate independently of `ScrollTrigger`/scroll position.

- [ ] **Step 1: Add minimize/expand state and tween to `Chat.tsx`**

Replace the full contents of `src/components/chat/Chat.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MessageCircle, Minus } from 'lucide-react';
import { useChatMorph, getDockedSize } from '@/hooks/useChatMorph';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function Chat({ heroRef }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const isDockedRef = useRef(false);

  const { isDocked } = useChatMorph(heroRef, containerRef, suggestedPromptsRef);

  useEffect(() => {
    isDockedRef.current = isDocked;
    if (!isDocked) setIsMinimized(false);
  }, [isDocked]);

  useGSAP(() => {
    if (!isDockedRef.current || !containerRef.current || !contentRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const docked = getDockedSize(isMobile);
    const size = isMinimized
      ? { width: 56, height: 56, borderRadius: 9999 }
      : { width: docked.width, height: docked.height, borderRadius: 16 };

    if (reduced) {
      gsap.set(containerRef.current, size);
      gsap.set(contentRef.current, {
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto',
      });
      if (iconRef.current) {
        gsap.set(iconRef.current, {
          opacity: isMinimized ? 1 : 0,
          pointerEvents: isMinimized ? 'auto' : 'none',
        });
      }
      return;
    }

    gsap.to(containerRef.current, { ...size, duration: 0.3, ease: 'power2.out' });
    gsap.to(contentRef.current, {
      opacity: isMinimized ? 0 : 1,
      pointerEvents: isMinimized ? 'none' : 'auto',
      duration: 0.2,
    });
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        opacity: isMinimized ? 1 : 0,
        pointerEvents: isMinimized ? 'auto' : 'none',
        duration: 0.2,
      });
    }
  }, { dependencies: [isMinimized] });

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className="z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg"
    >
      <div ref={contentRef} className="relative flex h-full flex-col">
        <SuggestedPrompts ref={suggestedPromptsRef} />
        <ChatMessage />
        <ChatInput />
        {isDocked && (
          <button
            type="button"
            aria-label="Minimize chat"
            onClick={() => setIsMinimized(true)}
            className="absolute right-2 top-2 text-muted-foreground"
          >
            <Minus className="size-4" />
          </button>
        )}
      </div>
      {isDocked && (
        <button
          ref={iconRef}
          type="button"
          aria-label="Expand chat"
          onClick={() => setIsMinimized(false)}
          className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground opacity-0"
          style={{ pointerEvents: 'none' }}
        >
          <MessageCircle className="size-6" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the project builds**

Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 3: Browser verification of minimize/expand**

Using the dev server (see Task 2, Step 5 for how to start it):

1. Scroll to fully dock the chat widget.
2. Confirm a minimize button (small `Minus` icon, top-right of the docked box) is visible — and confirm it is **not** present while the panel is in its large hero state (scroll back to the top to check).
3. Click minimize: the box collapses to a 56×56 circular button showing a chat-bubble icon; the underlying chat content is no longer visible or clickable.
4. Click the circular button: it expands back to the docked box, content visible and clickable again.
5. Scroll back to the top while minimized, then scroll back down: confirm the widget re-docks in its normal (non-minimized) docked state, not still minimized (the `useEffect` resetting `isMinimized` on undock).
6. Check the browser console for errors — expect none.
7. If the Preview tools are unavailable, note this explicitly and describe what you verified from the code instead.

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/Chat.tsx
git commit -m "$(cat <<'EOF'
Add minimize/expand control to the docked chat widget

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Final Phase 2 acceptance verification

**Files:**
- Modify: `PLAN.md` (check off Phase 2 tasks)

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

Using the dev server, walk through the entire acceptance criteria from `PLAN.md` Phase 2:
- Scrolling smoothly morphs the chat box with no visible jank at both the start and end of the scroll range, on both a desktop-sized (e.g. 1440×900) and mobile-sized (e.g. 390×844) viewport (use `mcp__Claude_Preview__preview_resize` or equivalent to test both).
- Message state and input persist across the transition (type something in the input if it's interactive at this phase, or at minimum confirm the same DOM node — not a remount — carries across states).
- Scrolling back up reverses the animation.
- Minimize/expand works independently of scroll position once docked.
- No console errors at any point in the flow.

If the Preview tools are unavailable in this environment, state that explicitly and rely on a careful re-read of Tasks 1-3's implementation against this checklist instead — do not claim visual behaviors you could not observe.

- [ ] **Step 3: Check off Phase 2 in PLAN.md**

In `PLAN.md`, change every `- [ ]` under "Phase 2 — Hero → Widget Chat Scroll Animation" to `- [x]`.

- [ ] **Step 4: Commit**

```bash
git add PLAN.md
git commit -m "$(cat <<'EOF'
Check off Phase 2 tasks — chat morph complete and verified

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
