import type { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  const isUser = message.role === 'user';

  return (
    <div
      data-component="ChatMessage"
      data-role={message.role}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: '16px',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'var(--color-surface-2)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                borderBottomLeftRadius: '4px',
              }
        }
      >
        {text}
      </div>
    </div>
  );
}
