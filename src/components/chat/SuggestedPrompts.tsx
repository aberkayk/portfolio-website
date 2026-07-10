import type { Ref } from 'react';

interface SuggestedPromptsProps {
  ref?: Ref<HTMLDivElement>;
  onSelect: (text: string) => void;
}

const PROMPTS = ['What do you work on?', 'What are your skills?', 'How can I contact you?'];

export function SuggestedPrompts({ ref, onSelect }: SuggestedPromptsProps) {
  return (
    <div ref={ref} data-component="SuggestedPrompts" className="flex flex-wrap gap-2 p-3">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-foreground"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
