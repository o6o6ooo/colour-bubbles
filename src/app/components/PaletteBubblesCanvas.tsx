"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PaletteColor } from "@/data/palette";

type Bubble = {
  id: string;
  hex: string;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function normHex(hex: string) {
  const h = hex.trim();
  return h.startsWith("#") ? h : `#${h}`;
}

function isLight(hex: string) {
  // quick luminance check for text color
  const h = normHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.72;
}

export default function PaletteBubblesCanvas({
  colors,
}: {
  colors: PaletteColor[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [selected, setSelected] = useState<PaletteColor | null>(null);
  const [copied, setCopied] = useState(false);

  // Pointer state
  const pointerRef = useRef({
    x: 0,
    y: 0,
    inside: false,
    down: false,
  });

  // internal sim state
  const bubblesRef = useRef<Bubble[]>([]);
  const hoverIdRef = useRef<string | null>(null);

  const palette = useMemo(() => {
    // normalize hex upfront
    return colors.map((c) => ({ ...c, hex: normHex(c.hex) }));
  }, [colors]);

  // create / reset bubbles when palette changes or on first mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Re-seed bubbles
      const w = canvas.width;
      const h = canvas.height;

      const baseR = clamp(Math.min(w, h) * 0.045, 18 * dpr, 42 * dpr);
      const spread = Math.min(w, h) * 0.18;

      bubblesRef.current = palette.map((c, idx) => {
        const angle = (idx / Math.max(1, palette.length)) * Math.PI * 2;
        const cx = w * 0.5 + Math.cos(angle) * spread;
        const cy = h * 0.45 + Math.sin(angle) * spread;

        // vary radius a bit
        const r = baseR * (0.85 + (idx % 7) * 0.04);

        return {
          id: `${c.group}-${c.hex}-${idx}`,
          hex: c.hex,
          group: c.group,
          x: cx + (Math.random() - 0.5) * spread * 0.35,
          y: cy + (Math.random() - 0.5) * spread * 0.35,
          vx: (Math.random() - 0.5) * 0.6 * dpr,
          vy: (Math.random() - 0.5) * 0.6 * dpr,
          r,
        };
      });
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement!);

    return () => ro.disconnect();
  }, [palette]);

  // main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const getPointer = () => pointerRef.current;

    const step = () => {
      const w = canvas.width;
      const h = canvas.height;

      const bubbles = bubblesRef.current;

      // --- find hover bubble
      const p = getPointer();
      let hoverId: string | null = null;

      if (p.inside) {
        // brute force is ok for small N
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          const dx = p.x - b.x;
          const dy = p.y - b.y;
          if (dx * dx + dy * dy <= b.r * b.r) {
            hoverId = b.id;
            break;
          }
        }
      }
      hoverIdRef.current = hoverId;

      // --- physics
      const centerX = w * 0.5;
      const centerY = h * 0.5;

      const damping = 0.985;
      const repulseStrength = 0.75; // bubble-to-bubble
      const boundaryPush = 0.8;
      const hoverBoost = 1.12; // radius multiplier on hover (visual + collision)
      const settleToCenter = 0.0008; // gentle gravity to center

      // pairwise collision resolution
      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i];
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];

          const ar = a.id === hoverId ? a.r * hoverBoost : a.r;
          const br = b.id === hoverId ? b.r * hoverBoost : b.r;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = ar + br;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // push apart
            const push = overlap * repulseStrength;
            a.x -= nx * push * 0.5;
            a.y -= ny * push * 0.5;
            b.x += nx * push * 0.5;
            b.y += ny * push * 0.5;

            // add a little velocity
            a.vx -= nx * push * 0.02;
            a.vy -= ny * push * 0.02;
            b.vx += nx * push * 0.02;
            b.vy += ny * push * 0.02;
          }
        }
      }

      // integrate + boundary + gentle centering
      for (const b of bubbles) {
        // mild drift to center so they look "composed"
        b.vx += (centerX - b.x) * settleToCenter;
        b.vy += (centerY - b.y) * settleToCenter;

        b.x += b.vx;
        b.y += b.vy;

        b.vx *= damping;
        b.vy *= damping;

        const r = b.id === hoverId ? b.r * hoverBoost : b.r;

        // boundary push
        if (b.x - r < 0) {
          b.x = r;
          b.vx = Math.abs(b.vx) * boundaryPush;
        } else if (b.x + r > w) {
          b.x = w - r;
          b.vx = -Math.abs(b.vx) * boundaryPush;
        }

        if (b.y - r < 0) {
          b.y = r;
          b.vy = Math.abs(b.vy) * boundaryPush;
        } else if (b.y + r > h) {
          b.y = h - r;
          b.vy = -Math.abs(b.vy) * boundaryPush;
        }
      }

      // --- draw
      ctx.clearRect(0, 0, w, h);

      // background is white (canvas defaults transparent; container is white)
      // draw bubbles
      for (const b of bubbles) {
        const hover = b.id === hoverId;
        const r = hover ? b.r * hoverBoost : b.r;

        // subtle shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.closePath();

        ctx.shadowBlur = 18 * dpr;
        ctx.shadowColor = "rgba(0,0,0,0.06)";
        ctx.fillStyle = b.hex;
        ctx.fill();

        // thin border to help light colors
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.25 * dpr;
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.stroke();

        // tiny label on hover (optional, minimal)
        if (hover) {
          const text = b.hex.toUpperCase();
          ctx.font = `${12 * dpr}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
          ctx.fillStyle = isLight(b.hex) ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.75)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, b.x, b.y);
        }

        ctx.restore();
      }

      // --- selected panel (Canvas内表示)
      if (selected) {
        const pad = 18 * dpr;
        const panelW = Math.min(360 * dpr, w - pad * 2);
        const panelH = 140 * dpr;

        const x = pad;
        const y = h - panelH - pad;

        // panel bg
        ctx.save();
        ctx.shadowBlur = 22 * dpr;
        ctx.shadowColor = "rgba(0,0,0,0.10)";
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        roundRect(ctx, x, y, panelW, panelH, 18 * dpr);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1 * dpr;
        roundRect(ctx, x, y, panelW, panelH, 18 * dpr);
        ctx.stroke();

        // swatch
        const sw = 44 * dpr;
        const sx = x + 18 * dpr;
        const sy = y + 18 * dpr;
        ctx.fillStyle = selected.hex.toUpperCase();
        ctx.beginPath();
        ctx.arc(sx + sw / 2, sy + sw / 2, sw / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.10)";
        ctx.stroke();

        // text
        const tx = sx + sw + 14 * dpr;
        ctx.fillStyle = "rgba(0,0,0,0.82)";
        ctx.font = `${14 * dpr}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(selected.group, tx, sy);

        ctx.font = `600 ${18 * dpr}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.fillText(selected.hex.toUpperCase(), tx, sy + 26 * dpr);

        // "Copy" button (visual only; actual click handled below via DOM overlay button)
        // We draw the button but use a real HTML button positioned over it for accessibility.
        ctx.restore();

        // We position an HTML overlay button via state below (see JSX)
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selected]);

  // Pointer handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    const toCanvasXY = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      return { x, y };
    };

    const onMove = (e: PointerEvent) => {
      const { x, y } = toCanvasXY(e);
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.inside = true;
    };

    const onLeave = () => {
      pointerRef.current.inside = false;
    };

    const onDown = () => {
      pointerRef.current.down = true;
    };

    const onUp = (e: PointerEvent) => {
      pointerRef.current.down = false;

      // click select
      const { x, y } = toCanvasXY(e);
      const bubbles = bubblesRef.current;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = x - b.x;
        const dy = y - b.y;
        if (dx * dx + dy * dy <= b.r * b.r * 1.2) {
          setSelected({ hex: b.hex, group: b.group });
          setCopied(false);
          return;
        }
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, []);

  const copyHex = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.hex.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore; could show fallback UI if you want
    }
  };

  return (
    <div className="relative w-full h-[78vh] min-h-[520px] rounded-3xl bg-white border border-black/10 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HTML overlay for the “Copy” button (accessible) */}
      {selected && (
        <div className="absolute left-6 bottom-6">
          <button
            onClick={copyHex}
            className="px-4 py-2 rounded-full border border-black/10 bg-white/90 backdrop-blur text-sm font-medium shadow-sm hover:shadow transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* small hint */}
      <div className="absolute right-5 top-5 text-xs text-black/45 select-none">
        Hover to peek · Click to pin & copy
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
