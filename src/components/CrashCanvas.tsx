import { useEffect, useRef } from "react";
import type { Phase } from "@/lib/mockApi";
import { cn } from "@/lib/utils";

interface Props {
  phase: Phase;
  multiplier: number;
  countdown: number;
  roundId: number;
}

export function CrashCanvas({ phase, multiplier, countdown, roundId }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ phase, multiplier });
  stateRef.current = { phase, multiplier };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const red = "#D4342C";
    const gold = "#F8E494";
    const jackpot = "#FFC62E";
    const maroon = "#A8462F";
    const green = "#3FAE6A";
    const grid = "rgba(244,236,215,0.055)";

    const draw = () => {
      const { phase: p, multiplier: m } = stateRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = grid;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        const y = (h / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let i = 1; i < 8; i++) {
        const x = (w / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (p === "waiting") {
        raf = requestAnimationFrame(draw);
        return;
      }

      const progress = Math.min(1, Math.log(Math.max(1, m)) / Math.log(12));
      const isHigh = progress > 0.6;
      const isVeryHigh = progress > 0.8;
      let color = green;
      if (p === "crashed") color = red;
      else if (isVeryHigh) color = jackpot;
      else if (isHigh) color = gold;
      else color = maroon;

      let area = "rgba(63,174,106,0.16)";
      if (p === "crashed") area = "rgba(212,52,44,0.22)";
      else if (isVeryHigh) area = "rgba(255,198,46,0.22)";
      else if (isHigh) area = "rgba(248,228,148,0.18)";
      else area = "rgba(168,70,47,0.18)";

      const padX = 16;
      const padY = 18;
      const endX =
        padX + (w - padX * 2) * Math.min(0.94, 0.12 + progress * 0.85);
      const curveH = h - padY * 2;

      const pointAt = (t: number) => {
        const x = padX + (endX - padX) * t;
        const y =
          h - padY - curveH * Math.pow(t, 2.1) * Math.min(1, 0.15 + progress);
        return [x, y] as const;
      };

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, area);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.beginPath();
      ctx.moveTo(padX, h - padY);
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const [x, y] = pointAt(t);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(endX, h - padY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const [x, y] = pointAt(t);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const [hx, hy] = pointAt(1);
      for (let i = 0; i < 12; i++) {
        const t = 1 - i * 0.025;
        if (t < 0) break;
        const [px, py] = pointAt(t);
        ctx.beginPath();
        const alpha = (1 - i / 12) * 0.6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        const size = 2 + (1 - i / 12) * 5;
        ctx.arc(
          px + (Math.random() - 0.5) * 4,
          py + (Math.random() - 0.5) * 4,
          size,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.shadowColor = color;
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(hx, hy, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.arc(hx - 2, hy - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-gradient-to-b from-[#0e2419] to-[#060f0a] sm:aspect-[16/8] lg:aspect-auto lg:h-[210px] xl:h-[250px]",
        phase === "crashed" && "animate-crash-flash",
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center">
        {phase === "waiting" ? (
          <div className="animate-rise">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Dealing next hand
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold tabular-nums text-[#ffc62e] sm:text-5xl lg:text-3xl xl:text-4xl">
              {countdown.toFixed(1)}s
            </p>
            <p className="mt-2 text-xs text-muted-foreground lg:mt-1">
              Round{" "}
              <span className="font-semibold text-[#f8e494]">#{roundId}</span>
            </p>
          </div>
        ) : (
          <div className="animate-rise">
            <p
              className={cn(
                "font-display text-5xl font-extrabold tabular-nums sm:text-6xl lg:text-4xl xl:text-5xl",
                phase === "crashed"
                  ? "text-[#ff6b60]"
                  : multiplier > 10
                    ? "text-[#ffc62e] animate-gold-pulse"
                    : multiplier > 5
                      ? "text-[#f8e494]"
                      : "text-[#a9d9b4]",
              )}
            >
              {multiplier.toFixed(2)}x
            </p>
            {phase === "crashed" && (
              <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.4em] text-[#ff6b60] animate-pulse">
                Bust
              </p>
            )}
            {phase === "running" && multiplier > 5 && (
              <p className="mt-1 font-display text-xs font-bold uppercase tracking-[0.35em] text-[#ffc62e] animate-pulse">
                Jackpot zone
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
