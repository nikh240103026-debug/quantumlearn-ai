"use client";

import { useEffect, useRef } from "react";

/*
 * A slow, quiet picture of a qubit: a turning Bloch sphere, a state vector
 * that precesses around it, and entangled pairs drifting in mirrored orbits.
 * Decorative only. Stops when the tab is hidden; still for reduced motion.
 */

type Vec = [number, number, number];

const PAIRS = 9;
const TRAIL = 70;

function rotate([x, y, z]: Vec, spin: number, tilt: number): Vec {
  const x1 = x * Math.cos(spin) + z * Math.sin(spin);
  const z1 = -x * Math.sin(spin) + z * Math.cos(spin);
  return [x1, y * Math.cos(tilt) - z1 * Math.sin(tilt), y * Math.sin(tilt) + z1 * Math.cos(tilt)];
}

function draw(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  context.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height * (width < 640 ? 0.27 : 0.4);
  const radius = Math.min(width * 0.32, height * 0.24);
  const spin = time * 0.05;
  const tilt = 0.38;
  const project = (point: Vec) => {
    const [x, y, z] = rotate(point, spin, tilt);
    return { x: cx + x * radius, y: cy - y * radius, z };
  };

  // Soft glow behind the sphere.
  const glow = context.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 2.2);
  glow.addColorStop(0, "rgba(59,130,246,0.16)");
  glow.addColorStop(0.5, "rgba(99,102,241,0.06)");
  glow.addColorStop(1, "rgba(5,7,13,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  // Wireframe: front lines brighter than back lines.
  const curve = (pointAt: (step: number) => Vec, hue: number) => {
    let previous = project(pointAt(0));
    for (let step = 1; step <= 72; step += 1) {
      const next = project(pointAt((step / 72) * Math.PI * 2));
      const depth = (previous.z + next.z) / 2;
      context.strokeStyle = `hsla(${hue}, 90%, 70%, ${0.05 + (depth + 1) * 0.09})`;
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(next.x, next.y);
      context.stroke();
      previous = next;
    }
  };
  context.lineWidth = 1;
  for (const latitude of [-60, -30, 0, 30, 60]) {
    const a = (latitude * Math.PI) / 180;
    curve((t) => [Math.cos(a) * Math.cos(t), Math.sin(a), Math.cos(a) * Math.sin(t)], 220);
  }
  for (let meridian = 0; meridian < 180; meridian += 30) {
    const b = (meridian * Math.PI) / 180;
    curve((t) => [Math.cos(t) * Math.cos(b), Math.sin(t), Math.cos(t) * Math.sin(b)], 250);
  }

  // Poles.
  context.font = "500 13px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.textAlign = "center";
  context.fillStyle = "rgba(191,219,254,0.55)";
  const north = project([0, 1.18, 0]);
  const south = project([0, -1.22, 0]);
  context.fillText("|0⟩", north.x, north.y);
  context.fillText("|1⟩", south.x, south.y + 8);

  // The state vector precesses, and its tip leaves a fading trail.
  const state = (t: number): Vec => {
    const theta = 1.05 + 0.45 * Math.sin(t * 0.11);
    const phi = t * 0.32;
    return [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
  };
  for (let k = TRAIL; k > 0; k -= 1) {
    const a = project(state(time - k * 0.07));
    const b = project(state(time - (k - 1) * 0.07));
    context.strokeStyle = `rgba(167,139,250,${(1 - k / TRAIL) * 0.5})`;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }
  const tip = project(state(time));
  const arrow = context.createLinearGradient(cx, cy, tip.x, tip.y);
  arrow.addColorStop(0, "rgba(96,165,250,0.15)");
  arrow.addColorStop(1, "rgba(147,197,253,0.9)");
  context.strokeStyle = arrow;
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(cx, cy);
  context.lineTo(tip.x, tip.y);
  context.stroke();
  const halo = context.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 18);
  halo.addColorStop(0, "rgba(219,234,254,0.95)");
  halo.addColorStop(0.3, "rgba(96,165,250,0.5)");
  halo.addColorStop(1, "rgba(96,165,250,0)");
  context.fillStyle = halo;
  context.beginPath();
  context.arc(tip.x, tip.y, 18, 0, Math.PI * 2);
  context.fill();

  // Entangled pairs: each particle has a twin on the opposite side.
  for (let i = 0; i < PAIRS; i += 1) {
    const orbit = radius * (1.35 + (i % 4) * 0.28);
    const angle = time * (0.04 + (i % 3) * 0.015) * (i % 2 ? 1 : -1) + i * 1.9;
    const squash = 0.42 + (i % 5) * 0.06;
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.6 + i);
    const dx = Math.cos(angle) * orbit;
    const dy = Math.sin(angle) * orbit * squash;
    const hue = 215 + (i * 17) % 60;
    for (const sign of [1, -1]) {
      const x = cx + dx * sign;
      const y = cy + dy * sign;
      const dot = context.createRadialGradient(x, y, 0, x, y, 7);
      dot.addColorStop(0, `hsla(${hue}, 95%, 80%, ${0.35 + pulse * 0.45})`);
      dot.addColorStop(1, `hsla(${hue}, 95%, 70%, 0)`);
      context.fillStyle = dot;
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fill();
    }
    // A few pairs show their link while they pulse together.
    if (i % 3 === 0) {
      context.strokeStyle = `hsla(${hue}, 90%, 75%, ${pulse * 0.07})`;
      context.lineWidth = 1;
      context.setLineDash([2, 6]);
      context.beginPath();
      context.moveTo(cx + dx, cy + dy);
      context.lineTo(cx - dx, cy - dy);
      context.stroke();
      context.setLineDash([]);
    }
  }
}

export function QuantumField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    const started = performance.now() - 40_000;

    const paint = () => draw(context, width, height, (performance.now() - started) / 1000);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };

    const loop = () => {
      paint();
      frame = window.requestAnimationFrame(loop);
    };
    const visibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden && !still) frame = window.requestAnimationFrame(loop);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    visibility();
    document.addEventListener("visibilitychange", visibility);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none h-full w-full ${className}`} />;
}
