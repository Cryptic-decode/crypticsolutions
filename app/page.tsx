"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  Mail,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { MainDrawer } from "@/components/navigation/main-drawer";
import { ProductVisual } from "@/components/marketing/product-visual";
import { BrandHeroVisual } from "@/components/marketing/brand-hero-visual";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/lib/auth";
import { SUPPORT_EMAIL } from "@/lib/contact";
import { useActiveSection } from "@/lib/hooks/use-active-section";

const homeSections = ["products", "about", "contact"] as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const products = [
  {
    id: "ielts-manual",
    eyebrow: "Guided learning",
    title: "Prepare for IELTS with a plan you can actually follow.",
    description: "A structured manual covering Listening, Reading, Writing, and Speaking. It is built for focused study, not information overload.",
    price: "₦5,000",
    detail: "Protected online library",
    href: "/ielts-manual",
    cta: "View IELTS manual",
    visual: "ielts" as const,
    features: ["All four IELTS sections", "Practical strategies and examples", "Reading progress saved automatically"],
  },
  {
    id: "prompt-engineering-ebook",
    eyebrow: "Instant download",
    title: "Get more useful answers from the AI tools you already use.",
    description: "A concise ebook with prompt structures, reusable templates, and clear examples for better everyday AI work.",
    price: "₦2,000",
    detail: "PDF download after payment",
    href: "/prompt-engineering-ebook",
    cta: "View prompt ebook",
    visual: "prompts" as const,
    features: ["Four focused chapters", "Reusable prompt templates", "Short, practical format"],
  },
];

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const activeSection = useActiveSection(homeSections);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      router.replace("/update-password");
      return;
    }
    const storedTheme = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate client-only theme preference
    setDarkMode(storedTheme !== "light");
  }, [router]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const sectionLinkClass = (section: string) =>
    `relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:bg-primary after:transition-transform ${
      activeSection === section
        ? "text-foreground after:scale-x-100"
        : "text-muted-foreground after:scale-x-0 hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
            <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={150} height={38} className="h-9 w-auto dark:hidden" priority />
            <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={150} height={38} className="hidden h-9 w-auto dark:block" priority />
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#products" aria-current={activeSection === "products" ? "location" : undefined} className={sectionLinkClass("products")}>Products</a>
            <a href="#about" aria-current={activeSection === "about" ? "location" : undefined} className={sectionLinkClass("about")}>What we build</a>
            <a href="#contact" aria-current={activeSection === "contact" ? "location" : undefined} className={sectionLinkClass("contact")}>Contact</a>
            {!authLoading && <Link href={user ? "/dashboard" : "/signin"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{user ? "Dashboard" : "Sign in"}</Link>}
            <button onClick={toggleDarkMode} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild className="h-10 px-5"><a href="#products">Browse products</a></Button>
          </div>

          <button className="rounded-md p-2 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open navigation">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <MainDrawer
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onClose={() => setMobileMenuOpen(false)}
          links={[
            { href: "#products", label: "Products", onClick: () => scrollTo("products") },
            { href: "#about", label: "What we build", onClick: () => scrollTo("about") },
            { href: "#contact", label: "Contact", onClick: () => scrollTo("contact") },
            ...(!authLoading ? [{ href: user ? "/dashboard" : "/signin", label: user ? "Dashboard" : "Sign in" }] : []),
          ]}
          ctaButton={{ label: "Browse products", onClick: () => scrollTo("products") }}
          activeHref={activeSection ? `#${activeSection}` : undefined}
        />
      </Drawer>

      <main className="pt-[4.5rem]">
        <section className="relative border-b border-border/60">
          <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-14 px-5 py-16 md:px-8 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[3.7rem]">
                Practical digital products for learning and work<span className="text-primary">.</span>
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                Cryptic Solutions turns complex topics into focused products that are clear, useful, and ready when you need them.
              </p>
              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 px-6"><a href="#products">Explore the products <ArrowRight /></a></Button>
                <a href="#about" className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How we work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/70 pt-6 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Secure Paystack checkout</span>
                <span className="inline-flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> Immediate product access</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Protected customer library</span>
              </div>
            </motion.div>

            <motion.div className="relative mx-auto hidden w-full max-w-xl lg:block" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <BrandHeroVisual />
            </motion.div>
          </div>
        </section>

        <section id="products" className="scroll-mt-28 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="mb-16 max-w-2xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Available now</p>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Start with something useful today.</h2>
            </motion.div>

            <div className="space-y-8">
              {products.map((product, index) => (
                <motion.article key={product.id} {...reveal} className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-card lg:grid-cols-2">
                  <ProductVisual kind={product.visual} className={index % 2 ? "lg:order-2 bg-muted/40 dark:bg-[#0d0f0c]" : "bg-muted/40 dark:bg-[#0d0f0c]"} />
                  <div className="flex flex-col p-8 sm:p-10 lg:p-14">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{product.eyebrow}</p>
                    <h3 className="mt-5 max-w-xl text-balance text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">{product.title}</h3>
                    <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{product.description}</p>
                    <ul className="mt-8 space-y-3">
                      {product.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/12"><Check className="h-3 w-3 text-primary" /></span>{feature}</li>)}
                    </ul>
                    <div className="mt-10 flex flex-col gap-5 border-t border-border/70 pt-7 sm:flex-row sm:items-end sm:justify-between">
                      <div><p className="text-2xl font-semibold tabular-nums">{product.price}</p><p className="mt-1 text-xs text-muted-foreground">{product.detail}</p></div>
                      <Button asChild size="lg"><Link href={product.href}>{product.cta} <ArrowUpRight /></Link></Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-28 border-y border-border/60 bg-muted/30 py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-[.8fr_1.2fr]">
            <motion.div {...reveal}>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">What we build</p>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Less noise. More useful outcomes.</h2>
            </motion.div>
            <div className="divide-y divide-border/70 border-y border-border/70">
              {[
                ["01", "Learning products", "Structured resources that make difficult subjects easier to study and revisit."],
                ["02", "Practical ebooks", "Focused guides with examples, templates, and next steps, without padded theory."],
                ["03", "Web products", "Clear, dependable tools designed around the work people actually need to do."],
              ].map(([number, title, copy]) => (
                <motion.div key={number} {...reveal} className="grid gap-4 py-8 sm:grid-cols-[4rem_12rem_1fr] sm:items-start">
                  <span className="font-mono text-xs text-primary">{number}</span>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="max-w-lg leading-7 text-muted-foreground">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <motion.div {...reveal} className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">In development</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Quickland is taking shape.</h2><p className="mt-3 max-w-2xl text-muted-foreground">A straightforward way to turn structured business information into a polished web presence.</p></div>
            <span className="w-fit border-l-2 border-primary pl-4 text-sm text-muted-foreground">Product updates coming soon</span>
          </motion.div>
        </section>

        <section id="contact" className="scroll-mt-28 bg-[#0d0f0c] py-24 text-white md:py-32">
          <motion.div {...reveal} className="mx-auto max-w-7xl px-5 md:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Have a question?</p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <h2 className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Let’s find the most useful next step.</h2>
              <Button asChild size="lg" className="h-12"><a href={`mailto:${SUPPORT_EMAIL}`}><Mail /> Email Cryptic Solutions</a></Button>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter quickLinks={[{ href: "#products", label: "Products" }, { href: "#about", label: "What we build" }, { href: "#contact", label: "Contact" }]} />
    </div>
  );
}
