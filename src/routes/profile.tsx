// ===== profile.tsx =====
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  User,
  Phone,
  Crown,
  Coins,
  Shield,
  Bell,
  Ban,
  LogOut,
  Settings,
  Wallet,
  CheckCircle,
  XCircle,
  Sparkles,
  Moon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { LimitsInfo } from "@/components/LimitsInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHydrated, useMockState } from "@/lib/hooks";
import {
  authApi,
  formatKES,
  maskPhone,
  profileApi,
  walletApi,
} from "@/lib/mockApi";
import { cn, isValidKenyanLocal, localPart } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & safer play — ZeniPesa" },
      {
        name: "description",
        content:
          "Manage your ZeniPesa account, switch between demo and real mode, and set deposit limits, session reminders and self-exclusion.",
      },
      { property: "og:title", content: "Profile & safer play — ZeniPesa" },
      {
        property: "og:description",
        content:
          "Manage your account, switch demo/real mode and set responsible-gambling controls.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const state = useMockState();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const user = state.session?.user;
  const rg = state.responsible;
  const [limitInput, setLimitInput] = useState(
    rg.depositLimit ? String(rg.depositLimit) : "",
  );

  const [phoneInput, setPhoneInput] = useState("");
  const [phoneDirty, setPhoneDirty] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  useEffect(() => {
    if (!phoneDirty) setPhoneInput(localPart(user?.phone));
  }, [user?.phone, phoneDirty]);
  const phoneValid = isValidKenyanLocal(phoneInput);

  async function savePhone() {
    if (!phoneValid) {
      toast.error("Enter a valid M-Pesa number (07... or 01...)");
      return;
    }
    setSavingPhone(true);
    const res = await authApi.updatePhone(`254${phoneInput}`);
    setSavingPhone(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setPhoneDirty(false);
    toast.success("Phone number updated");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-4 p-3 sm:p-5">
        <div className="felt-surface flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <h1 className="font-display text-xl font-extrabold uppercase tracking-[0.15em] flex items-center gap-2 sm:text-2xl">
            <Settings className="size-6 text-[#d4af37]" />
            <span className="engravure-text">Member card</span>
          </h1>
          <LimitsInfo label="House rules" />
        </div>

        <section className="felt-surface p-5">
          {hydrated && user ? (
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="gold-chip grid size-16 shrink-0 place-items-center rounded-full font-display text-xl font-extrabold uppercase text-[#f8e494] shadow-[0_3px_14px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.6)]">
                {user.username.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-extrabold flex items-center gap-2">
                  <Sparkles className="size-4 text-[#ffc62e]" />@{user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role:{" "}
                  <span className="font-semibold capitalize text-[#f8e494]">
                    {user.role}
                  </span>
                  {user.canDebug && (
                    <span className="ml-2 text-[#ffc62e]">(debug)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3" />
                  {user.phone
                    ? `M-Pesa: ${maskPhone(user.phone)}`
                    : "No M-Pesa number on file"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are browsing as a guest. Log in to place bets and manage your
              wallet.
            </p>
          )}
        </section>

        {hydrated && user && (
          <section className="felt-surface felt-sheen space-y-3 p-5">
            <div>
              <h2 className="font-display text-base font-extrabold flex items-center gap-2">
                <Phone className="size-4 text-[#d4af37]" />
                M-Pesa number
              </h2>
              <p className="text-sm text-muted-foreground">
                Used to prefill deposits and withdrawals — you can still send to
                a different number on either form.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pphone" className="text-muted-foreground">
                Phone number
              </Label>
              <div className="flex gap-2">
                <div className="flex h-11 flex-1 items-stretch overflow-hidden rounded-full border border-[#d4af37]/30 bg-[#081309] focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37]">
                  <span className="flex items-center border-r border-[#d4af37]/15 px-3 text-sm font-semibold text-muted-foreground">
                    +254
                  </span>
                  <Input
                    id="pphone"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneDirty(true);
                      setPhoneInput(
                        e.target.value.replace(/\D/g, "").slice(0, 9),
                      );
                    }}
                    className="h-full flex-1 rounded-none border-0 bg-transparent focus:ring-0"
                    placeholder="7XXXXXXXX or 1XXXXXXXX"
                    autoComplete="tel-national"
                  />
                </div>
                <Button
                  variant="secondary"
                  className="h-11 rounded-full border border-[#d4af37]/30 bg-[#0b1d14] px-6 text-foreground transition-colors hover:bg-[#d4af37]/15 hover:text-[#f8e494]"
                  onClick={savePhone}
                  disabled={savingPhone || !phoneValid}
                >
                  {savingPhone ? "Saving..." : "Save"}
                </Button>
              </div>
              {phoneInput !== "" && !phoneValid && (
                <p className="text-xs text-danger">
                  Enter a valid number (07... or 01...)
                </p>
              )}
            </div>
          </section>
        )}

        <section className="felt-surface p-5">
          <h2 className="font-display text-base font-extrabold flex items-center gap-2">
            <Wallet className="size-4 text-[#ffc62e]" />
            Play table
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Demo chips are play money and never pay out.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["demo", "real"] as const).map((m) => (
              <button
                key={m}
                onClick={() => walletApi.setMode(m)}
                className={cn(
                  "rounded-2xl border border-[#d4af37]/15 bg-[#081309]/70 p-4 text-left transition-all hover:scale-[1.02]",
                  state.mode === m
                    ? "ring-2 ring-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                    : "hover:bg-accent",
                )}
              >
                <div className="flex items-center gap-2">
                  {m === "demo" ? (
                    <Coins className="size-4 text-[#ffc62e]" />
                  ) : (
                    <Crown className="size-4 text-[#d4af37]" />
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {m}
                  </p>
                </div>
                <p className="font-display text-lg font-extrabold tabular-nums">
                  {hydrated ? `KES ${formatKES(state.balances[m])}` : "—"}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="felt-surface space-y-4 p-5">
          <div>
            <h2 className="font-display text-base font-extrabold flex items-center gap-2">
              <Shield className="size-4 text-success" />
              Responsible gambling
            </h2>
            <p className="text-sm text-muted-foreground">
              Tools to keep your play under control.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dlimit" className="text-muted-foreground">
              Daily deposit limit (KES)
            </Label>
            <div className="flex gap-2">
              <Input
                id="dlimit"
                inputMode="decimal"
                placeholder="No limit set"
                value={limitInput}
                onChange={(e) =>
                  setLimitInput(e.target.value.replace(/[^\d]/g, ""))
                }
                className="h-11 rounded-full border-[#d4af37]/30 bg-[#081309] focus:border-[#d4af37] focus:ring-[#d4af37]"
              />
              <Button
                variant="secondary"
                className="h-11 rounded-full border border-[#d4af37]/30 bg-[#0b1d14] px-6 text-foreground transition-colors hover:bg-[#d4af37]/15 hover:text-[#f8e494]"
                onClick={() => {
                  profileApi.updateResponsible({
                    depositLimit: limitInput ? Number(limitInput) : null,
                  });
                  toast.success(
                    limitInput
                      ? `Deposit limit set to KES ${limitInput}`
                      : "Deposit limit removed",
                  );
                }}
              >
                Save
              </Button>
            </div>
          </div>

          <ToggleRow
            icon={<Ban className="size-4 text-danger" />}
            label="Self-exclusion"
            hint="Blocks all betting and deposits for 30 days."
            checked={rg.selfExcluded}
            onChange={(v) => {
              profileApi.updateResponsible({ selfExcluded: v });
              toast(v ? "Self-exclusion enabled" : "Self-exclusion disabled");
            }}
          />
          <ToggleRow
            icon={<Bell className="size-4 text-[#ffc62e]" />}
            label="Session reminders"
            hint="Get a reminder every 60 minutes of play."
            checked={rg.sessionReminder}
            onChange={(v) =>
              profileApi.updateResponsible({ sessionReminder: v })
            }
          />
        </section>

        <Button
          variant="secondary"
          className="h-12 w-full rounded-full border border-[#d4af37]/25 bg-[#0b1d14] font-display font-bold text-foreground transition-colors flex items-center gap-2 hover:bg-[#d4342c]/15 hover:text-danger"
          onClick={async () => {
            await authApi.logout();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </main>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-[#d4af37]/15 bg-[#081309]/70 p-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#d4af37]"
      />
    </div>
  );
}
