import { cn } from "@/lib/utils";

export function DashboardPageFrame({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12", className)}
      {...props}
    />
  );
}

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function DashboardPageHeader({ eyebrow, title, description, action }: DashboardPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

interface DashboardSectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardSectionHeader({ title, description, action }: DashboardSectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
