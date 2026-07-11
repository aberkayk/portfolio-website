"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MessageCircle, Minus } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useChatMorph,
  getDockedSize,
  getBottomRightRect,
  getPanelRect,
} from "@/hooks/useChatMorph";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

interface ChatProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function Chat({ heroRef }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement>(null);
  const minimizeTweenRef = useRef<gsap.core.Tween | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevIsDocked, setPrevIsDocked] = useState(false);
  const isDockedRef = useRef(false);

  const { isDocked } = useChatMorph(heroRef, containerRef, suggestedPromptsRef);
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
  });
  const isBusy = status === "streaming" || status === "submitted";

  // Keep isDockedRef fresh via useLayoutEffect (must run before useGSAP's own layout effect)
  useLayoutEffect(() => {
    isDockedRef.current = isDocked;
    if (!isDocked) {
      minimizeTweenRef.current?.kill();
      minimizeTweenRef.current = null;
      if (containerRef.current) {
        const isMobile = window.innerWidth < 768;
        gsap.set(containerRef.current, getPanelRect(isMobile));
      }
    }
  }, [isDocked]);

  // Reset isMinimized when undocking (render-phase state adjustment)
  if (prevIsDocked !== isDocked) {
    setPrevIsDocked(isDocked);
    if (!isDocked) setIsMinimized(false);
  }

  useGSAP(
    () => {
      if (!containerRef.current || !contentRef.current) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set(contentRef.current, {
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? "none" : "auto",
        });
        if (iconRef.current) {
          gsap.set(iconRef.current, {
            opacity: isMinimized ? 1 : 0,
            pointerEvents: isMinimized ? "auto" : "none",
          });
        }
      } else {
        gsap.to(contentRef.current, {
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? "none" : "auto",
          duration: 0.2,
        });
        if (iconRef.current) {
          gsap.to(iconRef.current, {
            opacity: isMinimized ? 1 : 0,
            pointerEvents: isMinimized ? "auto" : "none",
            duration: 0.2,
          });
        }
      }

      if (!isDockedRef.current) return;

      const isMobile = window.innerWidth < 768;
      const rect = isMinimized
        ? getBottomRightRect({ width: 56, height: 56 })
        : getBottomRightRect(getDockedSize(isMobile));
      const size = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: isMinimized ? 9999 : 16,
      };

      if (reduced) {
        gsap.set(containerRef.current, size);
      } else {
        minimizeTweenRef.current = gsap.to(containerRef.current, {
          ...size,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isMinimized] }
  );

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className={`z-50 overflow-hidden ${isDocked ? "shadow-sm" : "shadow-lg"}`}
      style={{
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        boxShadow: isDocked
          ? undefined
          : "0 0 40px rgba(55,138,221,0.15), 0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div ref={contentRef} className="relative flex h-full flex-col">
        {/* ── Chat header ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{
            background: "rgba(11,15,20,0.6)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-700))",
              color: "#fff",
            }}
          >
            ABK
          </div>
          <div>
            <div className="text-sm font-semibold font-heading text-foreground">
              Chat with ABK&apos;s AI
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="text-xs text-muted-foreground">Online now</span>
            </div>
          </div>

          {/* Minimize button (only when docked) */}
          {isDocked && (
            <button
              type="button"
              aria-label="Minimize chat"
              onClick={() => setIsMinimized(true)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Minus className="size-4" />
            </button>
          )}
        </div>

        {/* ── Suggested prompts (fades out on scroll) ── */}
        <SuggestedPrompts
          ref={suggestedPromptsRef}
          onSelect={(text) => sendMessage({ text })}
        />

        {/* ── Messages ── */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* ── Input ── */}
        <ChatInput onSend={(text) => sendMessage({ text })} disabled={isBusy} />
      </div>

      {/* Expand button shown when minimized (docked only) */}
      {isDocked && (
        <button
          ref={iconRef}
          type="button"
          aria-label="Expand chat"
          onClick={() => setIsMinimized(false)}
          className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground opacity-0"
          style={{ pointerEvents: "none" }}
        >
          <MessageCircle className="size-6" />
        </button>
      )}
    </div>
  );
}
