import type { Ref } from 'react';

interface SuggestedPromptsProps {
  ref?: Ref<HTMLDivElement>;
}

export function SuggestedPrompts({ ref }: SuggestedPromptsProps) {
  return (
    <div ref={ref} data-component="SuggestedPrompts">
      SuggestedPrompts
    </div>
  );
}
