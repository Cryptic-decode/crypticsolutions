"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { DashboardDrawer } from "@/components/navigation/dashboard-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Menu } from "lucide-react";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }

    // Check theme
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme'));
      setDarkMode(isDark);
    }
  }, [user, router]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      <ScrollBackdrop intensity={0.8} />
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-80 border-r bg-background">
        <DashboardDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onSignOut={signOut}
          currentPath={pathname}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
      >
        <DashboardDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onSignOut={signOut}
          onClose={() => setDrawerOpen(false)}
          currentPath={pathname}
        />
      </Drawer>

      {/* Main Content */}
      <main className="lg:pl-80 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <DashboardHeader 
            userName={user.user_metadata?.full_name}
            userEmail={user.email}
          />
        </div>
        
        {/* Mobile Header with Menu */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50">
          <div className="flex items-center justify-between h-full px-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
}