"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUp,
  Calculator,
  ChefHat,
  CheckCircle2,
  ClipboardList,
  FileText,
  Instagram,
  LayoutGrid,
  Layers,
  MessageCircle,
  Menu,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Drawer } from "@/components/ui/drawer";

const INSTAGRAM_HREF = "https://www.instagram.com/lydeis_kitchenandevents";

const HERO_BENEFITS = [
  "Foundations before menu design — costs, pitfalls, and mindset",
  "Menu planning and pricing that matches your real numbers",
  "Recipe costing with templates and practice exercises",
  "Two-part PDF guide built for Nigerian caterers",
] as const;

const PROOF_GALLERY = [
  {
    src: "/lydei-assets/proof-display-case-pastries.png",
    alt: "Premium pastry display case",
    caption: "Premium variety",
  },
  {
    src: "/lydei-assets/proof-artisan-pastry-set.png",
    alt: "Artisan pastry set",
    caption: "Handmade quality",
  },
  {
    src: "/lydei-assets/proof-event-dessert-table.png",
    alt: "Dessert table for an event",
    caption: "Event-ready setup",
  },
] as const;

const WHAT_YOU_GET = [
  {
    title: "Two-part PDF ebook",
    description: "Foundations, pricing, menus, pitfalls, and practical guidance you can use immediately.",
    icon: FileText,
  },
  {
    title: "Costing templates",
    description: "Simple sheets you can reuse to calculate food cost, margins, and pricing with confidence.",
    icon: Calculator,
  },
  {
    title: "Takeaway exercises",
    description: "Short, guided exercises that help you apply what you learn to your own catering business.",
    icon: ClipboardList,
  },
  {
    title: "A repeatable system",
    description: "A step-by-step approach you can use for new menus, new recipes, and new orders.",
    icon: Layers,
  },
] as const;

const FAQS = [
  {
    q: "Is this ebook only for pastries?",
    a: "No. The examples lean catering-forward: pricing, costing, menus, and running the business side of catering. The principles apply whether you focus on pastries, small chops, or full event menus.",
  },
  {
    q: "What format will I receive?",
    a: "A PDF ebook (two parts), plus templates and exercises included with the guide.",
  },
  {
    q: "Do I need Excel to use the templates?",
    a: "No. You can use them in any spreadsheet app (Excel, Google Sheets) or even print and fill as you learn. The goal is clarity, not complicated formulas.",
  },
  {
    q: "Is it beginner-friendly?",
    a: "Yes. It starts with foundations and common pitfalls, then moves into a simple pricing and costing structure you can build on as you grow.",
  },
  {
    q: "Can I read it on my phone?",
    a: "Yes. The PDF is designed to be readable on mobile, and it’s easy to save for offline access.",
  },
] as const;

function scrollToGetEbook() {
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getWhatsAppHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_FROM_KITCHEN_TO_CASH_WHATSAPP;
  if (!raw?.trim()) return null;
  return raw.trim();
}

export default function FromKitchenToCashPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
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
    <div className="min-h-screen bg-[#F5E6D3] relative overflow-hidden pb-24 md:pb-0">
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
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => {
                  scrollToGetEbook();
                  setMobileMenuOpen(false);
                }}
              >
                Get the Ebook
              </Button>
            </div>
          </Drawer>
        </div>
      </nav>

      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-20 pb-10 md:pt-28 md:pb-14">
        <motion.div
          className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl border border-orange-950/20 shadow-2xl"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <Image
            src="/lydei-assets/hero-pastry-abundance.png"
            alt="Premium pastry spread from Lydeis Kitchen and Events"
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="h-[520px] sm:h-[560px] md:h-[600px] w-full object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 via-orange-950/70 to-orange-950/20" />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wide text-orange-100/90">
                Lydei&apos;s Kitchen &amp; Event
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-orange-50 leading-tight">
                From Kitchen to Cash
              </h1>
              <p className="text-base md:text-lg text-orange-50/90 leading-relaxed">
                The catering business ebook that helps you price with confidence, cost properly,
                and build a profitable menu — before the fancy branding.
              </p>

              <ul className="grid gap-2.5">
                {HERO_BENEFITS.slice(0, 3).map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-sm md:text-base text-orange-50/90">
                    <CheckCircle2 className="h-5 w-5 text-orange-200 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  size="lg"
                  className="h-12 bg-orange-500 text-white hover:bg-orange-400 shadow-md shadow-orange-950/20"
                  onClick={scrollToGetEbook}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Get the Ebook
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 bg-transparent border-orange-50/60 text-orange-50 hover:bg-orange-50/15 hover:text-orange-50 shadow-sm shadow-orange-950/10"
                  asChild
                >
                  <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 mr-2" aria-hidden />
                    See our work on Instagram
                  </a>
                </Button>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-3 rounded-xl bg-orange-50/10 border border-orange-50/20 px-3 py-2">
                  <Image
                    src="/lydei-assets/product-ebook-mockup.png"
                    alt="From Kitchen to Cash ebook"
                    width={800}
                    height={500}
                    className="h-10 w-auto object-contain"
                  />
                  <span className="text-xs md:text-sm text-orange-50/85">
                    Two-part PDF + takeaway exercises and costing templates.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="checkout" className="container mx-auto px-4 md:px-6 lg:px-8 pb-6">
        <Card className="max-w-4xl mx-auto p-6 md:p-8 border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 shadow-[0_10px_40px_rgba(154,52,18,0.25)]">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-semibold text-orange-800 mb-2">On-page checkout</p>
              <h2 className="text-2xl md:text-3xl font-bold text-orange-950">Buy your ebook here</h2>
              <p className="text-orange-900/80 mt-2">
                Enter your email and continue to secure checkout on this page.
              </p>
              <div className="mt-4">
                <label htmlFor="checkout-email" className="text-sm font-medium text-orange-900">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-md border border-orange-400 bg-white px-3 text-base outline-none focus:border-orange-600"
                />
              </div>
            </div>
            <Button size="lg" className="h-12 bg-orange-700 hover:bg-orange-800 text-white w-full md:w-auto" disabled={!email.includes("@")}>
              Buy Ebook on This Page
            </Button>
          </div>
          <p className="text-xs text-orange-900/70 mt-4">
            Instagram is for brand proof only. Checkout happens on this landing page.
          </p>
        </Card>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-orange-950">Proof of the craft</h2>
              <p className="text-orange-950/70 mt-1">
                A quick look at the quality and presentation behind the brand.
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:inline-flex border-orange-800/30 text-orange-950 hover:bg-orange-100"
              asChild
            >
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" aria-hidden />
                View Instagram
              </a>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PROOF_GALLERY.map((item) => (
              <div
                key={item.src}
                className="group relative overflow-hidden rounded-2xl border border-orange-950/10 bg-white shadow-md"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1600}
                  height={900}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="h-56 md:h-64 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/55 via-orange-950/10 to-transparent opacity-90" />
                <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-orange-50">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative h-[360px] md:h-[420px] overflow-hidden rounded-3xl border border-orange-950/15 shadow-2xl">
              <Image
                src="/lydei-assets/proof-kitchen-hands-prep.png"
                alt="Kitchen prep in action"
                fill
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-950/85 via-orange-950/55 to-orange-950/10" />
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 md:p-10 max-w-2xl space-y-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-orange-50">
                    Built for real work, not guesswork
                  </h3>
                  <p className="text-orange-50/85">
                    The ebook is practical: costing, pricing, and templates you can apply to real
                    orders — fast.
                  </p>
                  <Button
                    size="lg"
                    className="h-12 bg-orange-50 text-orange-950 hover:bg-orange-100"
                    onClick={scrollToGetEbook}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Get the Ebook
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-950">What you get</h2>
            <p className="text-orange-950/70 mt-2">
              Everything is structured to help you price better, cost properly, and run catering with confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_YOU_GET.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="p-6 border-orange-950/10 bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 border border-orange-200">
                      <Icon className="h-6 w-6 text-orange-800" aria-hidden />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-orange-950">{item.title}</h3>
                      <p className="text-sm text-orange-950/70">{item.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-orange-900">
            Who this is for
          </h2>
          <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
            <Card className="p-8 text-muted-foreground text-lg leading-relaxed border-orange-300 bg-orange-50 shadow-[0_10px_40px_rgba(194,65,12,0.20)]">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-1 shrink-0" />
                  Nigerians dreaming of—or already growing—a catering hustle.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-1 shrink-0" />
                  Caterers tired of being busy but unsure of real profit.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-1 shrink-0" />
                  Entrepreneurs who want clear systems for pricing and costing.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-1 shrink-0" />
                  Anyone who prefers practical templates over guesswork.
                </li>
              </ul>
            </Card>
            <div className="rounded-2xl overflow-hidden border border-orange-300/70 shadow-md">
              <Image
                src="/lydei-assets/pastryStore-front.jpeg"
                alt="Lydeis pastry display"
                width={1200}
                height={900}
                className="h-full min-h-64 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 rounded-3xl bg-gradient-to-b from-orange-300/70 to-amber-300/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-950">What’s inside</h2>
            <p className="text-orange-950/70 mt-2">
              Two parts, one goal: help you build a catering business that’s priced right and runs profitably.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
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
              <h3 className="text-2xl md:text-3xl font-bold text-orange-950">
                Part One — Foundations &amp; intro
              </h3>
            </div>
            <Card className="p-8 space-y-4 text-muted-foreground border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-[0_10px_40px_rgba(180,83,9,0.18)]">
              <p className="text-orange-950 font-semibold">Part One gives you a strong business foundation:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
                  Understand the real costs behind every order before setting prices.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
                  Spot common mistakes that quietly kill catering profit.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
                  Build the right business mindset before expanding your menu.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
                  Apply practical mini-exercises so learning turns into action quickly.
                </li>
              </ul>
              <p className="pt-2 border-t border-orange-200 text-orange-900/80">
                Outcome: you stop underpricing, reduce silent losses, and prepare your business for profitable growth.
              </p>
            </Card>
            <div className="mt-6 rounded-2xl overflow-hidden border border-orange-300/70 shadow-md">
              <Image
                src="/lydei-assets/pastryPresentation2.jpeg"
                alt="Lydeis pastry presentation setup"
                width={1200}
                height={700}
                className="h-56 md:h-64 w-full object-cover"
              />
            </div>
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
              <h3 className="text-2xl md:text-3xl font-bold text-orange-950">
                Part Two — Menu, maths &amp; takeaway tools
              </h3>
            </div>
            <Card className="p-8 space-y-3 text-muted-foreground border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-[0_10px_40px_rgba(194,65,12,0.18)]">
              <ul className="space-y-3 list-none">
                {[
                  "Design practical menus that are easier to produce and sell",
                  "Set prices with confidence using your actual business numbers",
                  "Master recipe costing with a clear, repeatable method",
                  "Follow a full costing example from start to finish",
                  "Practice with guided exercises and answer-friendly worksheets",
                  "Use printable takeaway costing sheets in your daily workflow",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm pt-4 border-t border-orange-200 text-orange-900/80">
                Outcome: you get a practical costing system you can use every day for real orders.
              </p>
            </Card>
            <div className="mt-6 rounded-2xl overflow-hidden border border-orange-300/70 shadow-md">
              <Image
                src="/lydei-assets/pastryStore-front2.jpeg"
                alt="Lydeis pastry store setup"
                width={1200}
                height={700}
                className="h-56 md:h-64 w-full object-cover"
              />
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-950">FAQ</h2>
            <p className="text-orange-950/70 mt-2">Quick answers before you grab your copy.</p>
          </div>

          <div className="rounded-2xl border border-orange-950/10 bg-white shadow-md overflow-hidden">
            {FAQS.map((item) => (
              <details key={item.q} className="group border-b border-orange-950/10 last:border-b-0">
                <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between gap-4">
                  <span className="font-semibold text-orange-950">{item.q}</span>
                  <span className="text-orange-700 group-open:rotate-45 transition-transform select-none text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-orange-950/75">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16 pb-28">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-900">
            Ready to get your copy?
          </h2>
          <p className="text-orange-900/80 text-lg">
            Use the checkout section above to complete your purchase on this page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="h-12 bg-orange-700 hover:bg-orange-800 text-white"
              onClick={() => document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Go to Checkout
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-orange-700 text-orange-800 hover:bg-orange-100" asChild>
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 mr-2" aria-hidden />
                View Instagram
              </a>
            </Button>
            {whatsappHref ? (
              <Button size="lg" variant="outline" className="h-12 border-orange-600 text-orange-700 hover:bg-orange-50" asChild>
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
        className={`hidden md:flex fixed bottom-8 right-8 z-40 p-4 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800 transition-colors ${
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

      <div
        className={`fixed inset-x-0 bottom-0 z-50 md:hidden transition-all ${
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <div className="rounded-2xl border border-orange-950/15 bg-white/85 backdrop-blur shadow-xl p-3 flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-orange-950 leading-tight truncate">
                From Kitchen to Cash
              </p>
              <p className="text-xs text-orange-950/70 leading-tight truncate">
                Get the ebook in 2 minutes
              </p>
            </div>
            <Button
              size="lg"
              className="ml-auto h-11 px-5 bg-orange-700 hover:bg-orange-800 text-white"
              onClick={scrollToGetEbook}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Get it
            </Button>
          </div>
        </div>
      </div>

      <footer className="border-t bg-orange-100/60 py-10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Lydeis Bakes</strong> ×{" "}
            <Link href="/" className="text-orange-800 hover:underline">
              Cryptic Solutions
            </Link>
          </p>
          <p>© {new Date().getFullYear()} Hosted on Cryptic Solutions.</p>
        </div>
      </footer>
    </div>
  );
}
