// ===== login.tsx =====
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/mockApi";
import { Mail, Lock, KeyRound } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ZeniPesa" },
      {
        name: "description",
        content:
          "Sign in to your ZeniPesa account to play crash and manage your M-Pesa wallet.",
      },
      { property: "og:title", content: "Log in — ZeniPesa" },
      {
        property: "og:description",
        content:
          "Sign in to your ZeniPesa account to play crash and manage your M-Pesa wallet.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const res = await authApi.login(email, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    toast.success(
      `Welcome back to the table, ${res.session.user.displayName || res.session.user.username}`,
    );
    navigate({ to: "/" });
  }

  return (
    <AuthShell
      title="Welcome back, high roller"
      subtitle="Log in with your email address to take your seat."
      footer={
        <>
          New to ZeniPesa?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#d4af37] hover:underline"
          >
            Open an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-muted-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-muted-foreground">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-[#d4af37]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-12 focus:border-[#d4af37] focus:ring-[#d4af37]"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-extrabold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]"
        >
          {loading ? "Dealing..." : "Log in"}
        </Button>
        <p className="rounded-2xl border border-[#d4af37]/15 bg-[#081309]/60 p-3 text-xs text-muted-foreground">
          Demo accounts:{" "}
          <span className="font-semibold text-[#f8e494]">user1 … user200</span>,
          shared password{" "}
          <span className="font-semibold text-[#f8e494]">demo1234</span>.
          <br />
          <span className="text-[10px] text-muted-foreground/70">
            Or sign up with your own email and username.
          </span>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Watermark suit corners */}
      <span className="pointer-events-none absolute -left-4 top-8 rotate-[-18deg] font-display text-[160px] text-[#d4af37]/5">
        ◆
      </span>
      <span className="pointer-events-none absolute -right-4 bottom-4 rotate-[18deg] font-display text-[180px] text-[#d4af37]/5">
        ◆
      </span>
      <span className="pointer-events-none absolute right-8 top-6 rotate-12 font-display text-7xl text-[#d4342c]/5">
        ♠
      </span>
      <span className="pointer-events-none absolute bottom-10 left-10 -rotate-12 font-display text-7xl text-[#d4342c]/5">
        ♥
      </span>

      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center drop-shadow-[0_4px_18px_rgba(212,175,55,0.25)]">
          <Link to="/">
            <Logo className="h-12" />
          </Link>
        </div>
        <div className="felt-surface gold-frame felt-sheen p-6 sm:p-8">
          <h1 className="engravure-text font-display text-2xl font-extrabold tracking-wide">
            {title}
          </h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
        {footer && (
          <p className="mt-6 flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
            <KeyRound className="size-3.5 text-[#d4af37]/60" />
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
