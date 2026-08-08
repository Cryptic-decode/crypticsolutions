"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, MonitorSmartphone, ShieldCheck } from "lucide-react";

import { ProductNav } from "@/components/layout/product-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductVisual } from "@/components/marketing/product-visual";
import { PaystackPayment } from "@/components/payment-paystack";

interface ProductLandingProps {
  productId: string;
  productName: string;
  kind: "ielts" | "prompts";
  eyebrow: string;
  title: string;
  description: string;
  price: number;
  accessLabel: string;
  problemTitle: string;
  problemCopy: string[];
  features: Array<{ title: string; description: string }>;
  audience: string[];
  purchaseTitle: string;
  purchaseCopy: string;
  successPath: string;
  referralEnabled?: boolean;
}

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function ProductLanding(props: ProductLandingProps) {
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const scrollToPricing = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductNav ctaLabel={`Get it for ₦${props.price.toLocaleString()}`} onCtaClick={scrollToPricing} />
      <div className="h-16" />

      <main>
        <section className="border-b border-border/60 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to products</Link>
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{props.eyebrow}</p>
                <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">{props.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{props.description}</p>
                <button onClick={scrollToPricing} className="mt-8 inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Get {props.productName} for ₦{props.price.toLocaleString()}</button>
                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-border/70 pt-6 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Secure Paystack checkout</span>
                  <span className="inline-flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-primary" /> {props.accessLabel}</span>
                </div>
              </motion.div>
              <ProductVisual kind={props.kind} priority className="min-h-[32rem] rounded-[1.75rem] border border-border/70" />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.8fr_1.2fr]">
            <motion.div {...reveal}><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Why it exists</p><h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{props.problemTitle}</h2></motion.div>
            <motion.div {...reveal} className="space-y-5 border-l border-border/70 pl-7 text-lg leading-8 text-muted-foreground sm:pl-10">{props.problemCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</motion.div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Inside the product</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Built to be used, not skimmed and forgotten.</h2></motion.div>
            <div className="mt-14 grid border-y border-border/70 md:grid-cols-2">
              {props.features.map((feature, index) => (
                <motion.article key={feature.title} {...reveal} className={`p-7 md:p-9 ${index % 2 === 0 ? "md:border-r" : ""} border-b border-border/70 last:border-b-0`}>
                  <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 max-w-lg leading-7 text-muted-foreground">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-start">
            <motion.div {...reveal}><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">A good fit if</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">You want a clear path forward.</h2></motion.div>
            <ul className="divide-y divide-border/70 border-y border-border/70">{props.audience.map((item) => <li key={item} className="flex gap-4 py-5 leading-7"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12"><Check className="h-3 w-3 text-primary" /></span>{item}</li>)}</ul>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 border-t border-border/60 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.9fr_1.1fr]">
            <motion.div {...reveal}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">One-time purchase</p>
              <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{props.purchaseTitle}</h2>
              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{props.purchaseCopy}</p>
              <p className="mt-8 text-4xl font-semibold tabular-nums">₦{props.price.toLocaleString()}</p>
            </motion.div>
            <motion.div {...reveal} className="rounded-2xl border border-border/70 bg-card p-7 sm:p-9">
              <label htmlFor={`${props.productId}-email`} className="text-sm font-medium">Email address</label>
              <input id={`${props.productId}-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 outline-none transition-shadow focus:ring-2 focus:ring-ring/40" required />
              {props.referralEnabled && <><label htmlFor="referral" className="mt-5 block text-sm font-medium">Referral code <span className="text-muted-foreground">(optional)</span></label><input id="referral" value={referralCode} onChange={(event) => setReferralCode(event.target.value.toUpperCase())} placeholder="e.g. FRIEND20" maxLength={20} className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 outline-none transition-shadow focus:ring-2 focus:ring-ring/40" /></>}
              <div className="mt-6"><PaystackPayment email={email} amount={props.price} productId={props.productId} productName={props.productName} successPath={props.successPath} referralCode={referralCode || undefined} buttonLabel={`Buy for ₦${props.price.toLocaleString()}`} /></div>
              <div className="mt-6 flex items-start gap-3 border-t border-border/70 pt-5 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Payment is verified securely before access is granted. Your card details are handled by Paystack.</div>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
