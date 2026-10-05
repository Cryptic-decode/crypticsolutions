"use client";

import { LayoutDashboard, LogOut, Moon, Sun, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/partners", label: "Partners", icon: Users },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate client-only theme preference
    setDarkMode(localStorage.getItem("theme") !== "light");
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/admin/dashboard" aria-label="Admin dashboard">
            <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={140} height={35} className="h-8 w-auto dark:hidden" priority />
            <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={140} height={35} className="hidden h-8 w-auto dark:block" priority />
          </Link>

          <nav aria-label="Administration" className="hidden items-center gap-1 sm:flex">
            {adminLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">{darkMode ? <Sun /> : <Moon />}</Button>
            <Button variant="ghost" size="icon" onClick={() => void handleSignOut()} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
        <nav aria-label="Mobile administration" className="mx-auto flex max-w-7xl border-t border-border/60 px-3 sm:hidden">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
