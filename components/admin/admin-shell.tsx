"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShellSkeleton } from "@/components/dashboard/dashboard-shell-skeleton";
import { SignOutModal } from "@/components/dashboard/sign-out-modal";
import { Drawer } from "@/components/ui/drawer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/lib/auth";
import { getAdminPageTitle } from "@/lib/admin-navigation";

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.app_metadata?.role !== "admin")) {
      router.replace("/admin");
      return;
    }

    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the theme applied before hydration
      setDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, [loading, router, user]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin");
  };

  if (loading) return <DashboardShellSkeleton />;
  if (!user || user.app_metadata?.role !== "admin") return null;

  const pageTitle = getAdminPageTitle(pathname);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-background lg:flex">
        <AdminDrawer currentPath={pathname} onSignOutClick={() => setShowSignOutModal(true)} />
      </aside>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} position="left" showCloseButton={false}>
        <AdminDrawer currentPath={pathname} onClose={() => setDrawerOpen(false)} onSignOutClick={() => { setDrawerOpen(false); setShowSignOutModal(true); }} />
      </Drawer>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => void handleSignOut()}
        heading="Leave the admin portal?"
        description="You will need to sign in again to manage internal operations."
      />

      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:left-64">
        <div className="hidden h-full lg:block">
          <DashboardHeader pageTitle={pageTitle} userName={user.user_metadata?.full_name || "Administrator"} userEmail={user.email} darkMode={darkMode} onToggleTheme={toggleDarkMode} />
        </div>
        <div className="flex h-full items-center justify-between px-4 lg:hidden">
          <p className="text-base font-semibold tracking-tight">{pageTitle}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={toggleDarkMode} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={darkMode ? "Use light theme" : "Use dark theme"}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button type="button" onClick={() => setDrawerOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={drawerOpen ? "Close menu" : "Open menu"} aria-expanded={drawerOpen}>
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main id="admin-content" className="min-h-dvh bg-muted/15 pt-16 lg:pl-64">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
