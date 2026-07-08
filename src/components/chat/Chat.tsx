'use client';

import { useRef, type RefObject } from 'react';
import { useChatMorph } from '@/hooks/useChatMorph';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function Chat({ heroRef }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement>(null);

  const { isDocked } = useChatMorph(heroRef, containerRef, suggestedPromptsRef);

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className="z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg"
    >
      <div className="flex h-full flex-col">
        <SuggestedPrompts ref={suggestedPromptsRef} />
        <ChatMessage />
        <ChatInput />
      </div>
    </div>
  );
}
