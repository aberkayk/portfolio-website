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
    }))
    .filter((message) => message.content.trim().length > 0);
}

// The rate-limit key trusts the first hop of `x-forwarded-for`. This is only
// sound behind a proxy that sets/overwrites this header (e.g. Vercel's edge
// network) -- on a bare Node/self-hosted deployment a client can send an
// arbitrary value and bypass the limiter. If self-hosting without a trusted
// proxy in front, replace this with a value the platform actually controls
// (e.g. the raw socket address) instead.
function getClientKey(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (!forwardedFor) return 'unknown';
  return forwardedFor.split(',')[0].trim();
}

export async function POST(req: Request) {
  const ip = getClientKey(req);
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

  let messages: UIMessage[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.messages)) {
      throw new Error('Invalid request body');
    }
    messages = body.messages;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'start' });
      const textId = crypto.randomUUID();
      writer.write({ type: 'text-start', id: textId });

      try {
        const anthropicStream = anthropic.messages.stream(
          {
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            system: buildSystemPrompt(),
            messages: toAnthropicMessages(messages),
          },
          { signal: req.signal },
        );

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
