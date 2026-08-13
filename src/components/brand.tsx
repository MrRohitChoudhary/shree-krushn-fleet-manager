import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  size = "md",
  showTagline = true,
  invert = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  invert?: boolean;
}) {
  const dim = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={COMPANY.logo}
        alt={`${COMPANY.name} logo`}
        className={cn(dim, "shrink-0 rounded-full object-cover ring-1 ring-accent/40")}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tracking-tight",
            size === "lg" ? "text-xl" : "text-sm",
            invert ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          {COMPANY.name}
        </p>
        {showTagline && (
          <p
            className={cn(
              "truncate text-xs",
              invert ? "text-sidebar-foreground/70" : "text-muted-foreground",
            )}
          >
            {COMPANY.tagline}
          </p>
        )}
      </div>
    </div>
  );
}

export function CompanyFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border px-4 py-4 text-center text-xs text-muted-foreground", className)}>
      <p className="font-medium text-foreground">{COMPANY.name}</p>
      <p>
        Contact: {COMPANY.phones.join(" / ")} · {COMPANY.tagline}
      </p>
    </footer>
  );
}

export function ReportBrandHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-4">
      <Brand size="md" showTagline={false} />
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <p className="text-xs text-muted-foreground">{COMPANY.phones.join(" / ")}</p>
      </div>
    </div>
  );
}
