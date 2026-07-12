"use client";

import { useRef } from "react";
import { Dumbbell } from "lucide-react";
import { OWNER_CONTEXT } from "@/lib/chat/context";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type SkillCat = "frontend" | "backend" | "devops" | "athlete";

interface SkillItem {
  label: string;
  cat: SkillCat;
}

const CATEGORISED_SKILLS: SkillItem[] = [
  // Frontend
  { label: "React", cat: "frontend" },
  { label: "Next.js", cat: "frontend" },
  { label: "TypeScript", cat: "frontend" },
  { label: "React Native (Expo)", cat: "frontend" },
  { label: "GSAP", cat: "frontend" },
  { label: "Framer Motion", cat: "frontend" },
  { label: "Tailwind CSS", cat: "frontend" },
  { label: "HTML5 / CSS3", cat: "frontend" },
  { label: "Responsive Design", cat: "frontend" },
  { label: "WCAG / Accessibility", cat: "frontend" },
  { label: "Internationalization (i18n)", cat: "frontend" },
  // Backend / data
  { label: "Node.js", cat: "backend" },
  { label: "Express.js", cat: "backend" },
  { label: "NestJS", cat: "backend" },
  { label: "MongoDB", cat: "backend" },
  { label: "REST", cat: "backend" },
  { label: "GraphQL", cat: "backend" },
  { label: "Apollo Client", cat: "backend" },
  { label: "AI integrations", cat: "backend" },
  // State / tooling
  { label: "Redux", cat: "devops" },
  { label: "Zustand", cat: "devops" },
  { label: "TanStack Query", cat: "devops" },
  { label: "Jest", cat: "devops" },
  { label: "Cypress", cat: "devops" },
  { label: "GTM / GA4", cat: "devops" },
  { label: "Mixpanel", cat: "devops" },
  { label: "Core Web Vitals", cat: "devops" },
  { label: "SEO", cat: "devops" },
  // Athlete
  { label: "CrossFit", cat: "athlete" },
  { label: "Hyrox", cat: "athlete" },
  { label: "Running", cat: "athlete" },
  { label: "Calisthenics", cat: "athlete" },
];

function catStyle(cat: SkillCat) {
  switch (cat) {
    case "frontend":
      return {
        bg: "color-mix(in oklab, var(--color-primary) 12%, transparent)",
        color: "var(--color-primary)",
        border: "color-mix(in oklab, var(--color-primary) 30%, transparent)",
        glow: "color-mix(in oklab, var(--color-primary) 30%, transparent)",
      };
    case "backend":
      return {
        bg: "color-mix(in oklab, var(--color-primary) 7%, transparent)",
        color: "var(--color-primary-300)",
        border: "color-mix(in oklab, var(--color-primary) 20%, transparent)",
        glow: "color-mix(in oklab, var(--color-primary) 20%, transparent)",
      };
    case "devops":
      return {
        bg: "color-mix(in oklab, var(--color-accent) 12%, transparent)",
        color: "var(--color-accent)",
        border: "color-mix(in oklab, var(--color-accent) 30%, transparent)",
        glow: "color-mix(in oklab, var(--color-accent) 30%, transparent)",
      };
    case "athlete":
      return {
        bg: "color-mix(in oklab, var(--color-accent-700) 12%, transparent)",
        color: "var(--color-accent-700)",
        border: "color-mix(in oklab, var(--color-accent-700) 30%, transparent)",
        glow: "color-mix(in oklab, var(--color-accent-700) 30%, transparent)",
      };
  }
}

// Suppress unused variable warning — OWNER_CONTEXT.skills is still the source of truth
// for the chatbot; CATEGORISED_SKILLS is used for display only.
void OWNER_CONTEXT;

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="skills"
      data-component="SkillsSection"
      className="py-20 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div
            className="text-xs font-mono mb-2 tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            TOOLKIT &amp; LIFESTYLE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Skills
          </h2>
        </div>

        {/* Skill pills */}
        <div className="flex flex-wrap gap-3">
          {CATEGORISED_SKILLS.map((skill) => {
            const s = catStyle(skill.cat);
            return (
              <span
                key={skill.label}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-default"
                style={{
                  background: s.bg,
                  color: s.color,
                  border: `1px solid ${s.border}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.transform =
                    "scale(1.05)";
                  (
                    e.currentTarget as HTMLSpanElement
                  ).style.boxShadow = `0 0 12px ${s.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.transform = "";
                  (e.currentTarget as HTMLSpanElement).style.boxShadow = "";
                }}
              >
                {skill.label}
              </span>
            );
          })}
        </div>

        {/* Hybrid athlete callout */}
        <div
          className="mt-10 rounded-[20px] p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 8%, transparent), color-mix(in oklab, var(--color-primary) 6%, transparent))",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "color-mix(in oklab, var(--color-accent) 15%, transparent)",
              border: "1px solid color-mix(in oklab, var(--color-accent) 30%, transparent)",
            }}
          >
            <Dumbbell size={18} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <div className="text-sm font-semibold font-heading mb-1 text-foreground">
              The hybrid athlete mindset
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Competing across CrossFit, Hyrox, and running has taught me that
              the same principles that make a great training block — progressive
              overload, recovery, specificity — make great software. Discipline
              compounds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
