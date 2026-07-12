"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = ["chat", "projects", "experience", "skills", "contact"] as const;

/* Inline SVGs for social icons not available in this lucide-react version */
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.837a3.837 3.837 0 110-7.674 3.837 3.837 0 010 7.674zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  // Hide header when scrolling down, show when scrolling up.
  // Background is always transparent.
  useEffect(() => {
    let lastScrollY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY || currentY < 80);
      lastScrollY = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      // The chat panel is vertically centered within Hero (a tall section),
      // so scrollIntoView's default top-alignment overshoots -- stop 100px
      // short so some of Hero stays visible above it instead of landing
      // right at the bottom edge.
      const offset = id === "chat" ? 100 : 0;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setNavOpen(false);
  }

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full transition-transform duration-300 bg-background"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        borderBottom: visible ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-default select-none">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="7" fill="var(--color-surface-0)" />
            <path
              d="M8 18.5 L16 9.5 L24 18.5"
              fill="none"
              stroke="var(--color-primary-100)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 24.5 H21.5"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-xl font-bold tracking-tight font-heading text-primary">
            ABK
            <span className="text-xs ml-1.5 font-medium text-muted-foreground">
              dev
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((s) => (
            <button
              key={s}
              id={`nav-${s}`}
              onClick={() => scrollTo(s)}
              className="nav-link text-sm font-medium capitalize text-muted-foreground bg-transparent border-none cursor-pointer"
            >
              {s}
            </button>
          ))}
        </nav>

        {/* Social + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/aberkayk"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href="https://linkedin.com/in/ahmetberkaykocak"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <LinkedinIcon size={18} />
          </a>
          <a
            href="https://instagram.com/ahmettkocak"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <InstagramIcon size={18} />
          </a>
          <a
            href="/cv-ahmet-berkay-kocak.pdf"
            download
            className="px-4 py-2 rounded-[10px] text-sm font-semibold font-heading text-foreground border border-border hover:bg-[color-mix(in_oklab,var(--color-foreground)_8%,transparent)] transition-colors duration-200"
          >
            Download CV
          </a>
        </div>

        {/* Mobile menu */}
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger
            render={
              <button
                id="mobile-menu-toggle"
                className="md:hidden bg-transparent border-none text-foreground cursor-pointer"
                aria-label="Toggle menu"
              />
            }
          >
            <Menu size={22} />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((s) => (
                <SheetClose
                  key={s}
                  render={
                    <button
                      onClick={() => scrollTo(s)}
                      className="text-sm font-medium capitalize text-left py-2.5 text-muted-foreground bg-transparent border-none cursor-pointer hover:text-primary transition-colors duration-200"
                    />
                  }
                >
                  {s}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
