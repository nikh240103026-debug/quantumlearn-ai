"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed animated quantum circuit used as the hero background.
 *
 * - Qubit wires flow across the scene with gates on a slow conveyor.
 * - Photons race along the wires; gates flash when hit and two-qubit
 *   gates fire a pulse across to their partner wire.
 * - A Bloch sphere "core" spins on the right with orbiting electrons.
 * - Hover: wires ripple around the cursor, the scene shifts in
 *   parallax, nearby gates swell and show their name, and the Bloch
 *   vector turns toward the cursor.
 *
 * Pauses off-screen / in hidden tabs; draws one still frame for
 * reduced-motion users.
 */

type GateType = "H" | "X" | "Y" | "Z" | "S" | "T" | "RY" | "M" | "CX" | "CZ" | "SWAP";

type Gate = {
  x: number;
  wire: number;
  type: GateType;
  target?: number;
  flash: number;
  targetFlash: number;
  hover: number;
};

type Pulse = { wire: number; x: number; speed: number; color: string; hits: Set<Gate> };
type LinkPulse = { x: number; from: number; to: number; t: number; color: string; gate: Gate };

const INFO: Record<GateType, { glyph: string; label: string; rgb: string }> = {
  H: { glyph: "H", label: "Hadamard — creates superposition", rgb: "96,165,250" },
  X: { glyph: "X", label: "Pauli-X — the quantum NOT", rgb: "167,139,250" },
  Y: { glyph: "Y", label: "Pauli-Y — bit and phase flip", rgb: "167,139,250" },
  Z: { glyph: "Z", label: "Pauli-Z — phase flip", rgb: "167,139,250" },
  S: { glyph: "S", label: "S — quarter-turn of phase", rgb: "34,211,238" },
  T: { glyph: "T", label: "T — eighth-turn of phase", rgb: "34,211,238" },
  RY: { glyph: "Ry", label: "RY(θ) — rotate about the Y axis", rgb: "251,191,36" },
  M: { glyph: "", label: "Measure — collapses to 0 or 1", rgb: "52,211,153" },
  CX: { glyph: "", label: "CNOT — entangles two qubits", rgb: "96,165,250" },
  CZ: { glyph: "", label: "CZ — controlled phase flip", rgb: "244,114,182" },
  SWAP: { glyph: "", label: "SWAP — exchanges two qubits", rgb: "34,211,238" },
};

const SINGLE: GateType[] = ["H", "H", "X", "Y", "Z", "S", "T", "RY", "H", "M"];
const PULSE_COLORS = ["125,211,252", "167,139,250", "96,165,250", "103,232,249"];

export function QuantumCircuitField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let wiresY: number[] = [];
    let depth: number[] = [];
    let gates: Gate[] = [];
    let pulses: Pulse[] = [];
    let links: LinkPulse[] = [];
    let readout: Array<{ bit: number; flash: number }> = [];
    let period = 0;
    let scroll = 0;
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    const trail: Array<{ x: number; y: number }> = [];

    const pointer = { x: -9999, y: -9999, active: false };
    const smooth = { x: 0, y: 0 };
    let rippleStrength = 0;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(5, Math.min(8, Math.round(H / 105)));
      const top = H * 0.14;
      const bottom = H * 0.9;
      wiresY = Array.from({ length: count }, (_, i) => top + ((bottom - top) * i) / (count - 1));
      depth = wiresY.map((_, i) => 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.4)));
      readout = wiresY.map(() => ({ bit: Math.random() < 0.5 ? 0 : 1, flash: 0 }));

      period = W + 420;
      const spacing = W < 700 ? 150 : 112;
      gates = [];
      for (let x = 0; x < period; x += spacing) {
        const used = new Set<number>();
        if (Math.random() < 0.38 && count > 1) {
          const a = Math.floor(rand(0, count - 1));
          const b = Math.min(count - 1, a + 1 + Math.floor(rand(0, Math.min(2, count - 1 - a))));
          const type: GateType = Math.random() < 0.6 ? "CX" : Math.random() < 0.5 ? "CZ" : "SWAP";
          gates.push({ x: x + rand(-14, 14), wire: a, target: b, type, flash: 0, targetFlash: 0, hover: 0 });
          for (let w = a; w <= b; w++) used.add(w);
        }
        const singles = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < singles; k++) {
          const wire = Math.floor(rand(0, count));
          if (used.has(wire)) continue;
          used.add(wire);
          gates.push({
            x: x + rand(-18, 18),
            wire,
            type: SINGLE[Math.floor(Math.random() * SINGLE.length)],
            flash: 0,
            targetFlash: 0,
            hover: 0,
          });
        }
      }
      pulses = [];
      links = [];
    }

    // --- geometry ---------------------------------------------------------
    function parallax(d: number) {
      const ox = W ? (smooth.x - W / 2) / W : 0;
      const oy = H ? (smooth.y - H / 2) / H : 0;
      return { dx: -ox * 36 * d, dy: -oy * 20 * d };
    }

    function ripple(x: number, y: number) {
      if (rippleStrength < 0.01) return 0;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const g = Math.exp(-(dx * dx + dy * dy) / (2 * 130 * 130));
      return 16 * rippleStrength * g * Math.sin(dx * 0.045 - time * 5);
    }

    function wireY(i: number, x: number) {
      const { dy } = parallax(depth[i]);
      const base = wiresY[i] + dy;
      return base + ripple(x, base);
    }

    function gateX(g: Gate) {
      const { dx } = parallax(depth[g.wire]);
      return ((((g.x - scroll) % period) + period) % period) - 210 + dx;
    }

    function sphere() {
      const narrow = W < 900;
      const R = narrow ? Math.max(70, Math.min(W, H) * 0.16) : Math.max(120, Math.min(W * 0.17, H * 0.3, 250));
      const cx = narrow ? W * 0.76 : W * 0.74;
      const cy = narrow ? H * 0.8 : H * 0.47;
      const { dx, dy } = parallax(1.4);
      return { cx: cx + dx, cy: cy + dy, R, alpha: narrow ? 0.45 : 1 };
    }

    // --- drawing helpers --------------------------------------------------
    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function glow(rgb: string, amount: number) {
      if (amount > 0.04) {
        ctx.shadowColor = `rgba(${rgb},0.95)`;
        ctx.shadowBlur = 6 + amount * 34;
      } else {
        ctx.shadowBlur = 0;
      }
    }

    function drawWires() {
      for (let i = 0; i < wiresY.length; i++) {
        const d = depth[i];
        const gradient = ctx.createLinearGradient(0, 0, W, 0);
        gradient.addColorStop(0, "rgba(148,163,255,0)");
        gradient.addColorStop(0.12, `rgba(148,163,255,${0.32 * d})`);
        gradient.addColorStop(0.88, `rgba(148,163,255,${0.32 * d})`);
        gradient.addColorStop(1, "rgba(148,163,255,0)");

        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += 10) {
          const y = wireY(i, x);
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.1 + d * 0.5;
        ctx.stroke();

        // soft halo
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // qubit label
        ctx.fillStyle = `rgba(191,219,254,${0.35 * d})`;
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(`q${i} |0⟩`, 14, wiresY[i] + parallax(d).dy - 8);
      }
    }

    function drawGate(g: Gate, sx: number, hoverAmt: number) {
      const info = INFO[g.type];
      const d = depth[g.wire];
      const energy = Math.max(g.flash, hoverAmt);
      const y = wireY(g.wire, sx);

      if (g.type === "CX" || g.type === "CZ" || g.type === "SWAP") {
        const t = g.target ?? g.wire;
        const ty = wireY(t, sx);
        const tEnergy = Math.max(g.targetFlash, hoverAmt);

        ctx.strokeStyle = `rgba(${info.rgb},${0.45 + 0.55 * energy})`;
        ctx.lineWidth = 1.5 + energy;
        glow(info.rgb, energy);
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx, ty);
        ctx.stroke();

        const dot = (yy: number, e: number) => {
          glow(info.rgb, e);
          ctx.fillStyle = `rgba(${info.rgb},${0.75 + 0.25 * e})`;
          ctx.beginPath();
          ctx.arc(sx, yy, 5 + e * 3, 0, Math.PI * 2);
          ctx.fill();
        };
        const cross = (yy: number, e: number) => {
          const s = 7 + e * 3;
          glow(info.rgb, e);
          ctx.strokeStyle = `rgba(${info.rgb},${0.8 + 0.2 * e})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx - s, yy - s);
          ctx.lineTo(sx + s, yy + s);
          ctx.moveTo(sx + s, yy - s);
          ctx.lineTo(sx - s, yy + s);
          ctx.stroke();
        };

        if (g.type === "CX") {
          dot(y, energy);
          const r = (13 + tEnergy * 5) * (0.8 + 0.2 * d);
          glow(info.rgb, tEnergy);
          ctx.fillStyle = "rgba(8,11,20,0.9)";
          ctx.beginPath();
          ctx.arc(sx, ty, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(${info.rgb},${0.7 + 0.3 * tEnergy})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx - r * 0.6, ty);
          ctx.lineTo(sx + r * 0.6, ty);
          ctx.moveTo(sx, ty - r * 0.6);
          ctx.lineTo(sx, ty + r * 0.6);
          ctx.stroke();
        } else if (g.type === "CZ") {
          dot(y, energy);
          dot(ty, tEnergy);
        } else {
          cross(y, energy);
          cross(ty, tEnergy);
        }
        ctx.shadowBlur = 0;
        return;
      }

      const size = 30 * (0.75 + 0.25 * d) * (1 + 0.32 * hoverAmt + 0.12 * g.flash);
      glow(info.rgb, energy);
      roundRect(sx - size / 2, y - size / 2, size, size, 7);
      ctx.fillStyle = `rgba(9,13,24,${0.88})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${info.rgb},${0.4 + 0.6 * energy})`;
      ctx.lineWidth = 1.3 + energy;
      ctx.stroke();

      // inner tint
      roundRect(sx - size / 2, y - size / 2, size, size, 7);
      ctx.fillStyle = `rgba(${info.rgb},${0.08 + 0.22 * energy})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (g.type === "M") {
        ctx.strokeStyle = `rgba(${info.rgb},${0.7 + 0.3 * energy})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sx, y + size * 0.18, size * 0.28, Math.PI, 0);
        ctx.stroke();
        const angle = Math.PI * (1.25 + 0.5 * (0.5 + 0.5 * Math.sin(time * 3 + g.x)));
        ctx.beginPath();
        ctx.moveTo(sx, y + size * 0.18);
        ctx.lineTo(sx + Math.cos(angle) * size * 0.32, y + size * 0.18 + Math.sin(angle) * size * 0.32);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${0.75 + 0.25 * energy})`;
        ctx.font = `600 ${Math.round(size * 0.42)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(info.glyph, sx, y + 1);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      }
    }

    function drawSphere() {
      const { cx, cy, R, alpha } = sphere();
      ctx.save();
      ctx.globalAlpha = alpha;

      // backing so wires pass "behind" the sphere
      const backing = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.45);
      backing.addColorStop(0, "rgba(5,7,13,0.96)");
      backing.addColorStop(0.7, "rgba(5,7,13,0.75)");
      backing.addColorStop(1, "rgba(5,7,13,0)");
      ctx.fillStyle = backing;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // halo
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.6);
      halo.addColorStop(0, "rgba(59,130,246,0)");
      halo.addColorStop(0.55, "rgba(59,130,246,0.10)");
      halo.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const tilt = 0.32;

      // outline
      ctx.strokeStyle = "rgba(191,219,254,0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // latitudes
      for (const lat of [-0.55, 0, 0.55]) {
        const ry = R * Math.cos(Math.asin(lat)) * Math.sin(tilt);
        const rx = R * Math.cos(Math.asin(lat));
        ctx.strokeStyle = lat === 0 ? "rgba(147,197,253,0.5)" : "rgba(147,197,253,0.18)";
        ctx.setLineDash(lat === 0 ? [] : [3, 6]);
        ctx.beginPath();
        ctx.ellipse(cx, cy - lat * R * Math.cos(tilt), rx, Math.max(1, ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // spinning meridians
      for (let k = 0; k < 4; k++) {
        const phase = time * 0.35 + (k * Math.PI) / 4;
        const rx = Math.abs(Math.cos(phase)) * R;
        ctx.strokeStyle = `rgba(167,139,250,${0.12 + 0.18 * Math.abs(Math.cos(phase))})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, rx), R, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // axis + labels
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 1.12);
      ctx.lineTo(cx, cy + R * 1.12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(191,219,254,0.6)";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("|0⟩", cx, cy - R * 1.17);
      ctx.fillText("|1⟩", cx, cy + R * 1.25);

      // state vector: precesses, leans toward the cursor when near
      let theta = 1.05 + 0.55 * Math.sin(time * 0.45);
      let phi = time * 0.7;
      const mdx = pointer.x - cx;
      const mdy = pointer.y - cy;
      const md = Math.hypot(mdx, mdy);
      if (pointer.active && md < R * 2.4) {
        const pull = Math.max(0, 1 - md / (R * 2.4));
        const targetTheta = Math.min(Math.PI - 0.15, Math.max(0.15, Math.acos(Math.max(-1, Math.min(1, -mdy / Math.max(md, 1))))));
        const targetPhi = mdx >= 0 ? 0 : Math.PI;
        theta = theta + (targetTheta - theta) * pull;
        phi = phi + (targetPhi - (phi % (Math.PI * 2))) * pull * 0.6;
      }
      const X = Math.sin(theta) * Math.cos(phi);
      const Y = Math.sin(theta) * Math.sin(phi);
      const Z = Math.cos(theta);
      const px = cx + R * X;
      const py = cy - R * (Z * Math.cos(tilt) - Y * Math.sin(tilt));

      trail.push({ x: px, y: py });
      if (trail.length > 46) trail.shift();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        ctx.strokeStyle = `rgba(167,139,250,${a * 0.5})`;
        ctx.lineWidth = 2.4 * a;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }

      const vec = ctx.createLinearGradient(cx, cy, px, py);
      vec.addColorStop(0, "rgba(96,165,250,0.4)");
      vec.addColorStop(1, "rgba(196,181,253,1)");
      ctx.strokeStyle = vec;
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(167,139,250,0.9)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.fillStyle = "#ede9fe";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const head = ctx.createRadialGradient(px, py, 0, px, py, 26);
      head.addColorStop(0, "rgba(196,181,253,0.55)");
      head.addColorStop(1, "rgba(196,181,253,0)");
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(px, py, 26, 0, Math.PI * 2);
      ctx.fill();

      // core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22);
      core.addColorStop(0, "rgba(255,255,255,0.95)");
      core.addColorStop(0.35, "rgba(147,197,253,0.6)");
      core.addColorStop(1, "rgba(99,102,241,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.22 * (1 + 0.08 * Math.sin(time * 2.2)), 0, Math.PI * 2);
      ctx.fill();

      // orbiting electrons
      const orbits = [
        { rx: R * 1.32, ry: R * 0.38, rot: 0.35, speed: 0.9, rgb: "125,211,252" },
        { rx: R * 1.32, ry: R * 0.38, rot: -0.75, speed: -0.65, rgb: "196,181,253" },
      ];
      for (const orbit of orbits) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(orbit.rot);
        ctx.strokeStyle = `rgba(${orbit.rgb},0.22)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let e = 0; e < 2; e++) {
          const a = time * orbit.speed + e * Math.PI;
          const ex = Math.cos(a) * orbit.rx;
          const ey = Math.sin(a) * orbit.ry;
          const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
          g.addColorStop(0, `rgba(${orbit.rgb},1)`);
          g.addColorStop(1, `rgba(${orbit.rgb},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ex, ey, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.textAlign = "start";
      ctx.restore();
    }

    function drawTooltip(g: Gate, sx: number) {
      const info = INFO[g.type];
      const y = wireY(g.wire, sx);
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      const text = info.label;
      const w = ctx.measureText(text).width + 22;
      let x = sx + 22;
      if (x + w > W - 10) x = sx - 22 - w;
      const ty = y - 44;
      ctx.fillStyle = "rgba(8,11,20,0.92)";
      ctx.strokeStyle = `rgba(${info.rgb},0.7)`;
      ctx.lineWidth = 1;
      roundRect(x, ty, w, 26, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(text, x + 11, ty + 17);
    }

    // --- simulation step --------------------------------------------------
    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) {
        time += dt;
        scroll += dt * 24;
      }

      smooth.x += ((pointer.active ? pointer.x : W / 2) - smooth.x) * Math.min(1, dt * 4);
      smooth.y += ((pointer.active ? pointer.y : H / 2) - smooth.y) * Math.min(1, dt * 4);
      rippleStrength += ((pointer.active ? 1 : 0) - rippleStrength) * Math.min(1, dt * 3);

      ctx.clearRect(0, 0, W, H);
      drawWires();

      // spawn photons
      if (!reduced && Math.random() < dt * 2.6 * Math.max(0.6, W / 1440)) {
        pulses.push({
          wire: Math.floor(Math.random() * wiresY.length),
          x: -40,
          speed: rand(220, 380),
          color: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)],
          hits: new Set(),
        });
      }

      // gates + hover detection
      let nearest: { g: Gate; sx: number; d: number } | null = null;
      for (const g of gates) {
        const sx = gateX(g);
        if (sx < -60 || sx > W + 60) continue;
        const gy = wireY(g.wire, sx);
        let dist = Math.hypot(pointer.x - sx, pointer.y - gy);
        if (g.target !== undefined) {
          const ty = wireY(g.target, sx);
          dist = Math.min(dist, Math.hypot(pointer.x - sx, pointer.y - ty), Math.abs(pointer.x - sx) + (pointer.y > Math.min(gy, ty) && pointer.y < Math.max(gy, ty) ? 0 : 999));
        }
        const target = pointer.active ? Math.max(0, 1 - dist / 120) : 0;
        g.hover += (target - g.hover) * Math.min(1, dt * 10);
        g.flash *= Math.exp(-dt * 3.2);
        g.targetFlash *= Math.exp(-dt * 3.2);
        if (pointer.active && dist < 40 && (!nearest || dist < nearest.d)) nearest = { g, sx, d: dist };
        drawGate(g, sx, g.hover);
      }

      // links between wires (CNOT / CZ / SWAP firing)
      ctx.globalCompositeOperation = "lighter";
      links = links.filter((link) => {
        link.t += dt * 2.8;
        const sx = gateX(link.gate);
        const y0 = wireY(link.from, sx);
        const y1 = wireY(link.to, sx);
        const y = y0 + (y1 - y0) * Math.min(1, link.t);
        const g = ctx.createRadialGradient(sx, y, 0, sx, y, 14);
        g.addColorStop(0, `rgba(${link.color},1)`);
        g.addColorStop(1, `rgba(${link.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, y, 14, 0, Math.PI * 2);
        ctx.fill();
        if (link.t >= 1) {
          link.gate.targetFlash = 1;
          pulses.push({ wire: link.to, x: sx + 4, speed: rand(240, 360), color: link.color, hits: new Set([link.gate]) });
          return false;
        }
        return true;
      });

      // photons
      pulses = pulses.filter((p) => {
        p.x += p.speed * dt;
        const y = wireY(p.wire, p.x);

        const tail = ctx.createLinearGradient(p.x - 110, y, p.x, y);
        tail.addColorStop(0, `rgba(${p.color},0)`);
        tail.addColorStop(1, `rgba(${p.color},0.9)`);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(p.x - 110, wireY(p.wire, p.x - 110));
        ctx.lineTo(p.x - 55, wireY(p.wire, p.x - 55));
        ctx.lineTo(p.x, y);
        ctx.stroke();

        const head = ctx.createRadialGradient(p.x, y, 0, p.x, y, 13);
        head.addColorStop(0, "rgba(255,255,255,1)");
        head.addColorStop(0.3, `rgba(${p.color},0.9)`);
        head.addColorStop(1, `rgba(${p.color},0)`);
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(p.x, y, 13, 0, Math.PI * 2);
        ctx.fill();

        for (const g of gates) {
          if (p.hits.has(g)) continue;
          const onWire = g.wire === p.wire || g.target === p.wire;
          if (!onWire) continue;
          const sx = gateX(g);
          if (Math.abs(sx - p.x) < 10) {
            p.hits.add(g);
            if (g.wire === p.wire) g.flash = 1;
            else g.targetFlash = 1;
            if (g.target !== undefined && g.wire === p.wire) {
              links.push({ x: sx, from: g.wire, to: g.target, t: 0, color: INFO[g.type].rgb, gate: g });
            }
          }
        }

        if (p.x > W - 40 && p.x - p.speed * dt <= W - 40) {
          readout[p.wire] = { bit: Math.random() < 0.5 ? 0 : 1, flash: 1 };
        }
        return p.x < W + 140;
      });
      ctx.globalCompositeOperation = "source-over";

      // classical read-out bits at the right edge
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      for (let i = 0; i < wiresY.length; i++) {
        const r = readout[i];
        r.flash *= Math.exp(-dt * 2.5);
        const y = wireY(i, W - 26);
        glow("52,211,153", r.flash);
        ctx.fillStyle = `rgba(110,231,183,${0.3 + 0.7 * r.flash})`;
        ctx.fillText(String(r.bit), W - 26, y + 4.5);
      }
      ctx.shadowBlur = 0;
      ctx.textAlign = "start";

      drawSphere();

      // cursor glow
      if (pointer.active) {
        ctx.globalCompositeOperation = "lighter";
        const c = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 170);
        c.addColorStop(0, "rgba(96,165,250,0.16)");
        c.addColorStop(1, "rgba(96,165,250,0)");
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      if (nearest && nearest.g.hover > 0.5) drawTooltip(nearest.g, nearest.sx);

      if (!reduced && visible) raf = requestAnimationFrame(step);
    }

    function start() {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(step);
    }

    layout();
    smooth.x = W / 2;
    smooth.y = H / 2;
    start();

    const resizeObserver = new ResizeObserver(() => {
      layout();
      start();
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !was) start();
    });
    intersection.observe(canvas);

    const onVisibility = () => {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was) start();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
      if (reduced) start();
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

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
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none h-full w-full ${className}`} />;
}
