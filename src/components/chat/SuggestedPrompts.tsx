import type { Ref } from 'react';

interface SuggestedPromptsProps {
  ref?: Ref<HTMLDivElement>;
  onSelect: (text: string) => void;
}

const PROMPTS = [
  'What tech stack do you use?',
  "Tell me about your athletic side",
  'Are you open to work?',
];

export function SuggestedPrompts({ ref, onSelect }: SuggestedPromptsProps) {
  return (
    <div ref={ref} data-component="SuggestedPrompts" className="flex flex-wrap gap-2 px-4 py-3">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="text-xs px-3 py-1.5 rounded-full text-muted-foreground transition-all duration-200 cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = '';
          }}
        >
          {prompt}
        </button>
      ))}
      <a
        href="/cv-ahmet-berkay-kocak.pdf"
        download
        className="text-xs px-3 py-1.5 rounded-full text-muted-foreground transition-all duration-200 cursor-pointer"
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-primary)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLAnchorElement).style.color = '';
        }}
      >
        Download CV
      </a>
    </div>
  );
}
