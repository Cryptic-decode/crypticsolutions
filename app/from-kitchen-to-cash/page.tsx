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
import { PaystackPayment } from "@/components/payment-paystack";
import {
  KITCHEN_EBOOK_PRODUCT_IDS,
  KITCHEN_EBOOK_PRODUCTS,
  type KitchenEbookProductId,
} from "@/lib/kitchen-ebook-products";

const INSTAGRAM_HREF = "https://www.instagram.com/lydeis_kitchenandevents";

const HERO_BENEFITS = [
  "Foundations before menu design - costs, pitfalls, and mindset",
  "Menu planning and pricing that matches your real numbers",
  "Recipe costing with templates and practice exercises",
  "Two-part PDF guide built for Nigerian caterers",
] as const;

const PROOF_GALLERY = [
  {
    src: "/lydei-assets/hero-pastry-abundance.png",
    alt: "Pastry abundance spread",
    caption: "Pastry spreads",
  },
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
  {
    src: "/lydei-assets/proof-moody-bakery-counter.png",
    alt: "Moody bakery counter with pastries",
    caption: "Bakery-style finishing",
  },
  {
    src: "/lydei-assets/proof-kitchen-hands-prep.png",
    alt: "Kitchen prep in action",
    caption: "Behind the scenes",
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
    a: "PDF downloads - buy Part One or Part Two for ₦3,000 each, or both together for ₦5,000 (save ₦1,000). Templates and exercises are included with the parts you purchase.",
  },
  {
    q: "Can I buy just one part?",
    a: "Yes. Part One and Part Two are ₦3,000 each. If you want the full guide, the bundle is ₦5,000 and includes both PDFs.",
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
  const [selectedProductId, setSelectedProductId] = useState<KitchenEbookProductId>(
    "from-kitchen-to-cash-bundle"
  );
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

  const selectedProduct = KITCHEN_EBOOK_PRODUCTS[selectedProductId];
  const trimmedEmail = email.trim();
  const isCheckoutEmailReady =
    trimmedEmail.length > 0 && trimmedEmail.includes("@") && trimmedEmail.includes(".");

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
                and build a profitable menu.
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
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="h-12 bg-transparent border-orange-50/60 text-orange-50 hover:bg-orange-50/15 hover:text-orange-50 shadow-sm shadow-orange-950/10"
                  asChild
                >
                  <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 mr-2" aria-hidden />
                    See our work on Instagram
                  </a>
                </Button> */}
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

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-orange-950">What’s possible</h2>
              <p className="text-orange-950/70 mt-1">
                A quick look at the kinds of finishes, spreads, and event-ready setups you can deliver.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    orders quickly.
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
                  Nigerians dreaming of or already growing a catering hustle.
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
                Part One - Foundations &amp; intro
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
                Part Two - Menu, maths &amp; takeaway tools
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

      <section id="checkout" className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-2">On-page checkout</p>
            <h2 className="text-2xl md:text-3xl font-bold text-orange-950">Choose your ebook</h2>
            <p className="text-orange-900/80 mt-2 max-w-2xl">
              Each part is ₦3,000. Get both for ₦5,000 and save ₦1,000. Secure payment via Paystack.
            </p>
          </div>

          <div>
            <label htmlFor="checkout-email" className="text-sm font-medium text-orange-900">
              Email:  
            </label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 ml-4 h-12 w-full max-w-md rounded-md border border-orange-400 bg-white px-3 text-base outline-none focus:border-orange-600"
            />
            {email && !isCheckoutEmailReady && (
              <p className="text-xs text-red-700 mt-1">Please enter a valid email address.</p>
            )}
            <p className="text-xs text-orange-900/70 mt-2 max-w-md">
              We’ll store your purchase and you’ll get instant access after payment succeeds.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {KITCHEN_EBOOK_PRODUCT_IDS.map((id: KitchenEbookProductId) => {
              const product = KITCHEN_EBOOK_PRODUCTS[id];
              const isBundle = id === "from-kitchen-to-cash-bundle";
              const isSelected = selectedProductId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedProductId(id)}
                  className="text-left"
                  aria-pressed={isSelected}
                >
                  <Card
                    className={`p-5 md:p-6 flex flex-col border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-md transition-all ${
                      isSelected ? "ring-2 ring-orange-600 shadow-lg" : "hover:shadow-lg"
                    } ${isBundle && !isSelected ? "md:scale-[1.01]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {isBundle && (
                          <span className="inline-flex rounded-full bg-orange-600 text-white text-xs font-semibold px-2.5 py-0.5 mb-3">
                            Best value — save ₦1,000
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-orange-950">{product.checkoutLabel}</h3>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-orange-700 shrink-0 mt-1" />}
                    </div>

                    <p className="text-3xl font-bold text-orange-800 mt-1">
                      ₦{product.amount.toLocaleString()}
                    </p>
                    {isBundle && (
                      <p className="text-xs text-orange-800/70 line-through mt-0.5">₦6,000 separately</p>
                    )}
                    <p className="text-sm text-orange-900/80 mt-3">{product.checkoutDescription}</p>
                  </Card>
                </button>
              );
            })}
          </div>

          <Card className="p-5 md:p-6 border-orange-300 bg-white shadow-md">
            <motion.div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <motion.div>
                <p className="text-sm font-semibold text-orange-950">Selected</p>
                <p className="text-orange-950/80">
                  <span className="font-semibold">{selectedProduct.name}</span> : ₦
                  {selectedProduct.amount.toLocaleString()}
                </p>
                <p className="text-xs text-orange-950/65 mt-1">
                  Instant download on the next page after successful payment.
                </p>
              </motion.div>
              <div className="w-full md:w-[320px] space-y-2">
                <PaystackPayment
                  key={selectedProductId}
                  email={email}
                  amount={selectedProduct.amount}
                  productId={selectedProductId}
                  productName={selectedProduct.name}
                  successPath="/payment/kitchen-ebook-success"
                  metadata={{ product: "From Kitchen to Cash", currency: "NGN" }}
                  buttonLabel={`Pay ₦${selectedProduct.amount.toLocaleString()}`}
                  className="w-full h-12 bg-orange-700 hover:bg-orange-800 text-white"
                  onError={(error) => console.error("Payment failed:", error)}
                />
                {!isCheckoutEmailReady && (
                  <p className="text-xs text-orange-900/70 text-center md:text-left">
                    Enter your email above to enable payment.
                  </p>
                )}
              </div>
            </motion.div>
          </Card>
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
