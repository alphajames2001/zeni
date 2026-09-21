// ===== index.tsx =====
import { createFileRoute } from "@tanstack/react-router";
import { Swords, Crown, Flame, Timer } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MultiplierStrip } from "@/components/MultiplierStrip";
import { CrashCanvas } from "@/components/CrashCanvas";
import { BetPanel } from "@/components/BetPanel";
import { LiveBetsTable } from "@/components/LiveBetsTable";
import { LimitsInfo } from "@/components/LimitsInfo";
import { useGame, useMockState } from "@/lib/hooks";
import { OnboardingTour } from "@/components/OnboardingTour";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZeniPesa — Classic Crash Casino" },
      {
        name: "description",
        content:
          "ZeniPesa classic crash casino: ride the multiplier, cash out before the crash. Instant M-Pesa deposits and withdrawals in Kenya.",
      },
      { property: "og:title", content: "ZeniPesa — Classic Crash Casino" },
      {
        property: "og:description",
        content:
          "Ride the multiplier and cash out before the crash. Dual betting boxes, auto-cashout and instant M-Pesa payouts.",
      },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const game = useGame();
  const state = useMockState();
  const username = state.session?.user.username ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:min-h-dvh">
      <OnboardingTour />

      {/* Vignette glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-[#d4af37]/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#3fae6a]/5 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a0d10]/10 blur-3xl"></div>
      </div>

      <Navbar />

      <main className="relative mx-auto flex w-full flex-1 max-w-[1680px] flex-col gap-3 p-3 sm:p-5 lg:gap-2 lg:p-2">
        {/* Marquee header */}
        <div className="felt-surface flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 lg:flex-nowrap lg:gap-2 lg:py-2 sm:px-5">
          <div className="flex items-center gap-3">
            <Swords className="size-5 text-[#d4af37]" />
            <h1 className="font-display text-base font-extrabold uppercase tracking-[0.18em] sm:text-lg">
              <span className="engravure-text">Crash</span>
              <span className="ml-2 text-muted-foreground/60">·</span>
              <span className="ml-2 text-foreground/75">
                Round #{game.roundId}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0b1d14] px-3 py-1 sm:flex">
              <Flame className="size-3 text-[#ffc62e]" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffc62e]">
                {game.phase === "waiting" ? (
                  <span className="flex items-center gap-1">
                    <Timer className="size-3" />
                    Next deal in {game.countdown.toFixed(1)}s
                  </span>
                ) : game.phase === "running" ? (
                  "Showdown in progress"
                ) : (
                  "The house took it"
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0b1d14] px-3 py-1">
              <Crown className="size-3 text-[#ffc62e]" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#f8e494]">
                High roller lounge
              </span>
            </div>
            <LimitsInfo label="House rules" />
          </div>
        </div>

        <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:gap-2 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Center stage */}
          <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:gap-2">
            <div className="relative" data-tour="multiplier-strip">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Recent hands
                </span>
                <span className="text-[10px] text-muted-foreground/70">◆</span>
              </div>
              <MultiplierStrip history={game.history} />
            </div>

            <div
              className="relative gold-frame rounded-[26px] bg-[#081309] p-2 sm:p-3 felt-sheen"
              data-tour="canvas"
            >
              {/* Corner ornaments */}
              <span className="pointer-events-none absolute -top-2 left-3 font-display text-lg text-[#d4af37]/60">
                ◆
              </span>
              <span className="pointer-events-none absolute -top-2 right-3 font-display text-lg text-[#d4af37]/60">
                ◆
              </span>
              <CrashCanvas
                phase={game.phase}
                multiplier={game.multiplier}
                countdown={game.countdown}
                roundId={game.roundId}
              />
            </div>

            {/* Betting stations */}
            <div className="grid gap-3 sm:grid-cols-2 lg:min-h-0 lg:gap-2">
              <div data-tour="box-1" className="min-w-0">
                <BetPanel
                  index={1}
                  phase={game.phase}
                  multiplier={game.multiplier}
                  roundId={game.roundId}
                  mode={state.mode}
                  username={username}
                />
              </div>
              <div data-tour="box-2" className="min-w-0">
                <BetPanel
                  index={2}
                  phase={game.phase}
                  multiplier={game.multiplier}
                  roundId={game.roundId}
                  mode={state.mode}
                  username={username}
                />
              </div>
            </div>
          </div>

          {/* The floor — live bets */}
          <div className="lg:min-h-0" data-tour="the-floor">
            <LiveBetsTable liveBets={game.liveBets} history={game.history} />
          </div>
        </div>

        <div className="h-1.5 w-full shrink-0 marquee-lights" aria-hidden />
      </main>
    </div>
  );
}
