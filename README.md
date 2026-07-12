# Ahmet Berkay Koçak — Portfolio

Personal portfolio site with an AI chatbot as its centerpiece. Visitors can ask the chatbot about my background, skills, and projects, or just browse the site directly.

**Live:** _not deployed yet_

## Highlights

- **Hybrid AI chat** — tries Chrome's on-device Gemini Nano first, falls back to Claude (Anthropic API) via a streaming route when Nano isn't available
- **Projects** — a responsive grid with alternating scroll-reveal animations and load-more pagination
- **Fully responsive**, dark, monochrome design system built on Tailwind v4 + shadcn/ui
- Scroll-linked animations via GSAP + ScrollTrigger, with `prefers-reduced-motion` fallbacks throughout

## Stack

- Next.js 16 (App Router) + React + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- GSAP + ScrollTrigger
- Vercel AI SDK (`ai`, `@ai-sdk/react`) + `@anthropic-ai/sdk`

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Environment

The chatbot's Claude fallback needs an Anthropic API key — see `src/lib/chat/anthropic.ts` for the expected environment variable.
