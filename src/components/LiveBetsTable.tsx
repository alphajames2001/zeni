import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatKES, multiplierTier, type LiveBet } from "@/lib/mockApi";
import { cn } from "@/lib/utils";
import { Users, Search, User, Trophy, Crown } from "lucide-react";

const tierText = {
  low: "text-[#a9d9b4]",
  mid: "text-[#f8e494]",
  high: "text-[#ffc62e]",
} as const;

export function LiveBetsTable({
  liveBets,
  history,
}: {
  liveBets: LiveBet[];
  history: number[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = history.filter(
    (crashPoint) => query === "" || String(crashPoint).includes(query),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="felt-surface felt-sheen flex h-full min-h-0 flex-col p-3 lg:p-2.5">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4af37]/40" />
        <h2 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.3em] text-[#f8e494]">
          <Crown className="size-3.5 text-[#ffc62e]" />
          The Floor
        </h2>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4af37]/40" />
      </div>

      <Tabs defaultValue="live" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-full rounded-full border border-[#d4af37]/25 bg-[#081309]/80 p-1">
          <TabsTrigger
            value="live"
            className="flex-1 rounded-full data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#e5c75c] data-[state=active]:via-[#d4af37] data-[state=active]:to-[#a47b1e] data-[state=active]:text-[#16150d]"
          >
            <Users className="mr-1.5 size-3" /> Live
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 rounded-full data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#e5c75c] data-[state=active]:via-[#d4af37] data-[state=active]:to-[#a47b1e] data-[state=active]:text-[#16150d]"
          >
            <Trophy className="mr-1.5 size-3" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="live"
          className="mt-2 min-h-0 flex-1 lg:flex lg:flex-col"
        >
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Player</span>
            <span className="text-right">Box</span>
            <span className="w-20 text-right">Stake</span>
          </div>
          <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1 no-scrollbar">
            {liveBets.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                The floor is quiet — be first to bet
              </p>
            ) : (
              liveBets.map((b) => (
                <div
                  key={b.key}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-full px-3 py-1.5 text-sm",
                    b.cashedOutAt !== null
                      ? "border border-[#d4af37]/30 bg-[#d4af37]/10"
                      : "bg-[#081309]/70",
                    b.self && "ring-2 ring-[#d4af37]",
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate text-muted-foreground">
                    {b.self ? (
                      <>
                        <User className="size-3 text-[#f8e494]" />
                        <span className="font-bold text-[#f8e494]">You</span>
                      </>
                    ) : (
                      b.userId.slice(0, 8)
                    )}
                  </span>
                  <span className="font-display tabular-nums">Box {b.box}</span>
                  <span className="w-20 text-right tabular-nums">
                    {b.cashedOutAt !== null ? (
                      <span className="font-bold text-[#ffc62e]">
                        {formatKES(b.payout ?? 0)}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {b.cashedOutAt.toFixed(2)}x
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {formatKES(b.amount)}
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-2 min-h-0 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search multiplier"
              className="mb-2 h-8 rounded-full border-[#d4af37]/25 bg-[#081309] pl-8 text-sm focus:border-[#d4af37] focus:ring-[#d4af37]"
            />
          </div>
          <div className="no-scrollbar max-h-[280px] space-y-0.5 overflow-y-auto lg:max-h-none">
            {current.map((crashPoint, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-full bg-[#081309]/70 px-3 py-1.5 text-sm"
              >
                <span className="text-muted-foreground">
                  #{history.length - idx}
                </span>
                <span
                  className={cn(
                    "font-display font-bold tabular-nums",
                    tierText[multiplierTier(crashPoint)],
                  )}
                >
                  {crashPoint.toFixed(2)}x
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-7 rounded-full bg-elevated px-3 text-xs text-foreground transition-colors hover:bg-[#d4af37]/20 hover:text-[#f8e494]"
            >
              Prev
            </Button>
            <span className="font-display">
              Page {page} / {pages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 rounded-full bg-elevated px-3 text-xs text-foreground transition-colors hover:bg-[#d4af37]/20 hover:text-[#f8e494]"
            >
              Next
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
