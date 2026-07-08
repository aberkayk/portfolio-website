# Project Scaffold — Design

## Purpose

Bootstrap the portfolio repository per Phase 1 of `PLAN.md`: a working Next.js app skeleton with the stack, folder structure, color system, and empty component/module skeletons in place — but no real logic, content, or styling behavior yet. Later phases (chat scroll animation, projects reveal, chatbot backend, visual polish) build on top of this.

## Structure

App Router with a `src/` directory:

```
portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts        # empty route handler
│   ├── components/
│   │   ├── chat/
│   │   │   ├── Chat.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── SuggestedPrompts.tsx
│   │   ├── projects/
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectModal.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── SkillsSection.tsx
│   │   └── ui/                      # shadcn components land here
│   └── lib/
│       ├── utils.ts                 # shadcn default
│       └── chat/
│           ├── context.ts           # empty module
│           └── anthropic.ts         # empty module
├── public/
├── components.json                  # shadcn config
├── tailwind.config.ts
├── tsconfig.json                    # strict: true
├── eslint config (create-next-app default)
├── .gitignore
├── package.json
└── README.md (minimal)
```

### Skeleton components

Every component listed above is a minimal, typed, empty skeleton — not a stub with placeholder UI copy. Each one:

- Has an explicit props interface (even if empty, e.g. `interface HeroProps {}` only when a prop is truly anticipated soon — otherwise no props)
- Returns a single root element with a `data-component="Name"` marker or a short HTML comment-free placeholder (e.g. a `<div>` with the component name as text) so it's visually traceable in the browser during Phase 1 acceptance testing
- Has no logic, no state, no animation, no fetch calls
- `Chat.tsx` still ends up a single component (per `CLAUDE.md` conventions) — no separate hero/widget variants yet, just one empty shell

`lib/chat/context.ts` and `lib/chat/anthropic.ts` are empty modules: a file with a top-of-file comment stating its future purpose and no exports yet (or a single placeholder type export if TypeScript's `isolatedModules`/noUnusedLocals settings require the file to export something meaningful — resolved during implementation, not prescribed here).

`app/api/chat/route.ts` is an empty route handler: a single exported `POST` (or `GET`, decided during implementation) that returns a stub `Response` — enough for the route to build and be reachable, no Anthropic/AI SDK wiring yet.

## Color system

`globals.css` defines exactly the CSS variables from `CLAUDE.md` under `:root`:

- `--color-primary-100/300/DEFAULT/700/900` (blue)
- `--color-accent-100/300/DEFAULT/700/900` (green)
- `--color-surface-0/1/2`, `--color-border`

`tailwind.config.ts` maps these to utility classes: `bg-primary`, `text-primary-700`, `bg-accent-100`, `bg-surface-0`, `border-border`, etc. No raw hex/rgb values appear outside `globals.css`. Default Tailwind color classes remain technically reachable (Tailwind doesn't purge its base palette), but nothing in the scaffold references them — future code review enforces the "no static colors" rule from `CLAUDE.md`.

Note on `PLAN.md` Phase 1 vs Phase 5: Phase 1's task says "placeholder values acceptable... final palette applied in Phase 5," but since `CLAUDE.md` already specifies the final hex values, this scaffold uses them directly in Phase 1 rather than a throwaway placeholder set. Phase 5's "apply final palette" task becomes a no-op / already-satisfied by the time it's reached.

## Dependencies

Installed but not configured/wired up (so later roadmap steps don't hit missing-package friction):

- `gsap` (scroll animations — step 2/3)
- `ai` (Vercel AI SDK — step 4)
- `@anthropic-ai/sdk` (chatbot backend — step 4)

Plus whatever `create-next-app` and `shadcn init` bring in by default (React, TypeScript, Tailwind v4, ESLint).

## Out of scope for this session

- No real content inside skeleton components (copy, images, data)
- No chat logic (message state, streaming, `useChat`)
- No GSAP ScrollTrigger setup
- No real Anthropic SDK / Vercel AI SDK wiring in `route.ts`, `context.ts`, `anthropic.ts` (files exist, empty)
- No Prettier, no test framework (explicitly declined)

This matches Phase 1 of `PLAN.md` exactly — its acceptance criteria are the acceptance criteria for this design: project builds and runs (`next dev`), all pages/components render without errors, no static color values anywhere in the code.

## Tooling

- Package manager: pnpm
- Linting: ESLint defaults from `create-next-app`, no Prettier
- Testing: none for now
- Git: initialize repo, `.gitignore`, initial commit includes the scaffold
