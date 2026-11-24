"use client";

import {
  ArrowRight,
  Award,
  Check,
  Film,
  Layers3,
  Mail,
  Play,
  Scissors,
  Smartphone,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileVideoRegistrationForm } from "@/components/mobile-video-editing/mobile-video-registration-form";
import { cn } from "@/lib/utils";

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
    copy: "Complete the short form so we can create your place in the programme.",
  },
  {
    number: "02",
    title: "Check your inbox",
    copy: "We will email your tutorial playlist and the information you need to begin.",
  },
  {
    number: "03",
    title: "Learn and create",
    copy: "Follow the lessons at your pace, then produce a 45 to 90-second final edit.",
  },
  {
    number: "04",
    title: "Complete the programme",
    copy: "Submit your project for review and earn a certificate when it meets the standard.",
  },
];

const learningOutcomes = [
  { icon: Scissors, label: "Choose and arrange clips with purpose" },
  { icon: Film, label: "Build a clear story, mood, or sequence" },
  { icon: Volume2, label: "Sync scenes with sound and music" },
  { icon: Layers3, label: "Use effects and transitions without overusing them" },
];

const assessmentCriteria = [
  "Creativity",
  "Storytelling",
  "Timing and pacing",
  "Audio use",
  "Smoothness of edits",
  "Overall presentation",
];

const previewWaveform = [4, 8, 6, 10, 5, 9, 12, 7, 4, 8, 11, 6, 9, 5, 7, 10, 4, 8];

const programmeHighlights = [
  { icon: Mail, label: "Tutorial link sent after registration" },
  { icon: Smartphone, label: "Learn with your phone and CapCut" },
  { icon: Award, label: "Certificate after project review" },
];

const faqs = [
  [
    "Do I need editing experience?",
    "No. The programme starts with the fundamentals and is suitable for complete beginners.",
  ],
  [
    "What device and app do I need?",
    "You need a smartphone with CapCut installed. A notebook can also help you plan your edits.",
  ],
  [
    "How do I access the tutorials?",
    "Complete the registration form and we will send the free tutorial playlist to your email. Check your spam folder if it does not arrive in your inbox.",
  ],
  [
    "When do I receive a certificate?",
    "A certificate of completion is issued after your final project has been reviewed and meets the assessment standard.",
  ],
];

interface EditingPreviewProps {
  className?: string;
  compact?: boolean;
}

function EditingPreview({ className, compact = false }: EditingPreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/15 bg-[#10110f]/95 text-white shadow-2xl",
        className,
      )}
      role="img"
      aria-label="Example mobile video editing timeline"
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-white/10",
          compact ? "px-3 py-2" : "px-4 py-3",
        )}
      >
        <div>
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-white/55",
              compact ? "text-[9px]" : "text-[11px]",
            )}
          >
            Editing preview
          </p>
          <p
            className={cn(
              "mt-0.5 font-medium text-white/90",
              compact ? "text-[10px]" : "text-sm",
            )}
          >
            My first story
          </p>
        </div>
        <span
          className={cn(
            "rounded bg-white/10 font-medium text-white/65",
            compact ? "px-1.5 py-1 text-[8px]" : "px-2 py-1 text-[10px]",
          )}
        >
          1080p
        </span>
      </div>

      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-lg bg-black",
          compact ? "mx-3 mt-2.5" : "mx-4 mt-4",
        )}
      >
        <Image
          src="/cryptic-assets/mobile-video-editing-preview.jpg"
          alt=""
          fill
          sizes={compact ? "232px" : "(max-width: 1023px) calc(100vw - 72px), 430px"}
          className="object-cover opacity-90"
        />
        <span className="absolute inset-0 bg-black/15" />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/25",
            compact ? "h-7 w-7" : "h-11 w-11",
          )}
        >
          <Play
            className={cn(
              "ml-0.5 fill-white text-white",
              compact ? "h-3 w-3" : "h-5 w-5",
            )}
          />
        </span>
      </div>

      <div
        className={cn(
          "flex items-center justify-between text-white/55",
          compact ? "px-3 py-2 text-[8px]" : "px-4 py-2.5 text-xs",
        )}
      >
        <span>00:06</span>
        <span>00:24</span>
      </div>

      <div
        className={cn(
          "relative border-t border-white/10 bg-black/25",
          compact ? "px-3 py-2.5" : "px-4 py-3",
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "grid grid-cols-[1.15fr_.8fr_1fr] gap-0.5 overflow-hidden rounded-sm",
            compact ? "h-5" : "h-8",
          )}
        >
          <span className="bg-[#5f6a51]" />
          <span className="bg-[#74805d]" />
          <span className="bg-[#4a5540]" />
        </div>
        <div
          className={cn(
            "mt-1 flex items-center justify-between gap-px overflow-hidden rounded-sm bg-[#aee744]/10 px-1",
            compact ? "h-3" : "h-5",
          )}
        >
          {previewWaveform.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="w-0.5 shrink-0 rounded-full bg-[#aee744]/75"
              style={{ height: compact ? height : Math.min(height + 4, 16) }}
            />
          ))}
        </div>
        <span className="absolute bottom-2 left-[42%] top-1.5 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,.25)]" />
        <span className="absolute left-[42%] top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
      </div>
    </div>
  );
}

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
        <section className="border-b border-border/60 py-12 sm:py-16 lg:py-16 xl:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[1fr_.82fr] xl:gap-14">
            <motion.div initial={false}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Mobile Video Editing Programme
              </p>
              <EditingPreview className="mt-5 w-full lg:hidden" />
              <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:mt-5 lg:text-[3.5rem] xl:text-6xl">
                Learn to turn everyday clips into stories people want to watch.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Build practical editing skills with your smartphone and CapCut.
                Learn through guided tutorials, create a final project, and earn a
                certificate of completion after assessment.
              </p>
              <button
                type="button"
                onClick={scrollToRegistration}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Register for free <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Beginner friendly
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
              className="relative hidden h-[420px] w-full max-w-[560px] overflow-hidden rounded-[1.5rem] border border-border/70 bg-[#11130f] shadow-[0_24px_70px_rgba(17,19,15,.16)] lg:block lg:justify-self-end xl:h-[460px]"
            >
              <Image
                src="/cryptic-assets/mobile-video-editing-student-v2.jpg"
                alt="A young woman editing a video on her smartphone"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 42vw, 520px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
              <EditingPreview
                compact
                className="absolute left-4 top-4 w-[216px] backdrop-blur-md xl:left-5 xl:top-5 xl:w-[232px]"
              />
            </motion.div>
          </div>
        </section>

        <section className="border-b border-border/60 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <motion.div {...reveal}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  What you will learn
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Edit with intention, not just effects.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                  Understand the choices that make an edit clear and engaging, so
                  every cut, sound, and transition has a purpose.
                </p>
              </motion.div>

              <motion.ul
                {...reveal}
                className="divide-y divide-border/70 border-y border-border/70"
              >
                {learningOutcomes.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-4 py-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium">{label}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                How it works
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                From registration to a finished project.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Register first, receive the learning materials in your inbox, and
                build your skills through practice.
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
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <motion.article
              {...reveal}
              className="grid gap-10 rounded-[1.5rem] bg-[#11130f] p-7 text-white dark:border dark:border-border/70 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:p-12"
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#aee744]">
                  Final skill assessment
                </p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Create one short video that shows what you can do.
                </h2>
                <p className="mt-5 leading-7 text-white/65">
                  Choose a movie trailer or music-video-style edit. Your finished
                  project should be 45 to 90 seconds long and edited entirely on
                  your mobile phone.
                </p>
              </div>

              <div className="border-t border-white/15 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
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
                <p className="mt-8 rounded-lg bg-white/[0.06] p-4 text-sm leading-6 text-white/65">
                  A certificate of completion is issued after the submitted project
                  has been reviewed and meets the assessment standard.
                </p>
              </div>
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
                Complete the form and we will send the free tutorial playlist to
                your inbox. Learn at your own pace, then take the practical
                assessment when you are ready.
              </p>
              <div className="mt-8 space-y-4">
                {programmeHighlights.map(({ icon: Icon, label }) => (
                  <p
                    key={label}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    {label}
                  </p>
                ))}
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
              <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Common questions
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
                Useful details about the learning experience, assessment, and
                certificate.
              </p>
            </motion.div>
            <div className="mt-12 divide-y divide-border/70 border-y border-border/70">
              {faqs.map(([question, answer]) => (
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
