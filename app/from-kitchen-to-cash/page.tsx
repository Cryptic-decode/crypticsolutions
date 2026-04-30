"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowUp,
  ChefHat,
  CheckCircle2,
  ClipboardList,
  Instagram,
  LayoutGrid,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Drawer } from "@/components/ui/drawer";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";

const INSTAGRAM_HREF = "https://www.instagram.com/lydeisbakes";

function getWhatsAppHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_FROM_KITCHEN_TO_CASH_WHATSAPP;
  if (!raw?.trim()) return null;
  return raw.trim();
}

export default function FromKitchenToCashPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappHref = getWhatsAppHref();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");

    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hadDark) html.classList.add("dark");
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-orange-200 relative overflow-hidden">
      <ScrollBackdrop />
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              className="flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
            >
              <Image
                src="/lydei-assets/LydeisLogo.jpg"
                alt="Lydeis Bakes"
                width={160}
                height={160}
                className="h-11 w-auto rounded-md object-contain border border-border/60 bg-background"
                priority
              />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
            <div className="p-6 space-y-5">
              <Link
                href="/"
                className="block text-lg font-semibold text-orange-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Back to Cryptic Solutions
              </Link>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  window.open(INSTAGRAM_HREF, "_blank", "noopener,noreferrer");
                  setMobileMenuOpen(false);
                }}
              >
                View on Instagram
              </Button>
            </div>
          </Drawer>
        </div>
      </nav>

      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-x-4 md:inset-x-6 lg:inset-x-8 top-16 h-[88%] rounded-3xl bg-gradient-to-br from-orange-300/80 via-amber-200/75 to-orange-400/70 -z-10 shadow-[0_20px_80px_rgba(194,65,12,0.20)]" />
        <motion.div
          className="max-w-4xl mx-auto text-center rounded-3xl px-6 py-8 md:px-10 md:py-12 bg-white/80 border border-orange-300/80 shadow-xl"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cryptic Solutions</span>
          </Link>

          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Image
              src="/lydei-assets/LydeisLogo.jpg"
              alt="Lydeis Bakes — From Kitchen to Cash"
              width={280}
              height={280}
              className="h-40 md:h-48 w-auto rounded-xl border border-border shadow-sm object-contain bg-card"
              priority
            />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-orange-900"
            variants={fadeInUp}
          >
            From Kitchen to Cash
          </motion.h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            A two-part Nigerian catering ebook—in partnership between{" "}
            <strong>Lydeis Bakes</strong> and <strong>Cryptic Solutions</strong>. Foundations
            before the fancy menu magic: honesty about costs and pitfalls, then menus, costing,
            and templates you can use right away.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
            <Button size="lg" className="h-12" asChild>
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 mr-2" aria-hidden />
                @lydeisbakes — Get yours
              </a>
            </Button>
            {whatsappHref ? (
              <Button size="lg" variant="outline" className="h-12 hover:bg-primary/5" asChild>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-orange-300/70 shadow-md">
              <Image
                src="/lydei-assets/pastryStore-front.jpeg"
                alt="Lydeis pastry display"
                width={900}
                height={700}
                className="h-56 w-full object-cover"
                priority
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-orange-300/70 shadow-md">
              <Image
                src="/lydei-assets/pastryPresentation.jpeg"
                alt="Pastry presentation from Lydeis Bakes"
                width={900}
                height={700}
                className="h-56 w-full object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-orange-900">
            Who this is for
          </h2>
          <Card className="p-8 text-muted-foreground text-lg leading-relaxed border-orange-300 bg-orange-50 shadow-[0_10px_40px_rgba(194,65,12,0.20)]">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                Nigerians dreaming of—or already growing—a catering hustle.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                Caterers tired of guessing prices and losing money quietly.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                Entrepreneurs wanting straight talk on costs and pitfalls before pretty menus.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                Anyone who prefers structure, summaries, exercises, and templates over vibes alone.
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 rounded-3xl bg-gradient-to-b from-orange-100 to-amber-100">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-200">
                <ChefHat className="h-6 w-6 text-orange-700" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-orange-900">
                Part One — Foundations &amp; intro
              </h2>
            </div>
            <Card className="p-8 space-y-4 text-muted-foreground border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-[0_10px_40px_rgba(180,83,9,0.18)]">
              <p>
                <strong className="text-foreground">Introduction</strong> — How to use both parts together
                and what makes this different from vague “grow your hustle” fluff.
              </p>
              <p>
                <strong className="text-foreground">Foundations before menu design</strong> — Reality check on
                what running a catering business actually costs (time, ingredient volatility, staffing,
                overheads)—without sugarcoating. Understand common pitfalls{" "}
                <em>before</em> you spend money on menus and flyers.
              </p>
              <p>
                Saves you costly trial-and-error: you&apos;ll know what&apos;s realistic and what bites back.
              </p>
              <p>
                Built-in takeaway exercises along the journey: apply as you read, so you aren&apos;t just
                collecting theory.
              </p>
              <p className="pt-2 border-t border-border">
                <strong className="text-foreground flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-orange-700 shrink-0" />
                  Takeaway Pack (PDF)
                </strong>{" "}
                Summary of Part One reflections + workbook-style exercises aligned with{" "}
                <strong className="text-foreground">Part Two&apos;s takeaway exercise book</strong>.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-200">
                <LayoutGrid className="h-6 w-6 text-orange-700" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-orange-900">
                Part Two — Menu, maths &amp; takeaway tools
              </h2>
            </div>
            <Card className="p-8 space-y-3 text-muted-foreground border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-[0_10px_40px_rgba(194,65,12,0.18)]">
              <ul className="space-y-3 list-none">
                {[
                  "Menu planning + design fundamentals",
                  "Pricing that matches your realities (not TikTok guesses)",
                  "Recipe costing essentials",
                  "Detailed costing walkthrough—you see the maths, step by step",
                  "Practice costing exercises to lock it in",
                  "Printable/copy-paste takeaway costing sheets",
                  "Standalone takeaway costing exercise workbook",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm pt-4 border-t border-border">
                Part Two is where the spreadsheets meet the plates—after your mindset is right.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16 pb-28">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-900">
            Ready when you are
          </h2>
          <p className="text-muted-foreground text-lg">
            Purchases happen through Lydeis Bakes — reach out on Instagram (or WhatsApp when
            configured) for access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="h-12" asChild>
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 mr-2" aria-hidden />
                Message on Instagram
              </a>
            </Button>
            {whatsappHref ? (
              <Button size="lg" variant="outline" className="h-12" asChild>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors ${
          showBackToTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: showBackToTop ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        aria-label="Back to top"
      >
        <ArrowUp className="h-6 w-6" />
      </motion.button>

      <footer className="border-t bg-orange-100/60 py-10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Lydeis Bakes</strong> ×{" "}
            <Link href="/" className="text-primary hover:underline">
              Cryptic Solutions
            </Link>
          </p>
          <p>© {new Date().getFullYear()} Hosted on Cryptic Solutions.</p>
        </div>
      </footer>
    </div>
  );
}
