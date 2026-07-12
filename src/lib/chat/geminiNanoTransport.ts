import { DefaultChatTransport, type ChatTransport, type UIMessage, type UIMessageChunk } from "ai";
import { buildSystemPrompt } from "./context";

/**
 * Chrome's on-device Prompt API. Shape verified against Chrome's current
 * (M138+) `LanguageModel` global -- this API is still experimental and has
 * changed shape across Chrome versions (it used to live under `window.ai`),
 * so every call site here is defensive and falls back to the Claude
 * transport on any mismatch rather than throwing.
 */
interface LanguageModelSession {
  promptStreaming: (input: string) => AsyncIterable<string>;
  destroy?: () => void;
}

interface LanguageModelStatic {
  availability: () => Promise<
    "unavailable" | "downloadable" | "downloading" | "available"
  >;
  create: (options?: {
    initialPrompts?: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>;
  }) => Promise<LanguageModelSession>;
}

declare global {
  interface Window {
    LanguageModel?: LanguageModelStatic;
  }
}

/** Checks Chrome's Prompt API availability -- resolves false in any other browser or on error. */
export async function checkGeminiNanoAvailability(): Promise<boolean> {
  if (typeof window === "undefined" || !window.LanguageModel) return false;
  try {
    return (await window.LanguageModel.availability()) === "available";
  } catch {
    return false;
  }
}

function toPromptText(messages: UIMessage[]): string {
  const last = messages[messages.length - 1];
  if (!last) return "";
  return last.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("\n");
}

/**
 * Tries Chrome's on-device Gemini Nano first (per-message, since the model
 * can become unavailable mid-session); falls back to the existing Claude
 * `/api/chat` route on any unavailability or error. Once Nano errors out
 * once, it's assumed unreliable for the rest of the session and skipped
 * on subsequent messages instead of retried on every send.
 */
export class HybridChatTransport implements ChatTransport<UIMessage> {
  private readonly fallback = new DefaultChatTransport<UIMessage>({
    api: "/api/chat",
  });
  private session: LanguageModelSession | null = null;
  private nanoDisabled = false;

  private async getNanoSession(): Promise<LanguageModelSession | null> {
    if (this.nanoDisabled) return null;
    if (this.session) return this.session;
    if (!(await checkGeminiNanoAvailability())) return null;
    if (typeof window === "undefined" || !window.LanguageModel) return null;

    try {
      this.session = await window.LanguageModel.create({
        initialPrompts: [{ role: "system", content: buildSystemPrompt() }],
      });
      return this.session;
    } catch {
      this.nanoDisabled = true;
      return null;
    }
  }

  async sendMessages(
    options: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]
  ): Promise<ReadableStream<UIMessageChunk>> {
    const session = await this.getNanoSession();
    if (!session) {
      return this.fallback.sendMessages(options);
    }

    let nanoStream: AsyncIterable<string>;
    try {
      nanoStream = session.promptStreaming(toPromptText(options.messages));
    } catch {
      this.nanoDisabled = true;
      return this.fallback.sendMessages(options);
    }

    const textId = crypto.randomUUID();

    return new ReadableStream<UIMessageChunk>({
      async start(controller) {
        controller.enqueue({ type: "start" });
        controller.enqueue({ type: "text-start", id: textId });

        // Chrome's streaming shape has changed across versions: some builds
        // yield cumulative text on every chunk, others yield incremental
        // deltas. Diffing against the previous chunk handles both without
        // depending on which one is live in the visitor's browser.
        let previousText = "";
        try {
          for await (const chunk of nanoStream) {
            const isCumulative = chunk.startsWith(previousText);
            const delta = isCumulative ? chunk.slice(previousText.length) : chunk;
            previousText = isCumulative ? chunk : previousText + chunk;
            if (delta) controller.enqueue({ type: "text-delta", id: textId, delta });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Something went wrong.";
          controller.enqueue({ type: "text-delta", id: textId, delta: `\n\n${message}` });
        }

        controller.enqueue({ type: "text-end", id: textId });
        controller.enqueue({ type: "finish" });
        controller.close();
      },
    });
  }

  reconnectToStream(
    options: Parameters<ChatTransport<UIMessage>["reconnectToStream"]>[0]
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    return this.fallback.reconnectToStream(options);
  }
}
