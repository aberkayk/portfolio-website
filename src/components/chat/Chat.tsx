'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MessageCircle, Minus } from 'lucide-react';
import { useChatMorph, getDockedSize, getBottomRightRect } from '@/hooks/useChatMorph';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function Chat({ heroRef }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const isDockedRef = useRef(false);

  const { isDocked } = useChatMorph(heroRef, containerRef, suggestedPromptsRef);

  useEffect(() => {
    isDockedRef.current = isDocked;
    if (!isDocked) setIsMinimized(false);
  }, [isDocked]);

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
      gsap.to(containerRef.current, { ...size, duration: 0.3, ease: 'power2.out' });
    }
  }, { dependencies: [isMinimized] });

  return (
    <div
      ref={containerRef}
      data-component="Chat"
      data-docked={isDocked}
      className="z-50 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg"
    >
      <div ref={contentRef} className="relative flex h-full flex-col">
        <SuggestedPrompts ref={suggestedPromptsRef} />
        <ChatMessage />
        <ChatInput />
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
