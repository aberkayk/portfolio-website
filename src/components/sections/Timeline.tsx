import { ChevronRight } from 'lucide-react';
import { OWNER_CONTEXT } from '@/lib/chat/context';

export function Timeline() {
  return (
    <div className="relative" data-component="Timeline">
      {/* Vertical line — only visible on md+ */}
      <div
        className="absolute left-0 md:left-[200px] top-0 bottom-0 w-px hidden md:block"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-border) 10%, var(--color-border) 90%, transparent)',
        }}
      />

      <ol className="flex flex-col gap-10">
        {OWNER_CONTEXT.experience.map((entry, i) => (
          <li key={`${entry.company}-${entry.period}`} className="flex flex-col md:flex-row gap-4 md:gap-10">
            {/* Left meta column */}
            <div className="md:w-[200px] shrink-0 md:text-right">
              <div className="text-sm font-semibold font-heading text-foreground mb-1">
                {entry.company}
              </div>
              <div className="text-xs text-muted-foreground">{entry.period}</div>
            </div>

            {/* Timeline dot */}
            <div className="hidden md:flex items-start justify-center w-5 shrink-0 pt-1">
              <div
                className="w-3 h-3 rounded-full border-2 shrink-0"
                style={{
                  background: 'var(--color-surface-0)',
                  borderColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                  boxShadow: i % 2 === 0
                    ? '0 0 8px rgba(55,138,221,0.5)'
                    : '0 0 8px rgba(99,153,34,0.5)',
                }}
              />
            </div>

            {/* Content card */}
            <div
              className="flex-1 rounded-[16px] p-5"
              style={{
                background: 'var(--color-surface-1)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="text-base font-semibold font-heading mb-3 text-primary">
                {entry.role}
              </div>
              <ul className="flex flex-col gap-2">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <ChevronRight
                      size={14}
                      className="shrink-0 mt-0.5"
                      style={{ color: 'var(--color-accent)' }}
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
