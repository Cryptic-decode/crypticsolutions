"use client";

import {
  ArrowRight,
  Check,
  Film,
  Play,
  Scissors,
  Smartphone,
  Sparkles,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileVideoRegistrationForm } from "@/components/mobile-video-editing/mobile-video-registration-form";
import {
  MOBILE_VIDEO_EDITING_PLAYLIST_EMBED_URL,
  MOBILE_VIDEO_EDITING_PLAYLIST_URL,
} from "@/lib/mobile-video-editing-program";

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const steps = [
  {
    number: "01",
    title: "Register",
    copy: "Share a few details so we can send your learning link and programme updates.",
  },
  {
    number: "02",
    title: "Learn",
    copy: "Work through the free tutorial playlist at your own pace using CapCut on your phone.",
  },
  {
    number: "03",
    title: "Create",
    copy: "Complete a practical 45 to 90-second trailer or music-video-style edit.",
  },
  {
    number: "04",
    title: "Earn your certificate",
    copy: "Submit your project for review and receive a certificate of completion when it meets the standard.",
  },
];

const learningOutcomes = [
  { icon: Scissors, label: "Choose and arrange clips with purpose" },
  { icon: Film, label: "Build a clear story, mood, or sequence" },
  { icon: Volume2, label: "Sync scenes with sound and music" },
  { icon: Sparkles, label: "Use effects and transitions without overusing them" },
];

const assessmentCriteria = [
  "Creativity",
  "Storytelling",
  "Timing and pacing",
  "Audio use",
  "Smoothness of edits",
  "Overall presentation",
];

export function MobileVideoEditingPage() {
  const scrollToRegistration = () => {
    document
      .getElementById("register")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        links={[
          { href: "/#products", label: "Products" },
          { href: "/#about", label: "What we build" },
          { href: "/#contact", label: "Contact" },
        ]}
        ctaLabel="Register free"
        onCtaClick={scrollToRegistration}
      />

      <main className="pt-[4.5rem]">
        <section className="border-b border-border/60 py-16 sm:py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[.92fr_1.08fr]">
            <motion.div
              initial={false}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Mobile Video Editing Programme
              </p>
              <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Learn to turn everyday clips into stories people want to watch.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Build practical editing skills with your smartphone and CapCut. Start
                with free guided tutorials, create a final project, and earn a
                certificate of completion after assessment.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToRegistration}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Register and start learning <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={MOBILE_VIDEO_EDITING_PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Play className="h-4 w-4" /> Preview the tutorials
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Free tutorial access
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Learn on your phone
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Practical assessment
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_24px_70px_rgba(17,19,15,.12)]"
            >
              <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12">
                  <Smartphone className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Your first lesson is ready</p>
                  <p className="text-xs text-muted-foreground">
                    Watch here or continue on YouTube
                  </p>
                </div>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  src={MOBILE_VIDEO_EDITING_PLAYLIST_EMBED_URL}
                  title="Cryptic Solutions Mobile Video Editing tutorial playlist"
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                A complete learning journey
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                From your first lesson to a finished project.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                The programme is built around practice. You learn the tools, apply
                them in a real edit, and receive a clear outcome from the assessment.
              </p>
            </motion.div>

            <div className="mt-14 grid border-y border-border/70 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  {...reveal}
                  className={`p-6 sm:p-8 ${
                    index < steps.length - 1
                      ? "border-b border-border/70 sm:border-r lg:border-b-0"
                      : ""
                  }`}
                >
                  <span className="font-mono text-xs text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {step.copy}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.9fr_1.1fr]">
            <motion.div {...reveal}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                What you will learn
              </p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em]">
                Edit with intention, not just effects.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                The tutorials focus on the choices that make an edit clear and
                engaging. The goal is to help you understand why each cut, sound,
                and transition belongs.
              </p>
              <ul className="mt-9 divide-y divide-border/70 border-y border-border/70">
                {learningOutcomes.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-4 py-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium">{label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.article
              {...reveal}
              className="rounded-[1.5rem] bg-[#11130f] p-7 text-white dark:border dark:border-border/70 sm:p-10"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#aee744]">
                Final skill assessment
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Create one short video that shows what you can do.
              </h2>
              <p className="mt-5 leading-7 text-white/65">
                Choose a movie trailer or music-video-style edit. Your finished
                project should be 45 to 90 seconds long and edited entirely on your
                mobile phone.
              </p>
              <div className="mt-8 border-t border-white/15 pt-7">
                <p className="text-sm font-semibold">What we assess</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {assessmentCriteria.map((criterion) => (
                    <li
                      key={criterion}
                      className="flex items-center gap-3 text-sm text-white/75"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#aee744]" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-8 rounded-lg bg-white/[0.06] p-4 text-sm leading-6 text-white/65">
                A certificate of completion is issued after the submitted project
                has been reviewed and meets the assessment standard.
              </p>
            </motion.article>
          </div>
        </section>

        <section
          id="register"
          className="scroll-mt-24 border-b border-border/60 py-20 md:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[.78fr_1.22fr]">
            <motion.div {...reveal}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Start learning
              </p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Register for the programme.
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
                We will send the free tutorial playlist to your inbox immediately.
                Learn at your own pace, then complete the practical assessment when
                you are ready.
              </p>
              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <p className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> No
                  previous editing experience required
                </p>
                <p className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Learn
                  with a smartphone and CapCut
                </p>
                <p className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Receive
                  the tutorial link immediately
                </p>
              </div>
            </motion.div>

            <motion.div
              {...reveal}
              className="rounded-2xl border border-border/70 bg-card p-6 sm:p-9"
            >
              <MobileVideoRegistrationForm />
            </motion.div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <motion.div {...reveal} className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Common questions
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Before you register
              </h2>
            </motion.div>
            <div className="mt-12 divide-y divide-border/70 border-y border-border/70">
              {[
                [
                  "Do I need editing experience?",
                  "No. The programme starts with the fundamentals and is suitable for complete beginners.",
                ],
                [
                  "What device and app do I need?",
                  "You need a smartphone with CapCut installed. A notebook can also help you plan your edits.",
                ],
                [
                  "Is the tutorial free?",
                  "Yes. Registration gives you immediate access to the free tutorial playlist on YouTube.",
                ],
                [
                  "When do I receive a certificate?",
                  "A certificate of completion is issued after your final project has been reviewed and meets the assessment standard.",
                ],
              ].map(([question, answer]) => (
                <div
                  key={question}
                  className="grid gap-3 py-6 sm:grid-cols-[.8fr_1.2fr] sm:gap-10"
                >
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
