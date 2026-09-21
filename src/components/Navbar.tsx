// ===== Navbar.tsx =====
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Wallet,
  User as UserIcon,
  LogOut,
  Menu,
  Coins,
  Users,
  Swords,
  Sparkles,
  Gem,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydrated, useMockState, useGame } from "@/lib/hooks";
import { authApi, formatKES, walletApi } from "@/lib/mockApi";

export function Navbar() {
  const state = useMockState();
  const game = useGame();
  const hydrated = useHydrated();
  const navigate = useNavigate();

  const balance = state.balances?.[state.mode] ?? 0;
  const user = hydrated ? state.session?.user : null;
  const isGuest = !user;
  const activeBets = game.liveBets?.length || 0;

  return (
    <header className="sticky top-0 z-40">
      <div className="h-1.5 w-full marquee-lights" aria-hidden />
      <div className="border-b-2 border-primary/50 bg-[#081309]/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-3 px-3 sm:px-5">
          <Link
            to="/"
            className="shrink-0 transition-transform hover:scale-[1.03]"
          >
            <Logo className="h-9 sm:h-11" />
          </Link>

          {/* Live floor indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#0b1d14] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(244,236,215,0.08)] md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffc62e] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ffc62e]"></span>
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[#ffc62e]">
              The floor is hot
            </span>
            <span className="mx-1 h-3 w-px bg-[#d4af37]/30" />
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#a9b795]">
              <Users className="size-3" />
              {activeBets} bets
            </span>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Balance chip */}
            <div
              className="gold-chip flex min-w-0 items-center gap-2 px-3 py-1.5"
              data-tour="balance-chip"
            >
              <Coins className="size-3.5 shrink-0 text-[#ffc62e]" />
              <span className="truncate font-display text-sm font-bold tabular-nums text-[#f8e494]">
                {hydrated ? `KES ${formatKES(balance)}` : "—"}
              </span>
              {hydrated && isGuest && (
                <span className="rounded-full bg-[#4a0d10] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#f6ead2]">
                  Guest
                </span>
              )}
              {hydrated && !isGuest && state.mode === "demo" && (
                <span className="rounded-full bg-[#d4342c]/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                  Demo
                </span>
              )}
            </div>

            <Button
              asChild
              size="sm"
              data-tour="buy-chips"
              className="hidden font-display font-bold uppercase tracking-wider sm:inline-flex rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] text-[#16150d] shadow-[0_3px_12px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.7)] hover:shadow-[0_4px_18px_rgba(212,175,55,0.5)] hover:scale-105 transition-all border border-[#8f6a15]"
            >
              <Link to="/wallet">
                <Gem className="size-4 mr-1.5" />
                Deposit
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] text-[#16150d] shadow-[0_3px_12px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-110 hover:shadow-[0_4px_18px_rgba(212,175,55,0.5)] border border-[#8f6a15]"
                >
                  {user ? (
                    <span className="font-display text-sm font-extrabold uppercase">
                      {(user.username || "U").slice(0, 2)}
                    </span>
                  ) : (
                    <Menu className="size-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-[#d4af37]/30 bg-[#0f2017] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
              >
                <DropdownMenuLabel className="truncate font-display">
                  {user ? (
                    <span className="flex items-center gap-1.5 text-[#f8e494]">
                      <Sparkles className="size-3.5 text-[#ffc62e]" />@
                      {user.username}
                    </span>
                  ) : (
                    "Guest — not logged in"
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/wallet" className="cursor-pointer">
                    <Wallet className="mr-2 size-4" /> Wallet
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {user && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => {
                      const nextMode = state.mode === "demo" ? "real" : "demo";
                      walletApi.setMode(nextMode);
                    }}
                  >
                    <Swords className="mr-2 size-4 text-[#ffc62e]" />
                    Switch to {state.mode === "demo" ? "Real" : "Demo"} table
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem
                    className="cursor-pointer text-danger"
                    onSelect={async () => {
                      await authApi.logout();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 size-4" /> Log out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="cursor-pointer text-[#d4af37]">
                      Log in
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
