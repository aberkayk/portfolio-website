import Anthropic from '@anthropic-ai/sdk';
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from 'ai';
import { anthropic, rateLimiter } from '@/lib/chat/anthropic';
import { buildSystemPrompt } from '@/lib/chat/context';

function toAnthropicMessages(messages: UIMessage[]): Anthropic.MessageParam[] {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.parts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('\n'),
    }));
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed, retryAfterMs } = rateLimiter.check(ip);

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(retryAfterMs / 1000).toString() },
      },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'start' });
      const textId = crypto.randomUUID();
      writer.write({ type: 'text-start', id: textId });

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages: toAnthropicMessages(messages),
        });

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            writer.write({ type: 'text-delta', id: textId, delta: event.delta.text });
          }
        }
      } catch (error) {
        const message =
          error instanceof Anthropic.APIError
            ? 'The assistant is temporarily unavailable. Please try again shortly.'
            : 'Something went wrong. Please try again.';
        writer.write({ type: 'text-delta', id: textId, delta: `\n\n${message}` });
      }

      writer.write({ type: 'text-end', id: textId });
      writer.write({ type: 'finish' });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
