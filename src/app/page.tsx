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
