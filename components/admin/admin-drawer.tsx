"use client";

import { LayoutDashboard, LogOut, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { adminNavigation, isAdminRouteActive } from "@/lib/admin-navigation";

interface AdminDrawerProps {
  currentPath: string;
  onClose?: () => void;
  onSignOutClick: () => void;
}

const icons = {
  dashboard: LayoutDashboard,
  partners: Users,
};

export function AdminDrawer({ currentPath, onClose, onSignOutClick }: AdminDrawerProps) {
  return (
    <div className="flex h-full w-full flex-col bg-background/95 backdrop-blur-sm">
      <div className="relative h-16 border-b border-border/50 px-5">
        <Link href="/admin/dashboard" className="flex h-full items-center" onClick={onClose} aria-label="Admin dashboard">
          <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={132} height={32} className="h-8 w-auto dark:hidden" priority />
          <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={132} height={32} className="hidden h-8 w-auto dark:block" priority />
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-5 pb-2 pt-5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary">Administration</p>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {adminNavigation.map((link) => {
          const active = isAdminRouteActive(currentPath, link.href);
          const Icon = icons[link.icon];
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} onClick={onClose} className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary dark:bg-primary/15" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />}
              <Icon className="h-5 w-5" />
              <span className="flex-1">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/50 p-3">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive dark:hover:bg-destructive/10" onClick={onSignOutClick}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
