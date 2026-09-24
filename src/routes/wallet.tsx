// ===== wallet.tsx =====
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Crown,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { LimitsInfo } from "@/components/LimitsInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHydrated, useMockState } from "@/lib/hooks";
import { formatKES, LIMITS, walletApi, type Transaction } from "@/lib/mockApi";
import { cn, isValidKenyanLocal, localPart } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — ZeniPesa M-Pesa deposits & withdrawals" },
      {
        name: "description",
        content:
          "Top up via M-Pesa STK push, withdraw to your phone, and review your ZeniPesa transaction history.",
      },
      {
        property: "og:title",
        content: "Wallet — ZeniPesa M-Pesa deposits & withdrawals",
      },
      {
        property: "og:description",
        content:
          "Top up via M-Pesa STK push, withdraw to your phone, and review your transaction history.",
      },
    ],
  }),
  component: WalletPage,
});

type DepositStage = "idle" | "pushed" | "polling" | "success" | "failed";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function PhoneField({
  id,
  label,
  value,
  onChange,
  disabled,
  helperText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  helperText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <div className="flex h-12 items-stretch overflow-hidden rounded-full border border-[#d4af37]/30 bg-[#081309] focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37]">
        <span className="flex items-center border-r border-[#d4af37]/15 px-3 text-sm font-semibold text-muted-foreground">
          +254
        </span>
        <Input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 9))
          }
          disabled={disabled}
          className="h-full flex-1 rounded-none border-0 bg-transparent focus:ring-0"
          placeholder="7XXXXXXXX or 1XXXXXXXX"
          autoComplete="tel-national"
        />
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

function WalletPage() {
  const state = useMockState();
  const hydrated = useHydrated();
  const isGuest = !state.session;
  const defaultPhone = localPart(state.session?.user.phone);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-4 p-3 sm:p-5">
        <div className="felt-surface flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <h1 className="font-display text-xl font-extrabold uppercase tracking-[0.15em] flex items-center gap-2 sm:text-2xl">
            <WalletIcon className="size-6 text-[#d4af37]" />
            <span className="engravure-text">Wallet</span>
          </h1>
          <LimitsInfo label="House rules" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => walletApi.setMode("demo")}
            className={cn(
              "felt-surface p-5 text-left transition-all hover:scale-[1.02]",
              state.mode === "demo"
                ? "ring-2 ring-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                : "hover:bg-elevated/40",
            )}
          >
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-[#ffc62e]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {isGuest ? "Demo (Guest)" : "Demo chips"}
              </p>
            </div>
            <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#ffc62e]">
              {hydrated ? `KES ${formatKES(state.balances.demo)}` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {state.mode === "demo" ? "Active for betting" : "Tap to switch"}
            </p>
          </button>

          <button
            onClick={() => walletApi.setMode("real")}
            disabled={isGuest}
            className={cn(
              "felt-surface p-5 text-left transition-all hover:scale-[1.02]",
              isGuest && "opacity-50 cursor-not-allowed",
              state.mode === "real"
                ? "ring-2 ring-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                : "hover:bg-elevated/40",
            )}
          >
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-[#d4af37]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Real balance
              </p>
            </div>
            <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#f8e494]">
              {hydrated ? `KES ${formatKES(state.balances.real)}` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isGuest
                ? "Sign in to access real balance"
                : state.mode === "real"
                  ? "Active for betting"
                  : "Tap to switch"}
            </p>
          </button>
        </div>

        <Tabs defaultValue="deposit">
          <TabsList className="w-full rounded-full border border-[#d4af37]/25 bg-[#081309]/80 p-1">
            <TabsTrigger
              value="deposit"
              className="flex-1 rounded-full data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#e5c75c] data-[state=active]:via-[#d4af37] data-[state=active]:to-[#a47b1e] data-[state=active]:text-[#16150d]"
            >
              <ArrowDownCircle className="size-3 mr-1.5" /> Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="flex-1 rounded-full data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#e5c75c] data-[state=active]:via-[#d4af37] data-[state=active]:to-[#a47b1e] data-[state=active]:text-[#16150d]"
            >
              <ArrowUpCircle className="size-3 mr-1.5" /> Withdraw
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-full data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#e5c75c] data-[state=active]:via-[#d4af37] data-[state=active]:to-[#a47b1e] data-[state=active]:text-[#16150d]"
            >
              <History className="size-3 mr-1.5" /> Transactions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="mt-3">
            <DepositForm defaultPhone={defaultPhone} />
          </TabsContent>
          <TabsContent value="withdraw" className="mt-3">
            <WithdrawForm
              balance={state.balances.real}
              isGuest={isGuest}
              defaultPhone={defaultPhone}
            />
          </TabsContent>
          <TabsContent value="history" className="mt-3">
            <TransactionList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const DEPOSIT_POLL_INTERVAL_MS = 3000;
const DEPOSIT_POLL_MAX_ATTEMPTS = 30;

function DepositForm({ defaultPhone }: { defaultPhone: string }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [amount, setAmount] = useState("500");
  const [stage, setStage] = useState<DepositStage>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const amt = Number(amount);
  const invalid =
    !Number.isFinite(amt) ||
    amt < LIMITS.minDeposit ||
    amt > LIMITS.maxSinglePayout;
  const phoneInvalid = !isValidKenyanLocal(phone);

  async function start() {
    setError(null);
    if (phoneInvalid) {
      setError("Enter a valid M-Pesa number (07... or 01...)");
      return;
    }
    setSubmitting(true);
    const res = await walletApi.depositInitiate(`254${phone}`, amt);
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      return;
    }
    setTxId(res.transactionId);
    setStage("pushed");
    setTimeout(() => setStage("polling"), 900);

    for (let attempt = 1; attempt <= DEPOSIT_POLL_MAX_ATTEMPTS; attempt++) {
      await sleep(DEPOSIT_POLL_INTERVAL_MS);
      const s = await walletApi.depositStatus(res.transactionId);
      if (s.status !== "pending") {
        setStage(s.status === "success" ? "success" : "failed");
        setSubmitting(false);
        if (s.status === "success") {
          toast.success(`Deposit of KES ${formatKES(amt)} confirmed`);
        } else {
          toast.error("Deposit failed or was cancelled");
        }
        return;
      }
    }
    setStage("failed");
    setSubmitting(false);
    toast.error("Deposit timed out. Check your M-Pesa messages, or try again.");
  }

  const busy = submitting || stage === "pushed" || stage === "polling";

  return (
    <div className="felt-surface felt-sheen space-y-4 p-5">
      <PhoneField
        id="dphone"
        label="M-Pesa phone number"
        value={phone}
        onChange={setPhone}
        disabled={busy}
        helperText={
          phone !== "" && phoneInvalid
            ? "Enter a valid number (07... or 01...)"
            : undefined
        }
      />
      <div className="space-y-1.5">
        <Label htmlFor="damount" className="text-muted-foreground">
          Amount (KES)
        </Label>
        <Input
          id="damount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          disabled={busy}
          className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] font-display text-lg font-bold tabular-nums text-[#f8e494] focus:border-[#d4af37] focus:ring-[#d4af37]"
        />
        <p className="text-xs text-muted-foreground">
          Min {LIMITS.minDeposit.toLocaleString()} · Max{" "}
          {LIMITS.maxSinglePayout.toLocaleString()} KES
        </p>
        {invalid && amount !== "" && (
          <p className="text-xs text-danger">Amount outside deposit limits</p>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[300, 500, 1000, 5000].map((q) => (
          <button
            key={q}
            onClick={() => setAmount(String(q))}
            disabled={busy}
            className="rounded-full border border-[#8f6a15] bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] py-2 text-sm font-bold tabular-nums text-[#16150d] shadow-[0_2px_10px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-105 hover:brightness-110 disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}

      {submitting && stage === "idle" && (
        <div className="rounded-2xl border border-[#d4af37]/20 bg-[#081309]/70 p-4 text-sm">
          <p className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-[#d4af37]" />
            Sending STK push...
          </p>
        </div>
      )}

      {stage !== "idle" && (
        <div className="rounded-2xl border border-[#d4af37]/20 bg-[#081309]/70 p-4 text-sm">
          {stage === "pushed" && (
            <p>STK push sent — check your phone and enter your M-Pesa PIN.</p>
          )}
          {stage === "polling" && (
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-[#d4af37]" />
                Waiting for M-Pesa confirmation...
              </p>
              <p className="text-xs text-muted-foreground">
                Please stay on this page until the transaction finishes
                processing.
              </p>
            </div>
          )}
          {stage === "success" && (
            <p className="flex items-center gap-2 font-semibold text-success">
              <CheckCircle className="size-4" /> Deposit confirmed and credited.
            </p>
          )}
          {stage === "failed" && (
            <p className="flex items-center gap-2 font-semibold text-danger">
              <XCircle className="size-4" /> Deposit failed. No funds were
              taken.
            </p>
          )}
        </div>
      )}

      <Button
        onClick={start}
        disabled={busy || invalid || phoneInvalid}
        className="h-12 w-full rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-extrabold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]"
      >
        {busy ? "Processing..." : "Send STK push"}
      </Button>
    </div>
  );
}

function WithdrawForm({
  balance,
  isGuest,
  defaultPhone,
}: {
  balance: number;
  isGuest: boolean;
  defaultPhone: string;
}) {
  const [amount, setAmount] = useState("500");
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amt = Number(amount);
  const gateFailed = balance < LIMITS.minDeposit || isGuest;
  const phoneInvalid = !isValidKenyanLocal(phone);

  async function submit() {
    setError(null);
    if (phoneInvalid) {
      setError("Enter a valid M-Pesa number to withdraw to (07... or 01...)");
      return;
    }
    setLoading(true);
    const res = await walletApi.withdraw(amt, `254${phone}`);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    toast.success(
      "Request has been received, withdrawals will be processed within 24-48 hours",
    );
  }

  return (
    <div className="felt-surface felt-sheen space-y-4 p-5">
      {isGuest && (
        <p className="rounded-2xl border border-[#4a0d10]/60 bg-[#4a0d10]/25 p-3 text-sm text-[#f6ead2]">
          Sign in to withdraw real money. This is a demo account.
        </p>
      )}
      {!isGuest && gateFailed && (
        <p className="rounded-2xl border border-[#d4342c]/40 bg-[#d4342c]/10 p-3 text-sm text-danger">
          Minimum balance of KES {LIMITS.minDeposit} required to withdraw.
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="wamount" className="text-muted-foreground">
          Amount (KES)
        </Label>
        <Input
          id="wamount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] font-display text-lg font-bold tabular-nums text-[#f8e494] focus:border-[#d4af37] focus:ring-[#d4af37]"
        />
        <p className="text-xs text-muted-foreground">
          Min {LIMITS.minDeposit.toLocaleString()} · Max{" "}
          {LIMITS.maxWithdraw.toLocaleString()} KES
        </p>
      </div>
      <PhoneField
        id="wphone"
        label="Withdraw to M-Pesa number"
        value={phone}
        onChange={setPhone}
        helperText={
          phone !== "" && phoneInvalid
            ? "Enter a valid number (07... or 01...)"
            : "Defaults to your signup number, but you can send to a different one"
        }
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        onClick={submit}
        disabled={loading || gateFailed || phoneInvalid}
        className="h-12 w-full rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-extrabold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]"
      >
        {loading ? "Sending..." : "Withdraw to M-Pesa"}
      </Button>
    </div>
  );
}

const TYPES: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
];

function TransactionList() {
  const [type, setType] = useState<string>("all");
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    walletApi
      .transactions()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          let filtered = res.data;
          if (type !== "all") {
            filtered = res.data.filter((t: Transaction) => t.Type === type);
          }
          setItems(filtered);
        } else {
          setLoadError(res.error || "Failed to load transactions");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load transactions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle, color: "text-success", label: "Completed" };
      case "rejected":
      case "failed":
        return { icon: XCircle, color: "text-danger", label: "Failed" };
      default:
        return { icon: Clock, color: "text-muted-foreground", label: status };
    }
  };

  return (
    <div className="felt-surface space-y-3 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-sm text-muted-foreground">
          {items.length} transactions
        </p>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v);
          }}
        >
          <SelectTrigger className="w-36 shrink-0 rounded-full border-[#d4af37]/25 bg-[#081309] focus:border-[#d4af37] focus:ring-[#d4af37]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#d4af37]/25 bg-[#0f2017]">
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading...
        </p>
      )}
      {!loading && loadError && (
        <p className="py-8 text-center text-sm text-danger">{loadError}</p>
      )}
      {!loading && !loadError && items.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No transactions yet.
        </p>
      )}

      <div className="space-y-1.5">
        {items.map((t) => {
          const isCredit = t.Type === "deposit";
          const statusInfo = getStatusStyle(t.Status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={t.ID}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[#d4af37]/15 bg-[#081309]/70 p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isCredit ? (
                  <ArrowDownCircle className="size-4 text-success shrink-0" />
                ) : (
                  <ArrowUpCircle className="size-4 text-danger shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold capitalize">
                    {t.Type}
                    {t.MpesaReceipt ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {t.MpesaReceipt}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(t.CreatedAt).toLocaleString("en-KE")}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "font-display font-bold tabular-nums",
                    isCredit ? "text-success" : "text-foreground",
                  )}
                >
                  {isCredit ? "+" : "−"}
                  {formatKES(t.Amount)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <StatusIcon className={cn("size-3", statusInfo.color)} />
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-widest",
                      statusInfo.color,
                    )}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
