// ===== MultiplierStrip.tsx =====
import { multiplierTier } from "@/lib/mockApi";
import { cn } from "@/lib/utils";

const tierClass = {
  low: "border border-[#3fae6a]/40 bg-[#3fae6a]/10 text-[#a9d9b4]",
  mid: "border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#f8e494]",
  high: "border border-[#ffc62e]/50 bg-[#ffc62e]/15 text-[#ffc62e]",
} as const;

export function MultiplierStrip({ history }: { history: number[] }) {
  return (
    <div className="flex h-9 w-full items-center overflow-hidden rounded-full border border-[#d4af37]/25 bg-[#081309]/80 px-2">
      <div className="flex h-9 flex-nowrap items-center gap-1.5 overflow-hidden">
        {history.slice(0, 30).map((crashPoint, i) => (
          <span
            key={i}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 font-display text-xs font-bold tabular-nums",
              tierClass[multiplierTier(crashPoint)],
            )}
          >
            {crashPoint.toFixed(2)}x
          </span>
        ))}
      </div>
    </div>
  );
}
