"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ProjectEntry } from "@/lib/chat/context";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: ProjectEntry;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isBlue = project.accent === "blue";
  const accentColor = isBlue ? "var(--color-primary)" : "var(--color-accent)";
  const accentBg = isBlue
    ? "color-mix(in oklab, var(--color-primary) 10%, transparent)"
    : "color-mix(in oklab, var(--color-accent) 10%, transparent)";
  const accentBorder = isBlue
    ? "color-mix(in oklab, var(--color-primary) 25%, transparent)"
    : "color-mix(in oklab, var(--color-accent) 25%, transparent)";

  const images =
    project.images.length > 0 ? project.images : ["/projects/default.png"];

  return (
    <Card
      data-component="ProjectCard"
      data-accent={project.accent}
      className="relative flex h-[420px] flex-col overflow-hidden md:h-[460px]"
    >
      {/* Background screenshot(s) -- drop real images in public/projects/, named
          per the `images` paths in lib/chat/context.ts. Falls back to
          default.png for projects that don't have screenshots yet. */}
      <div className="absolute inset-0 flex opacity-20">
        {images.map((src) => (
          // `Image` with `fill` is absolutely positioned internally, which
          // takes it out of flex flow entirely -- flex-1 has to go on this
          // wrapping div (a real flex item), not on the Image itself, or
          // every image collapses onto the same spot instead of lining up
          // side by side when there's more than one.
          <div key={src} className="relative h-full flex-1">
            <Image
              fill
              className="object-contain"
              src={src}
              alt={`Screenshot of ${project.name}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-xl md:text-2xl">{project.name}</CardTitle>
        <CardDescription
          className="line-clamp-4 text-sm md:text-base"
          style={{
            textShadow:
              "0 2px 12px color-mix(in oklab, var(--color-surface-0) 90%, transparent)",
          }}
        >
          {project.description}
        </CardDescription>
        <CardAction>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${project.name}`}
            className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ExternalLink size={20} />
          </a>
        </CardAction>
      </CardHeader>

      <CardContent className="relative z-10 mt-auto flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-full px-2.5 py-1 text-xs font-medium md:px-3 md:py-1.5 md:text-sm"
            style={{
              background: accentBg,
              color: accentColor,
              border: `1px solid ${accentBorder}`,
            }}
          >
            {tech}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
