import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/15 px-4 py-10 text-foreground sm:px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center" aria-label="Cryptic Solutions home">
          <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={160} height={40} className="h-10 w-auto dark:hidden" priority />
          <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={160} height={40} className="hidden h-10 w-auto dark:block" priority />
        </Link>

        <Card className="gap-0 p-6 sm:p-8">
          <header className="text-center">
            {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
            <h1 className={`${eyebrow ? "mt-3" : ""} text-3xl font-semibold tracking-[-0.04em]`}>{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          </header>
          <div className="mt-8">{children}</div>
        </Card>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
