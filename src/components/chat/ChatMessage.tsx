import type { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  return (
    <div
      data-component="ChatMessage"
      data-role={message.role}
      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
        message.role === 'user'
          ? 'self-end bg-primary text-primary-foreground'
          : 'self-start bg-surface-2 text-foreground'
      }`}
    >
      {text}
    </div>
  );
}
