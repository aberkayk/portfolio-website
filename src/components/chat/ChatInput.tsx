'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { useSpringPress } from '@/hooks/useSpringPress';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  useSpringPress(sendButtonRef);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <form
      data-component="ChatInput"
      onSubmit={handleSubmit}
      className="flex items-center gap-3 mx-3 mb-3 px-4 py-2.5 rounded-[14px]"
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Ask me anything..."
        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <button
        ref={sendButtonRef}
        type="submit"
        id="chat-send-btn"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary shadow-glow-primary disabled:opacity-40 disabled:shadow-none transition-all duration-200"
        onMouseEnter={(e) => {
          if (!disabled) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = '';
        }}
      >
        <Send size={14} color="#fff" />
      </button>
    </form>
  );
}
