# Phase 4 — Chatbot Backend — Design

## Purpose

Implement Phase 4 of `PLAN.md`: a streaming chatbot that answers visitor questions about
the site owner using a system prompt built from structured personal/project data, wired
into the existing `Chat`/`ChatMessage`/`ChatInput` skeleton via the Vercel AI SDK's
`useChat` hook.

## Model & cost

`claude-haiku-4-5`, streaming, `max_tokens: 1024` — short, focused portfolio Q&A replies;
Haiku is the cheapest tier and doesn't support `thinking`/`output_config.effort` (both
omitted entirely from the request).

## Owner data (`src/lib/chat/context.ts`)

Structured data provided directly by the site owner (from their CV plus additional
current skills given in chat). Excludes third-party reference contact info; includes the
owner's own phone number per their explicit choice.

```ts
export const OWNER_CONTEXT = {
  name: "Ahmet Berkay Koçak",
  title: "Software Developer",
  summary:
    "Full-Stack Software Developer with 4+ years of experience building scalable, " +
    "high-performance web and mobile applications. Strong focus on performance, " +
    "accessibility, and maintainability across the full development lifecycle. " +
    "Hands-on experience integrating AI-powered services into production apps. " +
    "Also a hybrid athlete — running, CrossFit, calisthenics, and Hyrox.",
  skills: [
    "React", "Next.js", "TypeScript", "JavaScript", "React Native (Expo)",
    "Node.js", "Express.js", "NestJS", "MongoDB", "REST", "GraphQL", "Apollo Client",
    "HTML5", "CSS3", "Tailwind CSS", "SCSS", "Sass", "Less",
    "GSAP", "Framer Motion", "AI integrations / AI-powered apps",
    "Redux", "Zustand", "TanStack Query", "Jest", "Cypress",
    "GTM", "GA4", "Mixpanel", "SEO", "Core Web Vitals", "WCAG / Accessibility",
    "Responsive Design", "Internationalization (i18n)",
  ],
  interests: ["running", "CrossFit", "calisthenics", "Hyrox", "hybrid athlete training"],
  experience: [
    {
      company: "FreshDirect (USA)",
      role: "Frontend Developer",
      period: "Sep 2025 – Present",
      highlights: [
        "Scalable frontend architectures with Next.js, TypeScript, and SCSS",
        "Led CSR/SSR performance optimizations, improving Core Web Vitals",
        "Built PDP features, Gift Card flows, Single Page Checkout",
        "Contributed to company-wide accessibility (a11y) / WCAG initiatives",
        "Scalable data-fetching with GraphQL, Apollo Client, and REST",
        "GA4 and Mixpanel tracking for data-driven product decisions",
        "Frontend test coverage with Jest and Cypress",
      ],
    },
    {
      company: "Tintech",
      role: "Full-Stack Developer",
      period: "Sep 2024 – Sep 2025",
      highlights: [
        "Built the platform from scratch: Next.js, React, Node.js, Express.js, MongoDB",
        "Custom CMS and admin panel for non-technical content management",
        "Next.js SSR/SSG for an SEO-friendly, high-search-visibility infrastructure",
        "Designed RESTful APIs for secure frontend-backend communication",
      ],
    },
    {
      company: "Dexport",
      role: "Frontend Developer",
      period: "Nov 2023 – Sep 2024",
      highlights: [
        "High-performance social features (Posts, Stories, Reels) with optimized media " +
          "delivery, including a prefetch strategy preloading the next 2 videos during " +
          "playback",
        "Multi-tenant architecture for independent company profiles with dedicated " +
          "inventory management",
        "Dual-channel commerce: B2C retail and B2B wholesale, bulk pricing, stock, " +
          "order tracking",
        "Fully responsive, mobile-first UI with Tailwind CSS",
      ],
    },
    {
      company: "Hogarth Worldwide",
      role: "Frontend Developer",
      period: "Feb 2023 – Sep 2023",
      highlights: [
        "Fully responsive, bilingual (English + Arabic RTL) websites in vanilla HTML/CSS/JS",
        "Pixel-perfect UI implementations across all target browsers and devices",
        "Maintained digital platforms for enterprise technology clients — performance, " +
          "SEO, regional compliance",
      ],
    },
    {
      company: "Independent",
      role: "Fitness Trainer",
      period: "4 years",
      highlights: [
        "Delivered private (1-on-1) training sessions",
        "Led group training classes",
      ],
    },
  ],
  education: {
    school: "MEF University",
    period: "2015 – 2020",
    degree: "Bachelor of Engineering — Mechanical Engineering (English)",
  },
  projects: [], // to be filled in later — see "Projects" below
  contact: {
    email: "aberkayk@gmail.com",
    phone: "+90 506 669 57 96",
    linkedin: "linkedin.com/in/ahmetberkaykocak",
    github: "github.com/aberkayk",
  },
};

export function buildSystemPrompt(): string {
  /* renders OWNER_CONTEXT into a system prompt string — see Implementation Plan */
}
```

**Projects:** left empty for now (owner will provide these separately). The system
prompt must handle this honestly — if asked about projects, the chatbot says they
haven't been added to the site yet rather than inventing any.

**System prompt behavior:** answer only using `OWNER_CONTEXT`; for off-topic questions,
decline politely and redirect toward the owner's background/skills/projects; never
invent facts not present in the data.

## Backend (`src/lib/chat/anthropic.ts`, `src/app/api/chat/route.ts`)

- `src/lib/chat/anthropic.ts`: exports a singleton `Anthropic` client (`new Anthropic()`,
  credentials from environment per the SDK's normal resolution) and a `RateLimiter`
  interface with a simple in-memory fixed-window implementation (e.g. 10 requests/minute
  per client IP, keyed in a module-scope `Map`). Documented caveat: in-memory state does
  not survive a cold start or persist across serverless instances — acceptable per
  `PLAN.md`'s explicit choice, and the interface boundary allows swapping in a durable
  store (Redis/Upstash) later without touching the route.
- `src/app/api/chat/route.ts`: `POST` handler —
  1. Check the rate limiter; on exceeded, return a `429` with a JSON error body (no
     streaming attempted).
  2. Parse the incoming `messages` (AI SDK `UIMessage[]` sent by `useChat`), convert to
     Anthropic `MessageParam[]`.
  3. Call `client.messages.stream({ model: "claude-haiku-4-5", max_tokens: 1024, system:
     buildSystemPrompt(), messages })`.
  4. Bridge the raw Anthropic stream into an AI SDK UI message stream via
     `createUIMessageStream`'s `execute({ writer })`: write `start` →  `text-start` →
     one `text-delta` per Anthropic `text_delta` event → `text-end` → `finish`.
  5. Wrap in `try/catch`: on `Anthropic.APIError` (or subclasses), write an `error` chunk
     with a user-safe message (never leak raw API error text) instead of letting the
     route throw.
  6. Return `createUIMessageStreamResponse({ stream })`.

## Frontend wiring

- `Chat.tsx` calls `useChat({ transport: new DefaultChatTransport({ api: '/api/chat' })
  })` from `@ai-sdk/react`, getting back `{ messages, sendMessage, status, error }`.
- `ChatMessage` renders a single message (`{ message: UIMessage }` prop) — `Chat.tsx`
  maps `messages` to a list of `<ChatMessage key={m.id} message={m} />`.
- `ChatInput` owns its own local text-input state and calls `sendMessage({ text })` on
  submit; disabled while `status === 'streaming'` or `status === 'submitted'`.
- `SuggestedPrompts` (already fades out on dock per Phase 2) becomes clickable — clicking
  a suggestion calls the same `sendMessage`.

## Out of scope

- Real project data (`OWNER_CONTEXT.projects` stays empty).
- Tool use / function calling — plain text Q&A only.
- Persisting conversation history across page reloads.
- Any visual polish beyond what's needed for the chat to be usable (Phase 5).

## Acceptance criteria (from `PLAN.md`, unchanged)

Chatbot answers portfolio-related questions accurately, declines unrelated questions
gracefully, rate limiting triggers correctly, streaming renders token-by-token in the UI.
