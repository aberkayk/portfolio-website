"use client";

import { Code2, Dumbbell } from "lucide-react";
import { Spotlight } from "@/components/ui/Spotlight";
import { Chat } from "@/components/chat/Chat";

export function Hero() {
  return (
    <section
      data-component="Hero"
      className="relative isolate overflow-hidden min-h-screen flex flex-col justify-center bg-surface-0 lg:flex-row items-center"
    >
      {/* Spotlight from right side */}
      <Spotlight
        className="-top-40 right-0 md:-top-20 md:right-60"
        fill="white"
      />

      {/* Grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-size-[40px_40px] select-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
        }}
      />

      <div className="max-w-6xl mx-auto w-full px-6 pt-32 pb-20 lg:flex-1 z-10">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{
            background:
              "color-mix(in oklab, var(--color-primary) 10%, transparent)",
            border:
              "1px solid color-mix(in oklab, var(--color-primary) 25%, transparent)",
            color: "var(--color-primary)",
          }}
        >
          <Code2 size={12} />
          Available for new projects and competitions
          <Dumbbell size={12} style={{ color: "var(--color-accent)" }} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading leading-none tracking-tight mb-5">
          Software Engineer
          <br />
          <span className="text-primary">&amp;</span>{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-100))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Hybrid Athlete
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg max-w-xl leading-relaxed text-muted-foreground">
          I build high-performance digital products by day and train as an
          hybrid athlete in different sports.{" "}
          <span className="text-foreground font-medium">
            Ahmet Berkay Koçak
          </span>{" "}
          — full-stack software developer based in Istanbul.
        </p>

        {/* AI-driven development callout */}
        <p className="mt-3 text-sm max-w-xl leading-relaxed text-muted-foreground">
          Experienced in{" "}
          <span className="text-foreground font-medium">
            full agentic AI-driven development
          </span>{" "}
          — this site itself was built end-to-end that way.
        </p>
      </div>

      <Chat />
    </section>
  );
}
