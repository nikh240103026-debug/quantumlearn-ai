"use client";

import {
  Children,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface DashboardRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export function DashboardReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: DashboardRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    direction === "left"
      ? "-translate-x-8"
      : direction === "right"
        ? "translate-x-8"
        : "translate-y-8";

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-900 ease-out",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${hiddenTransform} opacity-0`,
        className,
      ].join(" ")}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface DashboardStaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function DashboardStagger({
  children,
  className = "",
  stagger = 80,
}: DashboardStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children);

  return (
    <div
      ref={ref}
      className={className}
    >
      {items.map((child, index) => (
        <div
          key={index}
          className={[
            "transition-all duration-700 ease-out",
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0",
          ].join(" ")}
          style={
            {
              transitionDelay: `${index * stagger}ms`,
            } satisfies CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}