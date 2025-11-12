"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { DashboardDrawer } from "@/components/navigation/dashboard-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SignOutModal } from "@/components/dashboard/sign-out-modal";
import { Menu, X, Loader2 } from "lucide-react";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!loading && !user) {
      router.push("/signin");
      return;
    }

    if (user && typeof window !== "undefined") {
      const isDark =
        localStorage.getItem("theme") === "dark" ||
        !localStorage.getItem("theme");
      setDarkMode(isDark);
    }
  }, [user, loading, router]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      <ScrollBackdrop intensity={0.8} />
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-80 border-r border-border/50 bg-background z-30">
        <DashboardDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onSignOut={signOut}
          currentPath={pathname}
          onSignOutClick={() => setShowSignOutModal(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        showCloseButton={false}
      >
        <DashboardDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onSignOut={signOut}
          onClose={() => setDrawerOpen(false)}
          currentPath={pathname}
          onSignOutClick={() => setShowSignOutModal(true)}
        />
      </Drawer>

      {/* Sign Out Confirmation Modal - Rendered at page level */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={signOut}
      />

      {/* Main Content */}
      <main className="lg:pl-80 pt-16 lg:pt-16 w-full">
        {/* Desktop Header */}
        <div className="hidden lg:block fixed top-0 left-80 right-0 z-40">
          <DashboardHeader
            userName={user.user_metadata?.full_name}
            userEmail={user.email}
          />
        </div>

        {/* Mobile Header with Menu */}
        <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur transition-all ${drawerOpen ? 'z-40' : 'z-50'}`}>
          <div className="flex items-center justify-between h-full px-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
            >
              {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

