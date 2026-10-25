"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MainDrawer } from "@/components/navigation/main-drawer";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useAuth } from "@/lib/auth";

interface SiteHeaderLink {
  href: string;
  label: string;
  onClick?: () => void;
}

interface SiteHeaderProps {
  links: SiteHeaderLink[];
  activeHref?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  onLogoClick?: () => void;
}

export function SiteHeader({ links, activeHref, ctaLabel, onCtaClick, onLogoClick }: SiteHeaderProps) {
  const { user, loading: authLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the theme applied before hydration
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const linkClassName = (href: string) =>
    `relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:bg-primary after:transition-transform ${
      activeHref === href
        ? "text-foreground after:scale-x-100"
        : "text-muted-foreground after:scale-x-0 hover:text-foreground"
    }`;

  const drawerLinks = [
    ...links.map((link) => ({
      href: link.href,
      label: link.label,
      onClick: link.onClick
        ? (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            link.onClick?.();
          }
        : undefined,
    })),
    ...(!authLoading
      ? [{ href: user ? "/dashboard" : "/signin", label: user ? "Dashboard" : "Sign in" }]
      : []),
  ];

  const logo = (
    <>
      <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={150} height={38} className="h-9 w-auto dark:hidden" priority />
      <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={150} height={38} className="hidden h-9 w-auto dark:block" priority />
    </>
  );

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl" aria-label="Main navigation">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-8">
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick} aria-label="Back to top">
              {logo}
            </button>
          ) : (
            <Link href="/" aria-label="Cryptic Solutions home">
              {logo}
            </Link>
          )}

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activeHref === link.href ? "location" : undefined}
                className={linkClassName(link.href)}
                onClick={(event) => {
                  if (!link.onClick) return;
                  event.preventDefault();
                  link.onClick();
                }}
              >
                {link.label}
              </Link>
            ))}
            {!authLoading && (
              <Link href={user ? "/dashboard" : "/signin"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {user ? "Dashboard" : "Sign in"}
              </Link>
            )}
            <button type="button" onClick={toggleDarkMode} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={darkMode ? "Use light theme" : "Use dark theme"}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button type="button" className="h-10 px-5" onClick={onCtaClick}>{ctaLabel}</Button>
          </div>

          <button type="button" className="rounded-md p-2 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <MainDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onClose={() => setMobileMenuOpen(false)}
          links={drawerLinks}
          ctaButton={{ label: ctaLabel, onClick: onCtaClick }}
          activeHref={activeHref}
        />
      </Drawer>
    </>
  );
}
