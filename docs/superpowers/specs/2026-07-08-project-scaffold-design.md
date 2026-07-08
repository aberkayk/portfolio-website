# Project Scaffold — Design

## Purpose

Bootstrap the portfolio repository (roadmap step 1 in `CLAUDE.md`): a working Next.js app skeleton with the stack, folder structure, and color system in place, but no page content or feature logic yet. Later roadmap steps (chat scroll animation, projects reveal, chatbot backend, visual polish) build on top of this.

## Structure

App Router with a `src/` directory:

```
portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/          # empty, for Chat.tsx later
│   │   ├── projects/      # empty, for ProjectModal etc.
│   │   ├── sections/      # Hero, Experience, Skills placeholders later
│   │   └── ui/            # shadcn components land here
│   └── lib/                # utils, later: anthropic client, ai sdk helpers
├── public/
├── components.json         # shadcn config
├── tailwind.config.ts
├── tsconfig.json            # strict: true
├── eslint config (create-next-app default)
├── .gitignore
├── package.json
└── README.md (minimal)
```

## Color system

`globals.css` defines exactly the CSS variables from `CLAUDE.md` under `:root`:

- `--color-primary-100/300/DEFAULT/700/900` (blue)
- `--color-accent-100/300/DEFAULT/700/900` (green)
- `--color-surface-0/1/2`, `--color-border`

`tailwind.config.ts` maps these to utility classes: `bg-primary`, `text-primary-700`, `bg-accent-100`, `bg-surface-0`, `border-border`, etc. No raw hex/rgb values appear outside `globals.css`. Default Tailwind color classes remain technically reachable (Tailwind doesn't purge its base palette), but nothing in the scaffold references them — future code review enforces the "no static colors" rule from `CLAUDE.md`.

## Dependencies

Installed but not configured/wired up (so later roadmap steps don't hit missing-package friction):

- `gsap` (scroll animations — step 2/3)
- `ai` (Vercel AI SDK — step 4)
- `@anthropic-ai/sdk` (chatbot backend — step 4)

Plus whatever `create-next-app` and `shadcn init` bring in by default (React, TypeScript, Tailwind v4, ESLint).

## Out of scope for this session

- No section content (Hero, Projects, Experience, Skills)
- No chat component logic
- No GSAP ScrollTrigger setup
- No API routes
- No Prettier, no test framework (explicitly declined)

## Tooling

- Package manager: pnpm
- Linting: ESLint defaults from `create-next-app`, no Prettier
- Testing: none for now
- Git: initialize repo, `.gitignore`, initial commit includes the scaffold
