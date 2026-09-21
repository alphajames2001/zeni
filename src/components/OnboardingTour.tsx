// ===== OnboardingTour.tsx =====
// First-run tour built the way react-joyride / driver.js do it:
//  - Rendered in a portal on <body> so no ancestor stacking context or
//    transform (the game page animates elements) can break fixed positioning.
//  - A four-panel dim overlay cuts a hole around the target, so the
//    highlighted element stays click-through and never gets covered.
//  - The instruction card is anchored NEXT TO the target (flips below/above
//    depending on room) and is clamped inside the viewport.
//  - The hole re-measures after the smooth scroll settles and again on any
//    user scroll/resize, so it never drifts off the element.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocalStorage } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Swords,
  Trophy,
  Coins,
  Wallet,
  Users,
  TrendingUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const steps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ZeniPesa",
    description:
      "The classic crash casino. A golden multiplier climbs and climbs — cash out before it busts, or the house takes your stake. Every hand is a new deal.",
    icon: <Swords className="size-6 text-[#ffc62e]" />,
  },
  {
    id: "canvas",
    title: "The golden curve",
    target: "canvas",
    description:
      "Watch the curve here. It starts at 1.00x and climbs higher. The longer you wait, the richer the payout — but it can bust at any moment.",
    icon: <TrendingUp className="size-6 text-[#f8e494]" />,
  },
  {
    id: "multiplier",
    title: "The tote board",
    target: "multiplier-strip",
    description:
      "Recent finished hands, right above the table. Green is a low roll, gold a big one, and amber means someone hit the jackpot zone.",
    icon: <Trophy className="size-6 text-[#ffc62e]" />,
  },
  {
    id: "box-1",
    title: "Box 1 — your stake",
    target: "box-1",
    description:
      "This is betting box 1. Tap a chip value or type your own stake in KES, then hit the gold button once the next hand is dealing.",
    icon: <Coins className="size-6 text-[#ffc62e]" />,
  },
  {
    id: "box-2",
    title: "Box 2 — auto cash-out",
    target: "box-2",
    description:
      "Betting box 2 works the same — and you can flip on auto cash-out here. It locks in your win the moment the multiplier hits your target. Cool for sleeping high rollers.",
    icon: <Check className="size-6 text-[#3fae6a]" />,
  },
  {
    id: "buy-chips",
    title: "Deposit",
    target: "buy-chips",
    description:
      "Running low? Press Deposit to top up with M-Pesa via STK push, or withdraw your winnings straight back to your phone.",
    icon: <Wallet className="size-6 text-[#d4af37]" />,
  },
  {
    id: "the-floor",
    title: "The floor",
    target: "the-floor",
    description:
      "Live action from every player at the table, plus the full hand history. Your own bets are marked with a gold ring.",
    icon: <Users className="size-6 text-[#3fae6a]" />,
  },
];

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

const PAD = 10;
const GAP = 16;
const TOOLTIP_MAX_WIDTH = 360;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const left = r.left - PAD;
  const top = r.top - PAD;
  const width = r.width + PAD * 2;
  const height = r.height + PAD * 2;
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

export function OnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    "zenipesa-tour-seen",
    false,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipSize, setTooltipSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const step = steps[currentStep];

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      setHasSeenTour(true);
    }
  }, [currentStep, setHasSeenTour]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setIsOpen(false);
    setHasSeenTour(true);
  }, [setHasSeenTour]);

  useEffect(() => {
    if (!hasSeenTour) setIsOpen(true);
  }, [hasSeenTour]);

  // Focus the target of the current step: smooth-scroll it into view, then
  // measure once while scrolling and again after the scroll has settled.
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (!step.target) {
      setRect(null);
      setTooltipSize(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${step.target}"]`,
    );
    if (!el) {
      setRect(null);
      return;
    }
    setTooltipSize(null);
    el.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });

    let cancelled = false;
    let timeout = 0;
    const update = () => {
      if (cancelled) return;
      const next = getTargetRect(step.target!);
      if (next) setRect(next);
    };
    const r1 = requestAnimationFrame(update);
    timeout = window.setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(update));
    }, 460);

    return () => {
      cancelled = true;
      cancelAnimationFrame(r1);
      clearTimeout(timeout);
    };
  }, [isOpen, currentStep]);

  // Keep the hole glued to the target if the user scrolls or resizes.
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (!step.target) return;
    const resync = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (!step.target) return;
        const next = getTargetRect(step.target);
        if (next) setRect(next);
      });
    };
    window.addEventListener("scroll", resync, true);
    window.addEventListener("resize", resync);
    return () => {
      window.removeEventListener("scroll", resync, true);
      window.removeEventListener("resize", resync);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isOpen, currentStep]);

  // Measure the tooltip card so flips and clamping are exact (opacity stays 0
  // until the first measurement so nothing flashes in the wrong spot).
  useLayoutEffect(() => {
    if (!isOpen || !rect || !tooltipRef.current) return;
    const { width, height } = tooltipRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    setTooltipSize((prev) =>
      prev && prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, [isOpen, rect, currentStep]);

  // ESC ends the tour.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleSkip]);

  if (!isOpen) return null;

  const isLast = currentStep === steps.length - 1;
  const hasTarget = !!step.target;

  // Derive the tooltip position: adjacent to the target, flipped below/above
  // by available space, clamped inside the viewport. Pure calculation.
  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, vw - 24);
  let tip: { left: number; top: number; width: number } | null = null;
  let placement: "below" | "above" = "below";
  let arrowLeft = 0;
  if (rect && hasTarget) {
    const size = tooltipSize ?? { width: tooltipWidth, height: 260 };
    const cx = rect.left + rect.width / 2;
    const belowRoom = vh - rect.bottom - GAP;
    const aboveRoom = rect.top - GAP;
    if (belowRoom >= size.height) {
      placement = "below";
    } else if (aboveRoom >= size.height) {
      placement = "above";
    } else {
      placement = belowRoom >= aboveRoom ? "below" : "above";
    }
    const left = Math.round(clamp(cx - size.width / 2, 8, vw - size.width - 8));
    let top = Math.round(
      placement === "below" ? rect.bottom + GAP : rect.top - GAP - size.height,
    );
    top = clamp(top, 8, vh - size.height - 8);
    tip = { left, top, width: size.width };
    arrowLeft = Math.round(clamp(cx - left, 20, size.width - 20));
  }

  const card = (
    <div className="felt-surface gold-frame felt-sheen p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-1 gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                idx === currentStep
                  ? "bg-[#ffc62e]"
                  : idx < currentStep
                    ? "bg-[#d4af37]"
                    : "bg-[#2c4a36]",
              )}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          className="rounded-full border border-[#d4af37]/40 bg-[#0f2017] p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close tour"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="gold-chip mb-3 grid size-12 place-items-center rounded-full shadow-[0_3px_14px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.6)]">
        {step.icon}
      </div>

      <h2 className="engravure-text font-display text-lg font-extrabold tracking-wide">
        {step.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>

      <p className="mt-3 font-display text-xs tracking-widest text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
      </p>

      <div className="mt-5 flex items-center gap-2">
        {currentStep > 0 && (
          <Button
            variant="secondary"
            onClick={handlePrevious}
            className="flex-1 rounded-full border border-[#d4af37]/25 bg-[#0b1d14] text-foreground hover:bg-[#d4af37]/10"
          >
            <ChevronLeft className="mr-1 size-4" />
            Back
          </Button>
        )}

        <Button
          onClick={handleNext}
          autoFocus
          className="flex-1 rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-bold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:brightness-110 border border-[#8f6a15]"
        >
          {isLast ? (
            <>
              Deal me in <Check className="ml-1 size-4" />
            </>
          ) : (
            <>
              Next <ChevronRight className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const dim =
    "absolute bg-black/75 backdrop-blur-[2px] transition-[top,left,width,height] duration-500 ease-out";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      className="fixed inset-0 z-[100]"
    >
      {/* Dim overlay with a cutout hole around the target */}
      {rect && hasTarget ? (
        <>
          <div
            className={cn(
              dim,
              "inset-x-0 top-0 animate-in fade-in duration-300",
            )}
            style={{ height: rect.top }}
          />
          <div
            className={dim}
            style={{
              top: rect.top,
              left: 0,
              width: rect.left,
              height: rect.height,
            }}
          />
          <div
            className={dim}
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              width: Math.max(0, vw - (rect.left + rect.width)),
              height: rect.height,
            }}
          />
          <div
            className={cn(dim, "inset-x-0")}
            style={{ top: rect.bottom, height: Math.max(0, vh - rect.bottom) }}
          />

          {/* Spotlight halo — pointer-events-none so the target stays clickable */}
          <div
            className="pointer-events-none absolute rounded-2xl border-2 border-[#ffc62e] shadow-[0_0_30px_rgba(255,198,46,0.55),inset_0_0_18px_rgba(255,198,46,0.22)] transition-[top,left,width,height] duration-500 ease-out"
            style={{ ...rect }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-300" />
      )}

      {/* Instruction card: anchored beside the target, or centered on intro */}
      {rect && tip ? (
        <div
          key={currentStep}
          ref={tooltipRef}
          className={cn(
            "absolute",
            tooltipSize
              ? "animate-in fade-in zoom-in-95 duration-200"
              : "opacity-0",
          )}
          style={{ left: tip.left, top: tip.top, width: tip.width }}
        >
          <div
            className={cn(
              "pointer-events-none absolute z-10 size-3 rotate-45 border border-[#d4af37]/60 bg-[#0e2016]",
              placement === "below" ? "-top-1.5" : "-bottom-1.5",
            )}
            style={{ left: arrowLeft - 6 }}
          />
          {card}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative max-w-md" style={{ width: tooltipWidth }}>
            {card}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
