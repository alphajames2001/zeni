// ===== LimitsInfo.tsx =====
import { ScrollText, Scale } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LIMITS } from "@/lib/mockApi";

const rows: [string, string][] = [
  ["Minimum buy-in", `KES ${LIMITS.minDeposit.toLocaleString()}`],
  ["Minimum stake", `KES ${LIMITS.minStake.toLocaleString()}`],
  ["Max single payout", `KES ${LIMITS.maxSinglePayout.toLocaleString()}`],
  ["Max withdrawal", `KES ${LIMITS.maxWithdraw.toLocaleString()}`],
];

export function LimitsInfo({ label = "House rules" }: { label?: string }) {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0b1d14] px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:scale-105 hover:text-[#f8e494] hover:ring-1 hover:ring-[#d4af37]/40">
        <ScrollText className="size-3.5" /> {label}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 border-[#d4af37]/30 bg-[#0f2017] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      >
        <p className="mb-2 flex items-center gap-1.5 font-display text-sm font-bold text-[#f8e494]">
          <Scale className="size-3.5 text-[#d4af37]" />
          House rules
        </p>
        <dl className="space-y-1.5 text-xs">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="tabular-nums font-semibold text-[#f8e494]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 border-t border-[#d4af37]/15 pt-2 text-[10px] leading-relaxed text-muted-foreground">
          Limits are enforced by the house. Contact the pit boss for
          adjustments.
        </p>
      </PopoverContent>
    </Popover>
  );
}
