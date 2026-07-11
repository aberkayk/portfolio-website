import { OWNER_CONTEXT } from '@/lib/chat/context';

export function Timeline() {
  return (
    <ol data-component="Timeline" className="flex flex-col gap-8">
      {OWNER_CONTEXT.experience.map((entry) => (
        <li key={`${entry.company}-${entry.period}`} className="border-l-2 border-border pl-6">
          <h3 className="text-lg font-semibold text-foreground">{entry.role}</h3>
          <p className="text-sm text-muted-foreground">
            {entry.company} · {entry.period}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground">
            {entry.highlights.map((highlight) => (
              <li key={highlight}>- {highlight}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
