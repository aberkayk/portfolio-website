# Project Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js 16 project skeleton for the portfolio site — folder structure, base config, color system, and empty component/module skeletons — matching Phase 1 of `PLAN.md` and the design in `docs/superpowers/specs/2026-07-08-project-scaffold-design.md`.

**Architecture:** `create-next-app` bootstraps a Next.js 16 App Router project with TypeScript, Tailwind v4, and a `src/` layout. `shadcn` CLI adds its config and base utilities. Colors are wired through Tailwind v4's CSS-native `@theme` block in `globals.css` (there is no `tailwind.config.ts` in this stack — confirmed by running both CLIs during design). All feature components are created as minimal, prop-less (except `ProjectModal`) empty skeletons and mounted on the home page so the whole tree renders and is visually traceable via `data-component` attributes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, shadcn/ui (`base` library, `nova` preset), pnpm.

## Global Constraints

- Package manager is pnpm for every install/run command — never `npm`/`yarn`.
- TypeScript `strict: true` (already the `create-next-app` default) — do not weaken it.
- No `tailwind.config.ts`/`.js` file — all theming lives in `src/app/globals.css`'s `@theme` block.
- No static colors anywhere in components: no hex/`rgb()`/`hsl()` literals, no default Tailwind color utility classes (`bg-red-500`, `text-zinc-800`, etc.). Every color resolves from a `--color-*` variable in `globals.css` referenced via its generated utility class.
- Only `CLAUDE.md`'s palette values are used for `primary`, `accent`, `surface-0/1/2`, `border`. Any other shadcn semantic token (`card`, `popover`, `secondary`, `muted`, `destructive`, `ring`, `input`, `radius`) is derived from that same palette or left at a sensible neutral — never a new unrelated hue.
- No Prettier, no test framework (explicitly declined for this project) — do not add either.
- `ProjectModal` takes `children: ReactNode` and `onClose: () => void` props — this exact shape is required now per `CLAUDE.md`'s component conventions (v2 slot-game compatibility).
- `Chat` stays a single component (never split into hero/widget variants) even though it has no scroll logic yet.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

---

### Task 1: Scaffold the Next.js 16 app

**Files:**
- Create: entire generated Next.js project (package.json, tsconfig.json, next.config.ts, eslint.config.mjs, postcss.config.mjs, pnpm-workspace.yaml, .gitignore, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, public/*, AGENTS.md, README.md)
- Temporarily move aside: `CLAUDE.md`, `PLAN.md` (create-next-app refuses to run in a non-empty directory unless the only extra files are in its small allow-list; `docs/` and `.git` are already confirmed safe, `CLAUDE.md`/`PLAN.md` are not)

**Interfaces:**
- Produces: a working Next.js project buildable with `pnpm build` and runnable with `pnpm dev`, using `src/` layout and `@/*` import alias.

- [ ] **Step 1: Move CLAUDE.md and PLAN.md out of the way**

```bash
mv CLAUDE.md /tmp/CLAUDE.md.scaffold-tmp
mv PLAN.md /tmp/PLAN.md.scaffold-tmp
```

- [ ] **Step 2: Run create-next-app**

```bash
npx --yes create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --no-git --yes
```

Expected: "Success! Created ... " message, `node_modules` installed, no prompt asking about conflicting files.

- [ ] **Step 3: Move CLAUDE.md and PLAN.md back**

```bash
mv /tmp/CLAUDE.md.scaffold-tmp CLAUDE.md
mv /tmp/PLAN.md.scaffold-tmp PLAN.md
```

- [ ] **Step 4: Install future-phase dependencies now**

Per the design spec, `gsap` (Phase 2/3), `ai`, and `@anthropic-ai/sdk` (Phase 4) are installed but left unconfigured in Phase 1, so later phases don't hit missing-package friction:

```bash
pnpm add gsap ai @anthropic-ai/sdk
```

- [ ] **Step 5: Verify the project builds**

Run: `pnpm build`
Expected: exits 0, ends with a route summary table (e.g. `○ /` listed as static).

- [ ] **Step 6: Verify git sees the expected new files**

Run: `git status --short`
Expected: `CLAUDE.md` and `PLAN.md` show as unmodified (not listed, or listed with no diff); everything else Next.js generated shows as untracked (`??`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scaffold Next.js 16 App Router project with TypeScript, Tailwind v4, pnpm

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`
- Modify: `src/app/globals.css` (shadcn CLI appends/rewrites its theme block — Task 3 will replace this with the final `CLAUDE.md` palette)
- Modify: `package.json` (new dependencies: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn`, `tailwind-merge`, `tw-animate-css`)

**Interfaces:**
- Produces: `src/lib/utils.ts` exporting `cn(...inputs: ClassValue[]): string` — used by every future shadcn/ui component and any component needing conditional classNames.

- [ ] **Step 1: Run shadcn init**

```bash
npx --yes shadcn@latest init -b base -p nova -y
```

Expected: ends with "Project initialization completed." and lists `src/lib/utils.ts` created, `src/app/globals.css` updated.

- [ ] **Step 2: Verify the project still builds**

Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Initialize shadcn/ui (base library, nova preset)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Apply the CLAUDE.md color system and remove default demo styling

**Files:**
- Modify: `src/app/globals.css` (replace shadcn's generated theme tokens with `CLAUDE.md`'s palette, single fixed dark theme — no light/dark toggle)
- Modify: `src/app/layout.tsx` (replace default metadata title/description)
- Modify: `src/app/page.tsx` (strip the `create-next-app` demo content and its hardcoded Tailwind color classes down to a plain placeholder; Task 5 replaces this again with the real component tree)

**Interfaces:**
- Produces: CSS variables `--color-primary(-100/-300/-700/-900)`, `--color-accent(-100/-300/-700/-900)`, `--color-surface-0/1/2`, `--color-border` plus shadcn semantic tokens (`--color-background`, `--color-foreground`, `--color-card`, `--color-popover`, `--color-secondary`, `--color-muted`, `--color-destructive`, `--color-input`, `--color-ring`, `--radius*`) all defined once inside a single top-level `@theme` block (no `:root`/`.dark` split — this project has one fixed dark theme, so shadcn's light/dark indirection is unnecessary and removed).

- [ ] **Step 1: Replace globals.css**

Write `src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme {
  /* primary — blue */
  --color-primary-100: #85B7EB;
  --color-primary-300: #5A9EE0;
  --color-primary: #378ADD;
  --color-primary-700: #185FA5;
  --color-primary-900: #0C447C;

  /* accent — green */
  --color-accent-100: #97C459;
  --color-accent-300: #7BAE3E;
  --color-accent: #639922;
  --color-accent-700: #3B6D11;
  --color-accent-900: #27500A;

  /* surfaces — dark, slightly blue-tinted neutral */
  --color-surface-0: #0B0F14;
  --color-surface-1: #131920;
  --color-surface-2: #1B222B;
  --color-border: #262E38;

  /* shadcn semantic tokens, derived from the palette above */
  --color-background: var(--color-surface-0);
  --color-foreground: #E7ECF2;
  --color-card: var(--color-surface-1);
  --color-card-foreground: var(--color-foreground);
  --color-popover: var(--color-surface-1);
  --color-popover-foreground: var(--color-foreground);
  --color-primary-foreground: var(--color-surface-0);
  --color-secondary: var(--color-surface-2);
  --color-secondary-foreground: var(--color-foreground);
  --color-muted: var(--color-surface-2);
  --color-muted-foreground: #93A0AD;
  --color-accent-foreground: var(--color-surface-0);
  --color-destructive: #C4453A;
  --color-destructive-foreground: var(--color-surface-0);
  --color-input: var(--color-border);
  --color-ring: var(--color-primary);

  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Update layout.tsx metadata**

In `src/app/layout.tsx`, replace the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio with an AI chatbot centerpiece feature.",
};
```

(Leave the rest of `layout.tsx` — the Geist font setup and `RootLayout` function — unchanged.)

- [ ] **Step 3: Strip page.tsx down to a plain placeholder**

Replace the entire contents of `src/app/page.tsx`:

```tsx
export default function Home() {
  return <main>Portfolio</main>;
}
```

- [ ] **Step 4: Verify the project builds**

Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 5: Verify no default Tailwind color classes remain in src/**

```bash
grep -rnE '\b(bg|text|border|ring|from|via|to|fill|stroke|shadow|outline|divide|decoration|caret|accent)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone|black|white)-[0-9]+\b' src/
```

Expected: no output (grep exits 1).

- [ ] **Step 6: Verify no raw hex colors leaked into TS/TSX files**

```bash
grep -rnE '#[0-9a-fA-F]{3,8}\b' src/ --include='*.tsx' --include='*.ts'
```

Expected: no output (grep exits 1) — hex values should only exist in `globals.css`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Apply CLAUDE.md color palette and remove default demo styling

Single fixed dark theme via one @theme block, no tailwind.config.ts
(Tailwind v4 CSS-native theming). Phase 5's "apply final palette"
task is already satisfied by this commit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create empty chat lib modules and the API route stub

**Files:**
- Create: `src/lib/chat/context.ts`
- Create: `src/lib/chat/anthropic.ts`
- Create: `src/app/api/chat/route.ts`

**Interfaces:**
- Produces: `POST` handler at `/api/chat` returning HTTP 501 (route exists and is reachable, not yet implemented) — Phase 4 replaces this with real streaming logic.
- Produces: `src/lib/chat/context.ts` and `src/lib/chat/anthropic.ts` as empty modules (valid, buildable, no exports yet) — Phase 4 fills these in.

- [ ] **Step 1: Create lib/chat/context.ts**

```ts
// Structured personal/project data + system prompt generation for the chatbot.
// Filled in during Phase 4 (Chatbot Backend) — see PLAN.md.
export {};
```

- [ ] **Step 2: Create lib/chat/anthropic.ts**

```ts
// Anthropic SDK client setup for the chatbot backend.
// Filled in during Phase 4 (Chatbot Backend) — see PLAN.md.
export {};
```

- [ ] **Step 3: Create the API route stub**

```ts
export async function POST() {
  return new Response(null, { status: 501 });
}
```

Save as `src/app/api/chat/route.ts`.

- [ ] **Step 4: Verify the project builds**

Run: `pnpm build`
Expected: exits 0, route summary includes `/api/chat`.

- [ ] **Step 5: Verify the route is reachable**

```bash
pnpm dev &
DEV_PID=$!
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat
kill $DEV_PID
```

Expected: prints `501`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add empty chat lib modules and /api/chat route stub

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Create skeleton components and wire them into the home page

**Files:**
- Create: `src/components/chat/Chat.tsx`
- Create: `src/components/chat/ChatMessage.tsx`
- Create: `src/components/chat/ChatInput.tsx`
- Create: `src/components/chat/SuggestedPrompts.tsx`
- Create: `src/components/projects/ProjectsSection.tsx`
- Create: `src/components/projects/ProjectCard.tsx`
- Create: `src/components/projects/ProjectModal.tsx`
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/ExperienceSection.tsx`
- Create: `src/components/sections/Timeline.tsx`
- Create: `src/components/sections/SkillsSection.tsx`
- Modify: `src/app/page.tsx` (render the full tree)

**Interfaces:**
- Consumes: none (all components are self-contained empty skeletons for this task).
- Produces:
  - `Hero(): JSX.Element`, `ExperienceSection(): JSX.Element`, `SkillsSection(): JSX.Element` — no props.
  - `Chat(): JSX.Element`, `ChatMessage(): JSX.Element`, `ChatInput(): JSX.Element`, `SuggestedPrompts(): JSX.Element` — no props.
  - `ProjectsSection(): JSX.Element`, `ProjectCard(): JSX.Element` — no props.
  - `ProjectModal({ children, onClose }: { children: ReactNode; onClose: () => void }): JSX.Element` — this exact signature is relied on by later phases and the v2 slot-game feature.
  - `Timeline(): JSX.Element` — no props.

- [ ] **Step 1: Create the chat components**

`src/components/chat/SuggestedPrompts.tsx`:
```tsx
export function SuggestedPrompts() {
  return <div data-component="SuggestedPrompts">SuggestedPrompts</div>;
}
```

`src/components/chat/ChatMessage.tsx`:
```tsx
export function ChatMessage() {
  return <div data-component="ChatMessage">ChatMessage</div>;
}
```

`src/components/chat/ChatInput.tsx`:
```tsx
export function ChatInput() {
  return <div data-component="ChatInput">ChatInput</div>;
}
```

`src/components/chat/Chat.tsx`:
```tsx
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function Chat() {
  return (
    <div data-component="Chat">
      Chat
      <SuggestedPrompts />
      <ChatMessage />
      <ChatInput />
    </div>
  );
}
```

- [ ] **Step 2: Create the projects components**

`src/components/projects/ProjectCard.tsx`:
```tsx
export function ProjectCard() {
  return <div data-component="ProjectCard">ProjectCard</div>;
}
```

`src/components/projects/ProjectModal.tsx`:
```tsx
import type { ReactNode } from "react";

interface ProjectModalProps {
  children: ReactNode;
  onClose: () => void;
}

export function ProjectModal({ children, onClose }: ProjectModalProps) {
  return (
    <div data-component="ProjectModal">
      {children}
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

`src/components/projects/ProjectsSection.tsx`:
```tsx
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function ProjectsSection() {
  return (
    <section data-component="ProjectsSection">
      ProjectsSection
      <ProjectCard />
      <ProjectModal onClose={() => {}}>
        <div>ProjectModal placeholder content</div>
      </ProjectModal>
    </section>
  );
}
```

- [ ] **Step 3: Create the remaining sections**

`src/components/sections/Hero.tsx`:
```tsx
export function Hero() {
  return <div data-component="Hero">Hero</div>;
}
```

`src/components/sections/Timeline.tsx`:
```tsx
export function Timeline() {
  return <div data-component="Timeline">Timeline</div>;
}
```

`src/components/sections/ExperienceSection.tsx`:
```tsx
import { Timeline } from "./Timeline";

export function ExperienceSection() {
  return (
    <section data-component="ExperienceSection">
      ExperienceSection
      <Timeline />
    </section>
  );
}
```

`src/components/sections/SkillsSection.tsx`:
```tsx
export function SkillsSection() {
  return <section data-component="SkillsSection">SkillsSection</section>;
}
```

- [ ] **Step 4: Wire everything into the home page**

Replace `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/sections/Hero";
import { Chat } from "@/components/chat/Chat";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <Chat />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
    </main>
  );
}
```

- [ ] **Step 5: Verify the project builds**

Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 6: Verify every component renders**

```bash
pnpm dev &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000 | grep -o 'data-component="[A-Za-z]*"' | sort -u
kill $DEV_PID
```

Expected output (11 lines, alphabetical):
```
data-component="Chat"
data-component="ChatInput"
data-component="ChatMessage"
data-component="ExperienceSection"
data-component="Hero"
data-component="ProjectCard"
data-component="ProjectModal"
data-component="ProjectsSection"
data-component="SkillsSection"
data-component="SuggestedPrompts"
data-component="Timeline"
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add skeleton components for chat, projects, and sections; wire into home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Final Phase 1 acceptance verification

**Files:**
- Modify: `PLAN.md` (check off Phase 1 tasks)

**Interfaces:**
- None — this task only verifies and records completion.

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
pnpm build
```

Expected: exits 0.

- [ ] **Step 2: Lint check**

Run: `pnpm lint`
Expected: exits 0, no errors or warnings.

- [ ] **Step 3: Repeat the full static-color sweep across the whole src/ tree**

```bash
grep -rnE '\b(bg|text|border|ring|from|via|to|fill|stroke|shadow|outline|divide|decoration|caret|accent)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone|black|white)-[0-9]+\b' src/
grep -rnE '#[0-9a-fA-F]{3,8}\b' src/ --include='*.tsx' --include='*.ts'
```

Expected: both commands produce no output.

- [ ] **Step 4: Dev server smoke test**

```bash
pnpm dev &
DEV_PID=$!
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
kill $DEV_PID
```

Expected: prints `200`.

- [ ] **Step 5: Check off Phase 1 in PLAN.md**

In `PLAN.md`, change every `- [ ]` under "Phase 1 — Project Scaffold & Component Structure" to `- [x]`.

- [ ] **Step 6: Commit**

```bash
git add PLAN.md
git commit -m "$(cat <<'EOF'
Check off Phase 1 tasks — scaffold complete and verified

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
