"use client";

import { useAuth } from "@/lib/auth";
import { getDashboardPageTitle } from "@/lib/dashboard-navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { DashboardDrawer } from "@/components/navigation/dashboard-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SignOutModal } from "@/components/dashboard/sign-out-modal";
import { Menu, Moon, Sun, X } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DashboardShellSkeleton } from "@/components/dashboard/dashboard-shell-skeleton";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
      return;
    }

    if (user) {
      const isDark = document.documentElement.classList.contains("dark");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the control with the theme applied before hydration
      setDarkMode(isDark);
    }
  }, [user, loading, router]);

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
  };

  if (loading) return <DashboardShellSkeleton />;
  if (!user) return null;

  const pageTitle = getDashboardPageTitle(pathname);

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-background lg:flex">
        <DashboardDrawer
          currentPath={pathname}
          onSignOutClick={() => setShowSignOutModal(true)}
        />
      </aside>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        showCloseButton={false}
      >
        <DashboardDrawer
          currentPath={pathname}
          onClose={() => setDrawerOpen(false)}
          onSignOutClick={() => {
            setDrawerOpen(false);
            setShowSignOutModal(true);
          }}
        />
      </Drawer>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={signOut}
      />

      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:left-64">
        <div className="hidden h-full lg:block">
          <DashboardHeader
            pageTitle={pageTitle}
            userName={user.user_metadata?.full_name}
            userEmail={user.email}
            darkMode={darkMode}
            onToggleTheme={toggleDarkMode}
          />
        </div>

        <div className="flex h-full items-center justify-between px-4 lg:hidden">
          <p className="text-base font-semibold tracking-tight">{pageTitle}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={toggleDarkMode} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={darkMode ? "Use light theme" : "Use dark theme"}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main id="dashboard-content" className="min-h-dvh bg-muted/15 pt-16 lg:pl-64">
        {!isOnline && (
          <div role="status" className="border-b border-border/70 bg-muted px-5 py-2.5 text-center text-xs font-medium text-muted-foreground">
            You are offline. Saved pages remain visible, but account and progress updates will resume when your connection returns.
          </div>
        )}
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
