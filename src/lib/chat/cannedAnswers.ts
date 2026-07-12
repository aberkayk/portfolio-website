import { OWNER_CONTEXT } from "./context";

/**
 * Pre-written answers for the suggested prompts in SuggestedPrompts.tsx.
 * These skip the AI entirely (instant, reliable, no dependency on Gemini
 * Nano/Claude being available) -- Chat.tsx checks this map before calling
 * sendMessage. Keyed by the exact prompt text.
 */
export const CANNED_ANSWERS: Record<string, string> = {
  "What tech stack do you use?":
    "Frontend:\nReact, Next.js, TypeScript, JavaScript, React Native (Expo), HTML5, CSS3, Tailwind CSS, SCSS, GSAP, Framer Motion\n\n" +
    "Backend:\nNode.js, Express.js, NestJS, MongoDB, REST, GraphQL, Apollo Client\n\n" +
    "Other:\nRedux, Zustand, TanStack Query, Jest, Cypress, GTM, GA4, Mixpanel, SEO, Core Web Vitals, WCAG / Accessibility, Responsive Design, i18n, AI integrations",

  "Tell me about your athletic side": `I'm a hybrid athlete -- ${OWNER_CONTEXT.interests.join(
    ", "
  )}. I've also worked as a Fitness Trainer for 4 years, focusing on general fitness, CrossFit, calisthenics, gymnastics, and Hyrox -- delivering private 1-on-1 sessions and leading group training classes.

The same discipline that goes into a good training block -- progressive overload, recovery, specificity -- carries directly into how I approach software.`,

  "Are you open to work?": OWNER_CONTEXT.availability,
};
