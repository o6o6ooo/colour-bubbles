"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PaletteColor } from "@/data/palette";

type Bubble = {
  id: string;
  hex: string;
  group: string;
  isWhite?: boolean;
  pulse: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rTarget: number;
};

type Rect = { x: number; y: number; w: number; h: number };

function normHex(hex: string) {
  const h = hex.trim();
  return h.startsWith("#") ? h.toUpperCase() : `#${h.toUpperCase()}`;
}

function isLight(hex: string) {
  const h = normHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.7;
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

export default function PaletteBubblesCanvas({ colors }: { colors: PaletteColor[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ikea-bubblesと同じ：stateで持たずrefで持つ（effect再実行を避ける）
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const darkRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);

  // selected時だけCopyピルの当たり判定を保存
  const copyHitRef = useRef<{ bubbleId: string; rect: Rect } | null>(null);

  const palette = useMemo(
    () => colors.map((c) => ({ ...c, hex: normHex(c.hex) })),
    [colors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // alpha:false で地味に安定（ikea-bubbles踏襲）
    const ctx = canvas.getContext("2d", { alpha: false });

    // システムダークモード監視
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    darkRef.current = mql.matches;

    const handleSchemeChange = (e: MediaQueryListEvent) => {
      darkRef.current = e.matches;
    };

    mql.addEventListener("change", handleSchemeChange);

    if (!ctx) return;

    let rafId = 0;

    const setupCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // ✅ 物理はCSSピクセル基準で描く（dprはtransformで吸収）
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initBubbles = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      const cx = cw / 2;
      const cy = ch / 2;

      const spread = Math.min(cw, ch) * 0.18;
      const baseR = 40;

      const bubbles: Bubble[] = palette.map((c, idx) => ({
        id: `${c.group}-${c.hex}-${idx}`,
        hex: c.hex,
        group: c.group,
        isWhite: c.isWhite,
        pulse: 0,
        x: cx + (Math.random() - 0.5) * spread * 2,
        y: cy + (Math.random() - 0.5) * spread * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: baseR,
        rTarget: baseR,
      }));

      bubblesRef.current = bubbles;
    };

    const applyRepulsion = (cw: number, ch: number) => {
      // ikea-bubblesと同じパラメータ
      const padding = 2;
      const strength = 0.35;

      const bubbles = bubblesRef.current;

      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i];

        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;

          const minDist = a.rTarget + b.rTarget + padding;

          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;

            const overlap = minDist - dist;

            const push = overlap * 0.5 * strength;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;

            const vpush = overlap * 0.0008 * strength;
            a.vx -= nx * vpush;
            a.vy -= ny * vpush;
            b.vx += nx * vpush;
            b.vy += ny * vpush;
          }
        }

        // clamp
        a.x = Math.max(a.r, Math.min(cw - a.r, a.x));
        a.y = Math.max(a.r, Math.min(ch - a.r, a.y));
      }
    };

    const pickBubbleIdAt = (x: number, y: number) => {
      const bubbles = [...bubblesRef.current].sort((a, b) => b.r - a.r);
      for (const b of bubbles) {
        const dx = x - b.x;
        const dy = y - b.y;
        if (Math.hypot(dx, dy) <= b.r) return b.id;
      }
      return null;
    };

    const drawSelectedOverlay = (b: Bubble) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const textColor = b.isWhite ? "#1E3653" : "rgba(255,255,255,0.95)";
      const pillFill = b.isWhite ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.18)";
      const pillStroke = b.isWhite ? "rgba(30,54,83,0.22)" : "rgba(255,255,255,0.22)";

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "700 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(b.hex, b.x, b.y - 10);

      // Copy pill
      const pillW = 60;
      const pillH = 22;
      const px = b.x - pillW / 2;
      const py = b.y + 10;

      ctx.fillStyle = pillFill;
      roundRect(ctx, px, py, pillW, pillH, 999);
      ctx.fill();

      ctx.strokeStyle = pillStroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Copy", b.x, py + pillH / 2);

      // hitbox保存
      copyHitRef.current = {
        bubbleId: b.id,
        rect: { x: px, y: py, w: pillW, h: pillH },
      };

      ctx.restore();
    };

    const tick = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const selectedId = selectedIdRef.current;
      const bubbles = bubblesRef.current;

      // hover/selected のターゲット半径（ikea-bubblesと同じ設計）
      for (const b of bubbles) {
        // ✅ pulse減衰（毎フレーム）
        b.pulse *= 0.84;
        if (b.pulse < 0.001) b.pulse = 0;

        if (selectedId && b.id === selectedId) {
            const base = 92;
            const squish = 10 * b.pulse; // ← 強さ調整（8〜12おすすめ）
            b.rTarget = base - squish;   // ← ここが“ぷにっ”
            continue;
        }

        const dx = mx - b.x;
        const dy = my - b.y;
        const dist = Math.hypot(dx, dy);

        b.rTarget = dist < b.r ? 55 : 40;
        }
      applyRepulsion(cw, ch);

      // background: 白（枠なし）
      const isDark = darkRef.current;
      ctx.fillStyle = isDark ? "#0E1116" : "#FFFFFF";
      ctx.fillRect(0, 0, cw, ch);

      // copy hit reset（選択bubble描画の時だけ再セットされる）
      copyHitRef.current = null;

      for (const b of bubbles) {
        const lerp = selectedId && b.id === selectedId ? 0.16 : 0.12;
        b.r += (b.rTarget - b.r) * lerp;

        b.x += b.vx;
        b.y += b.vy;

        b.vx *= 0.995;
        b.vy *= 0.995;

        // bounce（ikea-bubbles踏襲）
        if (b.x < b.r) {
          b.x = b.r;
          b.vx *= -1;
        } else if (b.x > cw - b.r) {
          b.x = cw - b.r;
          b.vx *= -1;
        }

        if (b.y < b.r) {
          b.y = b.r;
          b.vy *= -1;
        } else if (b.y > ch - b.r) {
          b.y = ch - b.r;
          b.vy *= -1;
        }

        // shadow only（ふわっ）
        ctx.save();
        const shadowA = b.isWhite ? 0.14 : 0.22;   // ✅白だけ薄く
        const shadowBlur = b.isWhite ? 16 : 18;    // ✅白だけ少しだけ弱め
        const shadowY = b.isWhite ? 7 : 8;

        ctx.shadowColor = `rgba(0,0,0,${shadowA})`;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = shadowY;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.hex;
        ctx.fill();

        // 薄色救済だけ極薄stroke（必要最低限）
        if (isLight(b.hex)) {
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(0,0,0,0.06)";
          ctx.stroke();
        }

        ctx.restore();

        // ✅ 選択中だけオーバーレイ + Copy
        if (selectedId && b.id === selectedId) {
          drawSelectedOverlay(b);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onClick = async (e: MouseEvent) => {
      const selectedId = selectedIdRef.current;

      // 先にCopyピル判定（選択中のみ）
      const hit = copyHitRef.current;
      if (hit && selectedId && hit.bubbleId === selectedId) {
        const r = hit.rect;
        const inside =
          e.clientX >= r.x && e.clientX <= r.x + r.w && e.clientY >= r.y && e.clientY <= r.y + r.h;

        if (inside) {
          const b = bubblesRef.current.find((bb) => bb.id === selectedId);
          if (b) {
            b.pulse = 1; // ✅ クリックでpulse発生
            try {
              await navigator.clipboard.writeText(b.hex);
            } catch {
              // 失敗しても黙っておく（Safari権限など）
            }
          }
          return;
        }
      }

      // bubble選択トグル
      const id = pickBubbleIdAt(e.clientX, e.clientY);
      if (!id) {
        selectedIdRef.current = null; // 何もないところクリックで解除
        return;
      }
      selectedIdRef.current = selectedIdRef.current === id ? null : id;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectedIdRef.current = null;
    };

    const onResize = () => {
      setupCanvasSize();
      initBubbles(); // リサイズのときだけ並び直し（ikea-bubblesと同じ）
    };

    setupCanvasSize();
    initBubbles();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      mql.removeEventListener("change", handleSchemeChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [palette]);

  return <canvas ref={canvasRef} className="block h-screen w-screen" />;
}
