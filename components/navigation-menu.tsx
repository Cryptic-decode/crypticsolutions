"use client";

import { Button } from "@/components/ui/button";
import { Mail, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavigationMenuProps {
  onClose: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  variant?: "home" | "ielts";
}

export function NavigationMenu({
  onClose,
  darkMode,
  toggleDarkMode,
  variant = "home"
}: NavigationMenuProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose();
    }
  };

  return (
    <div className="p-6 flex flex-col h-[100vh]">
      {/* Navigation Links */}
      <nav className="space-y-1">
        {variant === "home" ? (
          <>
            <a 
              href="#services" 
              className="flex items-center text-base font-semibold text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/50 rounded-lg p-3 transition-all"
              onClick={(e) => handleNavClick(e, "services")}
            >
              Services
            </a>
            <a 
              href="#products" 
              className="flex items-center text-base font-semibold text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/50 rounded-lg p-3 transition-all"
              onClick={(e) => handleNavClick(e, "products")}
            >
              Products
            </a>
            <a 
              href="#contact" 
              className="flex items-center text-base font-semibold text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/50 rounded-lg p-3 transition-all"
              onClick={(e) => handleNavClick(e, "contact")}
            >
              Contact
            </a>
          </>
        ) : (
          <Link 
            href="/" 
            className="flex items-center text-base font-semibold text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/50 rounded-lg p-3 transition-all"
            onClick={onClose}
          >
            Back to Home
          </Link>
        )}
      </nav>

      {/* Theme Toggle */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all">
          <span className="text-base font-semibold text-[#1B2242] dark:text-white">Theme</span>
          <button
            onClick={() => {
              toggleDarkMode();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <motion.div whileTap={{ scale: 0.98 }}>
          {variant === "home" ? (
            <Button asChild size="lg" className="w-full">
              <a 
                href="#products" 
                onClick={(e) => handleNavClick(e, "products")}
              >
                Get Started
              </a>
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="w-full cursor-pointer"
              onClick={() => {
                const element = document.getElementById('pricing');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                onClose();
              }}
            >
              Get the Manual – ₦5,000
            </Button>
          )}
        </motion.div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-6 border-t space-y-2">
        <a 
          href="mailto:crypticsolutions.contact@gmail.com"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-3 rounded-lg hover:bg-secondary/50"
        >
          <Mail className="h-4 w-4" />
          Contact Us
        </a>
      </div>
    </div>
  );
}
