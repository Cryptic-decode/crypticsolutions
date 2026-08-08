"use client";

import { Mail, Linkedin, Instagram, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/ui/tiktok-icon";
import Image from "next/image";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/contact";

interface FooterLink {
  href: string;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface FooterProps {
  /** Optional override for quick links. Uses smooth-scroll anchors when provided, Link to "/" otherwise. */
  quickLinks?: FooterLink[];
}

const socialLinks = [
  { href: "https://www.tiktok.com/@cryptic.solutions?_r=1&_t=ZS-93LUV85mxZV", label: "TikTok", icon: TikTokIcon },
  { href: "https://www.instagram.com/cryptic.solutions?igsh=dTR2dW5oaWc4amg4", label: "Instagram", icon: Instagram },
  { href: "https://www.linkedin.com/in/cryptic-solutions-5ba56b397?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", label: "LinkedIn", icon: Linkedin },
  { href: "https://www.youtube.com/@crypticsolutionsltd", label: "YouTube", icon: Youtube },
] as const;

export function SiteFooter({ quickLinks }: FooterProps) {
  const defaultQuickLinks: FooterLink[] = [
    { href: "/", label: "Home" },
    { href: "/#products", label: "Products" },
    { href: "/#about", label: "What we build" },
    { href: "/#contact", label: "Contact" },
  ];

  const links = quickLinks ?? defaultQuickLinks;

  return (
    <footer className="border-t bg-secondary/30 py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div
                className="flex items-center cursor-pointer mb-4"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Image
                  src="/cryptic-assets/fullLogo.png"
                  alt="Cryptic Solutions"
                  width={160}
                  height={40}
                  className="h-[40px] w-auto dark:hidden"
                />
                <Image
                  src="/cryptic-assets/fullLogo2.png"
                  alt="Cryptic Solutions"
                  width={160}
                  height={40}
                  className="h-[40px] w-auto hidden dark:block"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Building digital excellence, one product at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-[#1B2242] dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.onClick ? (
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={link.onClick}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-[#1B2242] dark:text-white mb-4">Products</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/ielts-manual"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    IELTS Manual
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prompt-engineering-ebook"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Prompt Engineering Ebook
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground">Quickland</span>
                  <span className="ml-2 text-xs text-primary">Coming Soon</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-[#1B2242] dark:text-white mb-4">Get in Touch</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="hover:text-primary transition-colors"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
              <div className="flex items-center gap-3 mt-4">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} Cryptic Solutions. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Building Digital Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
