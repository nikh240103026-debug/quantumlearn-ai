"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  hue: number;
};

type Pulse = {
  a: number;
  b: number;
  t: number;
};

/**
 * Animated "entanglement field": drifting qubit nodes linked by faint
 * bonds, with photons travelling along random bonds. Nodes lean toward
 * the pointer. Pauses when off-screen or the tab is hidden, caps DPR,
 * and draws a single static frame for reduced-motion users.
 */
export function QuantumField({
  className = "",
  density = 1,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };
    const linkDistance = 150;

    function seed() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(
        Math.min(110, Math.max(28, (width * height) / 14000)) * density,
      );

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.6 ? 217 : Math.random() < 0.5 ? 258 : 189,
      }));
      pulses = [];
    }

    function step(time: number) {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        if (!reduced) {
          if (pointer.active) {
            const dx = pointer.x - node.x;
            const dy = pointer.y - node.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 220 && dist > 1) {
              node.vx += (dx / dist) * 0.012;
              node.vy += (dy / dist) * 0.012;
            }
          }

          node.vx *= 0.985;
          node.vy *= 0.985;
          node.vx += (Math.random() - 0.5) * 0.01;
          node.vy += (Math.random() - 0.5) * 0.01;
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }
      }

      // Bonds
      const bonds: Array<[number, number]> = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDistance) {
            bonds.push([i, j]);
            const alpha = (1 - dist / linkDistance) * 0.22;
            ctx.strokeStyle = `rgba(129, 160, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Photons travelling along bonds
      if (!reduced && bonds.length && pulses.length < 7 && Math.random() < 0.05) {
        const [a, b] = bonds[Math.floor(Math.random() * bonds.length)];
        pulses.push({ a, b, t: 0 });
      }

      pulses = pulses.filter((pulse) => {
        pulse.t += 0.018;
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        if (!a || !b || pulse.t >= 1) return false;
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, "rgba(125, 211, 252, 0.9)");
        glow.addColorStop(1, "rgba(125, 211, 252, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Nodes
      for (const node of nodes) {
        const twinkle = reduced
          ? 0.8
          : 0.55 + 0.45 * Math.sin(time / 900 + node.phase);
        ctx.fillStyle = `hsla(${node.hue}, 90%, 72%, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && visible) {
        raf = requestAnimationFrame(step);
      }
    }

    function start() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    }

    seed();
    start();

    const resizeObserver = new ResizeObserver(() => {
      seed();
      start();
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !wasVisible) start();
    });
    intersection.observe(canvas);

    function onVisibility() {
      const wasVisible = visible;
      visible = !document.hidden;
      if (visible && !wasVisible) start();
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
}
