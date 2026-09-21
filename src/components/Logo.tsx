import logoUrl from "@/assets/zenipesa-logo.svg";

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img src={logoUrl} alt="ZeniPesa" className={className} />
    </span>
  );
}
