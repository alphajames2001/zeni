// ===== BetPanel.tsx =====
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  gameApi,
  LIMITS,
  formatKES,
  applyBalanceDelta,
  type Mode,
  type Phase,
} from "@/lib/mockApi";
import { useMockState } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, Swords } from "lucide-react";

interface Props {
  index: 1 | 2;
  phase: Phase;
  multiplier: number;
  roundId: number;
  mode: Mode;
  username: string | null;
}

type BetStatus = "idle" | "queued" | "active" | "settled";

const QUICK = [100, 500, 1000];

export function BetPanel({
  index,
  phase,
  multiplier,
  roundId,
  mode,
  username,
}: Props) {
  const isGuest = !username;
  const effectiveMode: Mode = isGuest ? "demo" : mode;
  const mockState = useMockState();

  const [stake, setStake] = useState("100");
  const [autoOn, setAutoOn] = useState(false);
  const [auto, setAuto] = useState("2.00");
  const [status, setStatus] = useState<BetStatus>("idle");
  const [placedStake, setPlacedStake] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const betBox = useRef<1 | 2 | null>(null);
  const betRound = useRef<number>(-1);

  const stakeNum = Number(stake);
  const stakeError =
    stake !== "" &&
    (!Number.isFinite(stakeNum) ||
      stakeNum < LIMITS.minStake ||
      stakeNum > LIMITS.maxSinglePayout)
      ? `Stake must be between ${LIMITS.minStake} and ${LIMITS.maxSinglePayout.toLocaleString()} KES`
      : null;
  const autoNum = Number(auto);
  const autoError =
    autoOn && (!Number.isFinite(autoNum) || autoNum < 1.01)
      ? "Min 1.01x"
      : null;

  useEffect(() => {
    if (phase === "running" && status === "queued") {
      setStatus("active");
      betRound.current = roundId;
    }
    if (phase === "crashed" && status === "active") {
      setStatus("idle");
      toast.error(`Box ${index} busted — crashed at ${multiplier.toFixed(2)}x`);
    }
    if (phase === "waiting" && status === "settled") setStatus("idle");
  }, [phase, multiplier, index, status, roundId]);

  useEffect(() => {
    if (status === "active" && autoOn && !autoError && multiplier >= autoNum) {
      doCashout(Math.min(multiplier, autoNum));
    }
  }, [multiplier]);

  async function doCashout(at: number) {
    if (isSubmitting || betBox.current === null) return;

    if (isGuest) {
      setIsSubmitting(true);
      try {
        const payout = Math.min(
          LIMITS.maxSinglePayout,
          Math.round(placedStake * at * 100) / 100,
        );
        applyBalanceDelta("demo", payout);
        setStatus("settled");
        toast.success(
          `Cashed out @ ${at.toFixed(2)}x — KES ${formatKES(payout)} (demo)`,
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await gameApi.cashout(betBox.current, effectiveMode);
      if (result.ok) {
        setStatus("settled");
        toast.success(
          `Cashed out @ ${result.multiplier.toFixed(2)}x — KES ${formatKES(result.payout)}`,
        );
      } else {
        toast.error(result.error || "Cashout failed");
      }
    } catch (error) {
      toast.error("Cashout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function placeBet() {
    if (stakeError || !stakeNum) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isGuest) {
        if (stakeNum > mockState.balances.demo) {
          toast.error("Insufficient demo balance");
          return;
        }
        applyBalanceDelta("demo", -stakeNum);
        betBox.current = index;
        setPlacedStake(stakeNum);
        setStatus("queued");
        toast.success(
          `Bet ${index} placed — KES ${formatKES(stakeNum)} (demo)`,
        );
        return;
      }

      const result = await gameApi.placeBet(index, stakeNum, effectiveMode);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      betBox.current = index;
      setPlacedStake(stakeNum);
      setStatus("queued");
      toast.success(`Bet ${index} placed — KES ${formatKES(stakeNum)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cancelBet() {
    if (isGuest) {
      applyBalanceDelta("demo", placedStake);
      setStatus("idle");
      betBox.current = null;
      toast("Bet cancelled");
      return;
    }
    setStatus("idle");
    betBox.current = null;
    toast("Bet reset");
  }

  const canBet = (phase !== "running" || status === "idle") && !isSubmitting;

  let action: {
    label: string;
    onClick?: () => void;
    variant: "primary" | "cashout" | "cancel";
    disabled?: boolean;
  };
  if (status === "active") {
    action = {
      label: isSubmitting
        ? "Cashing out..."
        : `Cash out ${(placedStake * multiplier).toFixed(0)} @ ${multiplier.toFixed(2)}x`,
      onClick: () => doCashout(multiplier),
      variant: "cashout",
      disabled: isSubmitting,
    };
  } else if (status === "queued") {
    action = {
      label: "Bet placed — waiting...",
      onClick: cancelBet,
      variant: "cancel",
      disabled: isSubmitting,
    };
  } else if (status === "settled") {
    action = { label: "Cashed out", variant: "cancel", disabled: true };
  } else if (phase === "running") {
    action = {
      label: "Waiting for next hand",
      variant: "cancel",
      disabled: true,
    };
  } else {
    action = {
      label: isSubmitting
        ? "Placing bet..."
        : `Place Bet ${stakeNum ? formatKES(stakeNum) : ""}`.trim(),
      onClick: placeBet,
      variant: "primary",
      disabled: !!stakeError || !stakeNum || isSubmitting,
    };
  }

  return (
    <div className="felt-surface felt-sheen flex flex-col gap-2 p-2.5 lg:gap-1 lg:p-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full border border-[#d4af37]/50 bg-[#0b1d14] font-display text-[10px] font-bold text-[#f8e494]">
            {index}
          </span>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Betting box {index}
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          {isGuest && (
            <span className="rounded-full bg-[#4a0d10]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#f6ead2]">
              Guest
            </span>
          )}
          {!isGuest && effectiveMode === "demo" && (
            <span className="rounded-full bg-[#d4342c]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Demo
            </span>
          )}
          {!isGuest && effectiveMode === "real" && (
            <span className="rounded-full bg-[#3fae6a]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0f2318]">
              Real
            </span>
          )}
          {status !== "idle" && (
            <span className="rounded-full bg-[#d4af37]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#f8e494]">
              {status === "queued"
                ? "Queued"
                : status === "active"
                  ? "Live"
                  : "Settled"}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={!canBet}
            onClick={() => setStake(String(q))}
            className="rounded-full border border-[#8f6a15] bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] px-2 py-1 font-display text-sm font-bold tabular-nums text-[#16150d] shadow-[0_2px_10px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-105 hover:brightness-110 disabled:opacity-40 lg:py-0.5 lg:text-xs"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="space-y-0.5">
        <Label
          htmlFor={`stake-${index}`}
          className="text-xs text-muted-foreground"
        >
          Stake (KES)
        </Label>
        <Input
          id={`stake-${index}`}
          inputMode="decimal"
          value={stake}
          disabled={!canBet}
          onChange={(e) => setStake(e.target.value.replace(/[^\d.]/g, ""))}
          className="h-8 rounded-full border-[#d4af37]/30 bg-[#081309] font-display text-sm font-bold tabular-nums text-[#f8e494] focus:border-[#d4af37] focus:ring-[#d4af37] lg:h-7"
        />
        {stakeError && <p className="text-xs text-danger">{stakeError}</p>}
      </div>

      <div className="space-y-0.5 rounded-2xl border border-[#d4af37]/15 bg-[#081309]/60 p-1.5 lg:p-1">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor={`auto-${index}`}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <TrendingUp className="size-3" />
            Auto cash-out
          </Label>
          <Switch
            id={`auto-${index}`}
            checked={autoOn}
            onCheckedChange={setAutoOn}
            disabled={!canBet}
            className="scale-75 data-[state=checked]:bg-[#d4af37]"
          />
        </div>
        {autoOn ? (
          <>
            <Input
              inputMode="decimal"
              value={auto}
              disabled={!canBet}
              onChange={(e) => setAuto(e.target.value.replace(/[^\d.]/g, ""))}
              className="h-7 rounded-full border-[#d4af37]/30 bg-[#081309] font-display text-sm font-bold tabular-nums text-[#f8e494] focus:border-[#d4af37] focus:ring-[#d4af37]"
            />
            {autoError && <p className="text-xs text-danger">{autoError}</p>}
          </>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            Off — cash out by hand before the bust.
          </p>
        )}
      </div>

      <Button
        onClick={action.onClick}
        disabled={action.disabled}
        className={cn(
          "h-10 w-full rounded-full font-display text-sm font-extrabold uppercase tracking-wide tabular-nums transition-all lg:h-9",
          action.variant === "cashout" &&
            "bg-gradient-to-b from-[#ffd75e] to-[#d4af37] text-[#16150d] shadow-[0_3px_12px_rgba(255,198,46,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]",
          action.variant === "cancel" &&
            "bg-elevated text-foreground hover:bg-accent hover:text-accent-foreground",
          action.variant === "primary" &&
            "bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15] hover:shadow-[0_5px_22px_rgba(212,175,55,0.5)]",
        )}
      >
        {action.label}
      </Button>

      <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
        <Swords className="size-3" />
        {index === 1 ? "Even money" : "Double or nothing"}
        <Zap className="size-3" />
      </div>
    </div>
  );
}
