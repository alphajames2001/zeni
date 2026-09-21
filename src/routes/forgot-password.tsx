import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/mockApi";
import { Phone, Key, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — ZeniPesa" },
      {
        name: "description",
        content:
          "Reset your ZeniPesa password using an SMS one-time code sent to your phone.",
      },
      { property: "og:title", content: "Reset password — ZeniPesa" },
      {
        property: "og:description",
        content:
          "Reset your ZeniPesa password using an SMS one-time code sent to your phone.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

type Step = "phone" | "otp" | "password";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (step === "phone") {
      const res = await authApi.forgotPassword(phone);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      toast.success(`Code sent by SMS to ${phone}`);
      return setStep("otp");
    }
    if (step === "otp") {
      const res = await authApi.verifyOtp(otp);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      return setStep("password");
    }
    if (password !== confirm) {
      setLoading(false);
      return setError("Passwords do not match");
    }
    const res = await authApi.resetPassword(password);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    toast.success("Password updated — you can log in now");
    navigate({ to: "/login" });
  }

  const copy = {
    phone: {
      title: "Forgot password",
      sub: "Enter the phone number on your account.",
      icon: Phone,
    },
    otp: {
      title: "Verify your phone",
      sub: `We sent a 6-digit code to ${phone}.`,
      icon: Key,
    },
    password: {
      title: "Set a new password",
      sub: "Choose a password of at least 8 characters.",
      icon: Lock,
    },
  }[step];

  const Icon = copy.icon;

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.sub}
      footer={
        <Link
          to="/login"
          className="flex items-center gap-1 font-semibold text-[#d4af37] hover:underline"
        >
          <ArrowLeft className="size-3" />
          Back to log in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-1.5">
          {(["phone", "otp", "password"] as Step[]).map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full ${
                ["phone", "otp", "password"].indexOf(step) >= i
                  ? "bg-primary"
                  : "bg-elevated"
              }`}
            />
          ))}
        </div>

        {step === "phone" && (
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-muted-foreground">
              Phone number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                inputMode="tel"
                placeholder="254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-9 focus:border-[#d4af37] focus:ring-[#d4af37]"
              />
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-muted-foreground">
              6-digit code
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] text-center font-display text-xl font-extrabold tracking-[0.5em] pl-9 focus:border-[#d4af37] focus:ring-[#d4af37]"
              />
            </div>
          </div>
        )}

        {step === "password" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="new" className="text-muted-foreground">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="new"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-9 focus:border-[#d4af37] focus:ring-[#d4af37]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-muted-foreground">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-12 rounded-full border-[#d4af37]/30 bg-[#081309] pl-9 focus:border-[#d4af37] focus:ring-[#d4af37]"
                />
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-gradient-to-b from-[#e5c75c] via-[#d4af37] to-[#a47b1e] font-display font-extrabold uppercase tracking-wide text-[#16150d] shadow-[0_3px_14px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,244,200,0.7)] transition-all hover:scale-[1.02] hover:brightness-110 border border-[#8f6a15]"
        >
          {loading
            ? "Please wait..."
            : step === "password"
              ? "Update password"
              : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
