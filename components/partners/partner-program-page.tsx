"use client";

import { ArrowRight, BadgeDollarSign, BookOpenCheck, Check, HeartHandshake, Users } from "lucide-react";
import { motion } from "framer-motion";

import { ProductNav } from "@/components/layout/product-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { PartnerApplicationForm } from "@/components/partners/partner-application-form";
import {
  IELTS_MANUAL_PRICE,
  PARTNER_COMMISSION_AMOUNT,
  PARTNER_COMMISSION_PERCENT,
} from "@/lib/partner-program";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const steps = [
  { number: "01", title: "Apply", copy: "Tell us about yourself, your organisation, and the people you support." },
  { number: "02", title: "Get approved", copy: "We review your application and activate your unique referral code." },
  { number: "03", title: "Share the portal", copy: "Introduce suitable IELTS candidates to a structured and affordable study resource." },
  { number: "04", title: "Earn", copy: "Receive commission for every completed purchase attributed to your active code." },
];

const audiences = [
  "Education and scholarship advisers",
  "Travel and relocation communities",
  "IELTS tutors and learning centres",
  "Student associations and alumni groups",
  "Creators serving international applicants",
];

export function PartnerProgramPage() {
  const scrollToApplication = () => {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductNav ctaLabel="Become a partner" onCtaClick={scrollToApplication} showMobileStickyCta={false} />
      <div className="h-16" />

      <main>
        <section className="border-b border-border/60 py-16 sm:py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.08fr_.92fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Cryptic Partner Programme</p>
              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Help more people prepare for IELTS with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Introduce students, applicants, and families to an affordable IELTS preparation portal. We handle payment, access, learning support, and the complete customer experience.
              </p>
              <button
                type="button"
                onClick={scrollToApplication}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Apply to become a partner <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                IELTS requirements vary by institution and migration route. Our role is to help candidates prepare when the test forms part of their journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card"
            >
              <div className="border-b border-border/70 p-7 sm:p-9">
                <p className="text-sm font-medium text-muted-foreground">Commission per successful purchase</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-7xl font-semibold tracking-[-0.07em] text-primary sm:text-8xl">{PARTNER_COMMISSION_PERCENT}%</span>
                </div>
                <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                  Earn ₦{PARTNER_COMMISSION_AMOUNT.toLocaleString()} from every ₦{IELTS_MANUAL_PRICE.toLocaleString()} IELTS Preparation Manual purchase made with your approved referral code.
                </p>
              </div>
              <div className="grid gap-px bg-border/70 sm:grid-cols-2">
                <div className="bg-card p-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Payout options</p>
                  <p className="mt-2 font-semibold">Bi-weekly or monthly</p>
                </div>
                <div className="bg-card p-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Partner support</p>
                  <p className="mt-2 font-semibold">Materials and clear reporting</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">A partnership with purpose</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Make useful preparation easier to find.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                IELTS can stand between a candidate and an important education, work, or migration opportunity. This programme helps trusted individuals and organisations connect candidates with a practical way to prepare.
              </p>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Wherever their journey leads, the knowledge, skills, and opportunities they gain can also create meaningful change for their families, communities, and the countries they call home.
              </p>
            </motion.div>

            <div className="mt-14 grid overflow-hidden rounded-2xl border border-border/70 bg-border/70 md:grid-cols-3">
              {[
                { icon: BookOpenCheck, title: "A useful product", copy: "Candidates receive structured guidance, protected portal access, saved progress, explainer content, and continued learning support." },
                { icon: HeartHandshake, title: "A simple role", copy: "You introduce the portal to suitable candidates. Cryptic Solutions manages the complete purchase and learning experience." },
                { icon: BadgeDollarSign, title: "Clear earnings", copy: `Your approved code earns ${PARTNER_COMMISSION_PERCENT}% on every completed and eligible purchase.` },
              ].map(({ icon: Icon, title, copy }) => (
                <motion.article key={title} {...reveal} className="bg-card p-7 sm:p-9">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12"><Icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Four straightforward steps.</h2>
            </motion.div>
            <div className="mt-14 grid border-y border-border/70 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  {...reveal}
                  className={`p-6 sm:p-8 ${index < steps.length - 1 ? "border-b border-border/70 sm:border-r lg:border-b-0" : ""}`}
                >
                  <span className="font-mono text-xs text-primary">{step.number}</span>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{step.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.85fr_1.15fr]">
            <motion.div {...reveal}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12"><Users className="h-5 w-5 text-primary" /></div>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em]">Who can apply?</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">Individuals and organisations with a genuine connection to people preparing for international opportunities are welcome.</p>
            </motion.div>
            <motion.ul {...reveal} className="divide-y divide-border/70 border-y border-border/70">
              {audiences.map((audience) => (
                <li key={audience} className="flex items-center gap-4 py-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12"><Check className="h-3.5 w-3.5 text-primary" /></span>
                  <span className="font-medium">{audience}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        <section id="apply" className="scroll-mt-24 border-t border-border/60 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.78fr_1.22fr]">
            <motion.div {...reveal}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Apply to partner with us</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Tell us about your audience.</h2>
              <p className="mt-5 max-w-lg leading-7 text-muted-foreground">Applications are reviewed before referral codes are activated. We will contact you with the next steps and request payout details only after approval.</p>
              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> No application fee</p>
                <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Choose bi-weekly or monthly payouts</p>
                <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Suggest and customise your referral code</p>
              </div>
            </motion.div>
            <motion.div {...reveal} className="rounded-2xl border border-border/70 bg-card p-6 sm:p-9">
              <PartnerApplicationForm />
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <motion.div {...reveal} className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Common questions</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Before you apply</h2>
            </motion.div>
            <div className="mt-12 divide-y divide-border/70 border-y border-border/70">
              {[
                ["When does my referral code become active?", "After Cryptic Solutions reviews and approves your application. We will confirm activation by email."],
                ["When are commissions paid?", "You can choose a bi-weekly or monthly payout schedule. Only completed and eligible purchases are included."],
                ["Do I support referred customers?", "No. Cryptic Solutions handles payment, account access, product support, and the learning experience."],
                ["What happens if my preferred code is unavailable?", "We will contact you with a close alternative before your partner account is activated."],
              ].map(([question, answer]) => (
                <div key={question} className="grid gap-3 py-6 sm:grid-cols-[.8fr_1.2fr] sm:gap-10">
                  <h3 className="font-semibold">{question}</h3>
                  <p className="leading-7 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
