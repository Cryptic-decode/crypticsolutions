"use client";

import { Moon, Sun, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ProductNavProps {
  /** Text for the CTA button (e.g. "Get the Manual – ₦5,000") */
  ctaLabel: string;
  /** Called when the CTA button or sticky CTA is clicked */
  onCtaClick: () => void;
  /** Optional: dark mode override from parent */
  darkMode?: boolean;
  /** Optional: dark mode toggle from parent */
  onToggleDarkMode?: () => void;
}

export function ProductNav({ ctaLabel, onCtaClick, darkMode: externalDarkMode, onToggleDarkMode }: ProductNavProps) {
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const darkMode = externalDarkMode ?? internalDarkMode;

  const toggleDarkMode = onToggleDarkMode ?? (() => {
    const newMode = !internalDarkMode;
    setInternalDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark =
        localStorage.getItem("theme") === "dark" ||
        !localStorage.getItem("theme");
      setInternalDarkMode(isDark);
    }
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/cryptic-assets/fullLogo.png"
                alt="Cryptic Solutions"
                width={180}
                height={45}
                className="h-[45px] w-auto dark:hidden"
                priority
              />
              <Image
                src="/cryptic-assets/fullLogo2.png"
                alt="Cryptic Solutions"
                width={180}
                height={45}
                className="h-[45px] w-auto hidden dark:block"
                priority
              />
            </Link>

            <div className="flex items-center gap-4">
              {/* Desktop CTA */}
              <motion.div
                className="hidden md:block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={onCtaClick}
                >
                  {ctaLabel}
                </Button>
              </motion.div>

              <button
                onClick={toggleDarkMode}
                className="hidden md:block p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: mobileMenuOpen ? 100 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          className="w-full text-base h-12 cursor-pointer"
          onClick={onCtaClick}
        >
          {ctaLabel}
        </Button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 top-16 z-40 md:hidden bg-background/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <Link
              href="/"
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                toggleDarkMode();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="text-base">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
