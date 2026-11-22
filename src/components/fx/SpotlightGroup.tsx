"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";

/**
 * Tracks the pointer and writes --mx / --my onto every `.ql-spotlight`
 * descendant so their gradient glow follows the cursor, even across
 * neighbouring cards. One listener for the whole group.
 */
export function SpotlightGroup({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const { clientX, clientY } = event;

    if (frame.current !== null) cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      const root = ref.current;
      if (!root) return;

      root.querySelectorAll<HTMLElement>(".ql-spotlight").forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${clientX - rect.left}px`);
        card.style.setProperty("--my", `${clientY - rect.top}px`);
      });
    });
  }

  return (
    <div
      ref={ref}
      data-spotlight=""
      onPointerMove={handlePointerMove}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
