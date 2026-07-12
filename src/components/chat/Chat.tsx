"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  HybridChatTransport,
  checkGeminiNanoAvailability,
} from "@/lib/chat/geminiNanoTransport";
import { CANNED_ANSWERS } from "@/lib/chat/cannedAnswers";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

function makeMessage(role: "user" | "assistant", text: string): UIMessage {
  return { id: crypto.randomUUID(), role, parts: [{ type: "text", text }] };
}

export function Chat() {
  const [isNanoAvailable, setIsNanoAvailable] = useState<boolean | null>(null);
  const chatTransport = useMemo(() => new HybridChatTransport(), []);
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: chatTransport,
  });
  const isBusy = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkGeminiNanoAvailability().then(setIsNanoAvailable);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Suggested prompts have pre-written answers -- they skip the AI (and
  // therefore work regardless of Gemini Nano availability). Anything typed
  // into the free-form input below still goes through the AI, so it's
  // gated on isNanoAvailable.
  function handlePromptSelect(text: string) {
    const canned = CANNED_ANSWERS[text];
    if (canned) {
      setMessages((prev) => [
        ...prev,
        makeMessage("user", text),
        makeMessage("assistant", canned),
      ]);
      return;
    }
    sendMessage({ text });
  }

  const inputDisabled = isBusy || isNanoAvailable !== true;
  const inputPlaceholder =
    isNanoAvailable === null
      ? "Checking availability..."
      : isNanoAvailable === false
        ? "Only available in Chrome"
        : "Ask me anything...";

  return (
    <section
      id="chat"
      data-component="Chat"
      className="relative z-10 flex justify-center px-6 pb-20 md:pb-28 lg:flex-1 lg:items-center lg:px-10 lg:pb-0"
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-border shadow-lg h-[80vh] max-h-[640px] md:h-[600px] lg:h-[75vh] lg:max-h-[640px] lg:w-full lg:max-w-none"
        style={{
          background: "var(--color-surface-1)",
          boxShadow:
            "0 0 40px color-mix(in oklab, var(--color-primary) 15%, transparent), 0 20px 60px color-mix(in oklab, var(--color-surface-0) 50%, transparent)",
        }}
      >
        {/* ── Chat header ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{
            background: "var(--color-surface-0)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-700))",
              color: "var(--color-primary-foreground)",
            }}
          >
            ABK
          </div>
          <div>
            <div className="text-sm font-semibold font-heading text-foreground">
              Chat with ABK&apos;s AI
            </div>
            {isNanoAvailable === true && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                <span className="text-xs text-muted-foreground">
                  ⚡ Powered by Gemini Nano (on-device)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Suggested prompts ── */}
        <SuggestedPrompts onSelect={handlePromptSelect} />

        {/* ── Messages ── */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <ChatInput
          onSend={(text) => sendMessage({ text })}
          disabled={inputDisabled}
          placeholder={inputPlaceholder}
          disabledReason={
            isNanoAvailable === false ? "Only active in Chrome" : undefined
          }
        />
      </div>
    </section>
  );
}
