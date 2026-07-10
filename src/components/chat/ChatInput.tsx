'use client';

import { useState, type FormEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

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
      className="flex gap-2 border-t border-border p-3"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Ask me anything..."
        className="flex-1 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-foreground outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
