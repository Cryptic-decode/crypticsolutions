"use client";

import { Button } from "@/components/ui/button";
import { Mail, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface MainDrawerProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onClose: () => void;
  links: Array<{
    href: string;
    label: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  }>;
  ctaButton?: {
    label: string;
    onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  };
}

export function MainDrawer({
  darkMode,
  toggleDarkMode,
  onClose,
  links,
  ctaButton
}: MainDrawerProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/cryptic-assets/fullLogo.png" 
            alt="Cryptic Solutions" 
            width={140} 
            height={35}
            className="h-[35px] w-auto dark:hidden"
          />
          <Image
            src="/cryptic-assets/fullLogo2.png" 
            alt="Cryptic Solutions" 
            width={140} 
            height={35}
            className="h-[35px] w-auto hidden dark:block"
          />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            // Check if it's an external link (starts with /)
            const isExternalLink = link.href.startsWith('/');
            
            return (
              <a 
                key={link.href}
                href={link.href}
                className="flex items-center text-lg md:text-base font-semibold text-[#1B2242] dark:text-white 
                         hover:text-primary hover:bg-secondary/50 rounded-lg p-4 md:p-3 transition-all cursor-pointer"
                onClick={(e) => {
                  if (isExternalLink) {
                    // For external links, just close drawer and let browser navigate
                    onClose();
                  } else {
                    // For anchor links, prevent default and handle scroll
                    e.preventDefault();
                    if (link.onClick) link.onClick(e);
                    onClose();
                  }
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle */}
      <div className="mt-auto p-6 pt-0">
        <div className="border-t pt-6">
          <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
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
        {ctaButton && (
          <div className="mt-6">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button 
                size="lg" 
                className="w-full cursor-pointer"
                onClick={() => {
                  if (ctaButton.onClick) {
                    ctaButton.onClick();
                  }
                  onClose();
                }}
              >
                {ctaButton.label}
              </Button>
            </motion.div>
          </div>
        )}

        {/* Contact Link */}
        <div className="mt-6 pt-6 border-t">
          <a 
            href="mailto:crypticsolutions.contact@gmail.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-3"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
