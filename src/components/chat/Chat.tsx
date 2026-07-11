'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MessageCircle, Minus } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useChatMorph, getDockedSize, getBottomRightRect, getPanelRect } from '@/hooks/useChatMorph';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

const chatTransport = new DefaultChatTransport({ api: '/api/chat' });

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
  const { messages, sendMessage, status } = useChat({ transport: chatTransport });
  const isBusy = status === 'streaming' || status === 'submitted';

  // Keep isDockedRef fresh via useLayoutEffect, not useEffect, and declare
  // it BEFORE the useGSAP call below. @gsap/react's useGSAP fires as a
  // layout effect internally, and React runs ALL layout effects in a
  // commit before any plain (useEffect) effects -- a plain useEffect here
  // would still read stale on the exact render where isDocked and
  // isMinimized change together (undocking while minimized), because
  // useGSAP's own layout effect would already have fired and read the old
  // value first. Declaring this useLayoutEffect earlier in the component
  // body guarantees it runs before useGSAP's internal one in the same
  // commit (layout effects fire in hook-call order). No setState happens
  // in this effect, so eslint's react-hooks/set-state-in-effect doesn't apply.
  //
  // This effect ALSO kills any in-flight minimize/expand tween the moment
  // undocking starts, and immediately re-applies the correct panel
  // geometry itself. Without this, a minimize tween still ticking (its
  // 0.3s duration) when the user scrolls back up keeps overwriting the
  // container's top/left/width/height on every remaining frame, fighting
  // useChatMorph's own scroll-driven tween for the same properties on the
  // same element -- once the minimize tween finishes, nothing is left
  // driving the container, so it freezes at the minimized/docked geometry.
  //
  // kill() alone is not sufficient: it stops FURTHER writes from the
  // minimize tween, but does not undo whatever value the last interleaved
  // frame already left on the element. Tried forcing useChatMorph's own
  // ScrollTrigger to re-render via ScrollTrigger.update() instead of
  // setting the rect directly here -- confirmed via live reproduction
  // that this does NOT work: if ScrollTrigger already considers the
  // current scroll position "applied" (nothing changed since its last
  // internal check, which the same scroll event that triggered this
  // effect already satisfied), update() is a no-op and won't re-render
  // over whatever the competing minimize tween wrote afterward. A genuine
  // extra scroll event does unstick it, which is what confirmed the root
  // cause -- but nothing guarantees the user scrolls again. Calling
  // getPanelRect() directly and applying it here bypasses that caching
  // entirely: at isDocked=false the scroll position is always exactly the
  // hero-panel state (that's the only state ScrollTrigger transitions
  // to on undock), so this is never a guess, just the same formula
  // useChatMorph itself uses for that exact state.
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

  // Reset isMinimized when undocking, without a useEffect: React's
  // documented "adjust state during render" pattern (see "You Might Not
  // Need an Effect"). Comparing against prevIsDocked -- state, not a ref;
  // mutating a ref during render trips eslint's react-hooks/refs rule --
  // makes this fire exactly once per real isDocked change, converging
  // within the same render pass, including safely under StrictMode.
  if (prevIsDocked !== isDocked) {
    setPrevIsDocked(isDocked);
    if (!isDocked) setIsMinimized(false);
  }

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Content/icon visibility always follows isMinimized, regardless of
    // dock state. This must NOT be gated on isDockedRef: undocking forces
    // isMinimized back to false in the effect above, and by the time this
    // effect re-runs for that change, isDockedRef.current is already false
    // (set synchronously in that same prior effect) -- gating this part on
    // "currently docked" would skip restoring the content, leaving it
    // permanently invisible even after the container's size is later
    // restored by useChatMorph's own scroll-driven tween.
    if (reduced) {
      gsap.set(contentRef.current, {
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto',
      });
      if (iconRef.current) {
        gsap.set(iconRef.current, {
          opacity: isMinimized ? 1 : 0,
          pointerEvents: isMinimized ? 'auto' : 'none',
        });
      }
    } else {
      gsap.to(contentRef.current, {
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto',
        duration: 0.2,
      });
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          opacity: isMinimized ? 1 : 0,
          pointerEvents: isMinimized ? 'auto' : 'none',
          duration: 0.2,
        });
      }
    }

    // Resizing the container is only this effect's job while actually
    // docked -- useChatMorph owns the container's size while transitioning
    // to/from the hero panel, and touching it here during that transition
    // would fight that tween.
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
        ease: 'power2.out',
      });
    }
  }, { dependencies: [isMinimized] });

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className={`z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 ${
        isDocked ? 'shadow-glow-primary' : 'shadow-lg'
      }`}
    >
      <div ref={contentRef} className="relative flex h-full flex-col">
        <SuggestedPrompts ref={suggestedPromptsRef} onSelect={(text) => sendMessage({ text })} />
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <ChatInput onSend={(text) => sendMessage({ text })} disabled={isBusy} />
        {isDocked && (
          <button
            type="button"
            aria-label="Minimize chat"
            onClick={() => setIsMinimized(true)}
            className="absolute right-2 top-2 text-muted-foreground"
          >
            <Minus className="size-4" />
          </button>
        )}
      </div>
      {isDocked && (
        <button
          ref={iconRef}
          type="button"
          aria-label="Expand chat"
          onClick={() => setIsMinimized(false)}
          className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground opacity-0"
          style={{ pointerEvents: 'none' }}
        >
          <MessageCircle className="size-6" />
        </button>
      )}
    </div>
  );
}
