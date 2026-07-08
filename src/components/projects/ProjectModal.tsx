"use client";

import type { ReactNode } from "react";

interface ProjectModalProps {
  children: ReactNode;
  onClose: () => void;
}

export function ProjectModal({ children, onClose }: ProjectModalProps) {
  return (
    <div data-component="ProjectModal">
      {children}
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
