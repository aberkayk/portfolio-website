# CLAUDE.md

Project context and rules for Claude Code when working on this repository.

## Project

A personal portfolio site with an AI chatbot as a centerpiece feature. Visitors can ask the chatbot questions about the owner's background, skills, and projects. The site also showcases projects, experience, and skills with a playful, interactive visual style.

## Stack

* Next.js 16 (App Router)
* React + TypeScript (strict mode)
* Tailwind v4
* shadcn/ui
* GSAP + ScrollTrigger (scroll-linked animations)
* Vercel AI SDK (`ai` package) for chat streaming
* Anthropic SDK (`@anthropic-ai/sdk`) for the chatbot backend

## Global Rules

These apply to every file, every component, and every prompt used in this project.

### No static colors — ever

Never hardcode a color value anywhere in the codebase: no hex codes, no `rgb()`/`hsl()` literals, no default Tailwind color classes (`bg-purple-500`, `text-gray-800`, etc.) used directly in components. Every color must resolve from a CSS variable defined in `app/globals.css`, mapped through `tailwind.config.ts`, and referenced via utility classes (`bg-primary`, `text-accent`, `bg-surface-0`, etc.). This includes inline styles, SVG fills/strokes, gradient stops, and shadow colors. If a new color is ever needed, add it as a variable in `globals.css` first — never inline a raw value.

### Color palette (defined in globals.css)

```css
:root {
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
}
```

Usage: primary (blue) for buttons, chatbot bubbles, CTAs, links. Accent (green) for hover/active/success states and as the second alternating color in scroll reveals. Never introduce a third color into these interaction patterns — only primary and accent.

### Component conventions

* All components are TypeScript strict mode with explicit prop types.
* The chat component (`components/chat/Chat.tsx`) is a single component with two CSS states (hero-centered, widget-docked) driven by scroll — never split into two separate components, to avoid losing message/input state.
* `ProjectModal` must be generic and reusable via a `children` prop + `onClose`, since it will later host non-project content (see v2 note below).
* Any scroll-linked animation goes through GSAP + ScrollTrigger with `scrub: true` and must be cleaned up on unmount. See the `gsap-scroll-animations` skill for the two established patterns (morph, staggered reveal).
* Respect `prefers-reduced-motion`: every scroll animation needs a reduced-motion fallback (simple fade, no size/position/rotation transforms).

## Roadmap (see PLAN.md for details)

1. Project scaffold & component structure
2. Hero → widget chat scroll animation
3. Projects section "dealing cards" scroll reveal
4. Chatbot backend (system prompt + streaming API route)
5. Visual theme polish (typography, micro-interactions)

## V2 (not implemented yet, keep architecture compatible)

An iGaming slot game will be added later, opened via `ProjectModal` when a project card is clicked. `ProjectModal` must stay generic enough to host this without rework.
