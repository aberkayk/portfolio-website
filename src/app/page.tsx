"use client";

import { Hero } from "@/components/sections/Hero";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ContactSection } from "@/components/sections/ContactSection";

// Browsers restore the previous scroll position on load/refresh by default
// (history.scrollRestoration === "auto"). Combined with this page's pinned
// projects carousel changing the document's total height as its
// ScrollTrigger sets up, a restored position calculated against the OLD
// height can land somewhere that no longer corresponds to "the top" once
// the new pin spacer is in place.
//
// This must run at module scope, not inside a React effect: effects
// (including useLayoutEffect) only run AFTER the component tree mounts, and
// React fires layout effects bottom-up -- ProjectsSection's own useGSAP
// setup (a child component) would already have run and read whatever
// scroll position the browser had restored BEFORE a parent-level effect
// here ever got a chance to reset it. Module-scope code executes the
// moment this file's JS is evaluated, before any component mounts at all.
if (typeof window !== "undefined") {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  // Setting scrollRestoration only affects FUTURE restoration decisions --
  // it does not cancel a restoration the browser already queued for THIS
  // navigation, which some browsers apply asynchronously as the page's
  // resources (fonts, images) finish loading and the layout settles. That
  // shows up as: starts at the top correctly, then visibly drops down a
  // moment later. Catching and re-correcting once on `load` (by which point
  // any such restoration has already fired) closes that window.
  window.addEventListener("load", () => window.scrollTo(0, 0), {
    once: true,
  });
}

export default function Home() {
  return (
    <>
      {/* Hero renders Chat as its own child now, sharing Hero's background,
          spotlight, and grid pattern -- side by side from `lg` up (there
          isn't enough room for both the hero text and a usable chat panel
          below that), stacked on mobile/tablet. */}
      <Hero />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <ContactSection />
    </>
  );
}
