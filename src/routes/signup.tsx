// ===== signup.tsx =====
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/lib/mockApi";
import { isValidKenyanLocal } from "@/lib/utils";
import { User, Mail, Phone, Lock, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — ZeniPesa" },
      {
        name: "description",
        content:
          "Open a ZeniPesa account in seconds and start playing crash with M-Pesa deposits.",
      },
      { property: "og:title", content: "Create account — ZeniPesa" },
      {
        property: "og:description",
        content:
          "Open a ZeniPesa account in seconds and start playing crash with M-Pesa deposits.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm((f) => ({ ...f, phone: digits }));
  };
  const phoneValid = isValidKenyanLocal(form.phone);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.username.length < 3) {
      return setError("Username must be at least 3 characters");
    }
    if (form.username.length > 30) {
      return setError("Username must be less than 30 characters");
    }
    if (!form.email || !form.email.includes("@")) {
      return setError("Enter a valid email address");
    }
    if (!phoneValid) {
      return setError("Enter a valid M-Pesa number (07... or 01...)");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }
    if (!terms) {
      return setError("You must accept the terms to continue");
    }

    setLoading(true);
    const res = await authApi.signup({
      username: form.username,
      email: form.email,
      phone: `254${form.phone}`,
      password: form.password,
    });
    setLoading(false);

    if (!res.ok) {
      return setError(res.error);
    }

    toast.success("Account created — KES 50,000 demo chips added");
    navigate({ to: "/" });
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="You must be 18+ to play. Demo chips included."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#d4af37] hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-muted-foreground">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              value={form.username}
              onChange={set("username")}
              className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
              placeholder="Choose a unique username"
              autoComplete="username"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            3-30 characters, letters and numbers only
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-muted-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-muted-foreground">
            M-Pesa phone number
          </Label>
          <div className="flex h-12 items-stretch overflow-hidden rounded-full border border-[#d4af37]/30 bg-[#081309] focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37]">
            <span className="flex items-center border-r border-[#d4af37]/15 px-4 text-sm font-semibold text-muted-foreground">
              +254
            </span>
            <Input
              id="phone"
              inputMode="numeric"
              value={form.phone}
              onChange={setPhone}
              className="h-full flex-1 rounded-none border-0 bg-transparent focus:ring-0"
              placeholder="7XXXXXXXX or 1XXXXXXXX"
              autoComplete="tel-national"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Used for M-Pesa deposits and withdrawals — you can use a different
            number later
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={set("password")}
                className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
                autoComplete="new-password"
                placeholder="Min 8 characters"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-muted-foreground">
              Confirm password
            </Label>
            <div className="relative">
              <CheckCircle className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 text-xs text-muted-foreground">
          <Checkbox
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            className="mt-0.5 rounded border-[#d4af37]/40 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37] data-[state=checked]:text-[#16150d]"
          />
          <span>
            I am 18 or older and accept the Terms & Conditions and Privacy
            Policy.
          </span>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-extrabold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]"
        >
          {loading ? "Opening account..." : "Create account"}
        </Button>

        <p className="rounded-2xl border border-[#d4af37]/15 bg-[#081309]/60 p-3 text-xs text-muted-foreground">
          By creating an account, you get:
          <br />
          <span className="text-[10px] text-muted-foreground/70">
            • KES 50,000 demo chips to practice
            <br />
            • Real money play with M-Pesa deposits
            <br />• Provably fair crash game
          </span>
        </p>
      </form>
    </AuthShell>
  );
}
