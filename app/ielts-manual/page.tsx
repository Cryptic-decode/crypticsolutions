"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  BookOpen,
  Shield,
  ArrowUp
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";
import { PaystackPayment } from '@/components/payment-paystack';
import { ProductNav } from "@/components/layout/product-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { fadeInUp, buttonTap } from "@/lib/animations";

export default function IELTSManualPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setShowBackToTop(window.scrollY > 300);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      <ScrollBackdrop />

      <ProductNav
        ctaLabel="Get the Manual – ₦5,000"
        onCtaClick={scrollToPricing}
      />

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              variants={fadeInUp}
            >
              <span className="text-[#1B2242] dark:text-white">Crack the IELTS with Confidence</span> <br />
              <span className="text-primary">Study Smarter, Not Harder</span>
            </motion.h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Don't just prepare for IELTS, <em>understand it.</em> Our <strong>IELTS Preparation Manual</strong> is your step-by-step guide to mastering the test. Built from real strategies that help you think like the examiner and perform like a top scorer.
            </p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg h-14 px-8 cursor-pointer"
                  onClick={scrollToPricing}
                >
                  Get the Complete Manual – ₦5,000
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Why You Need This Manual */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="text-[#1B2242] dark:text-white">Why You</span> <span className="text-primary">Need This Manual</span>
            </h2>
            <Card className="p-8 text-lg text-muted-foreground">
              <p className="mb-4">
                Preparing for IELTS can feel overwhelming, not because it's hard, but because most people don't know what the test really measures.
              </p>
              <p className="mb-4">
                After three or more attempts, many still struggle because they keep "studying English" instead of "studying the test."
              </p>
              <p className="mb-4">
                This manual changes that.
              </p>
              <p>
                It doesn't just throw practice questions at you, it teaches you how to <strong>think strategically</strong> for each section: Listening, Reading, Writing, and Speaking. It's your blueprint for understanding the test from the inside out.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-[#1B2242] dark:text-white">What's</span> <span className="text-primary">Inside</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Here's what you'll find in your copy of the <strong>IELTS Preparation Manual</strong>:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Clear Section Breakdowns</h3>
                  <p className="text-muted-foreground text-sm">
                    Understand how each test part works, what's expected, and what examiners reward.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Practical Reflection Exercises</h3>
                  <p className="text-muted-foreground text-sm">
                    Build awareness and improve weak spots with short guided reflections.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Sample Prompts & Scoring Insights</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn how top scorers structure their answers and manage time.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Real-World Motivation</h3>
                  <p className="text-muted-foreground text-sm">
                    Every section ends with encouragement and insight to keep your confidence high.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mt-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Simple Language, Human Tone</h3>
                <p className="text-muted-foreground text-sm">
                  No jargon, no fluff; just straight, clear, effective guidance.
                </p>
              </div>
            </div>
          </Card>

          <motion.p
            className="text-center mt-8 text-lg font-semibold text-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            This isn't just a study book, it's your <strong>personal IELTS coach in a manual.</strong>
          </motion.p>
        </div>
      </section>

      {/* Who This Manual Is For */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="text-[#1B2242] dark:text-white">Who This Manual</span> <span className="text-primary">Is For</span>
            </h2>

            <Card className="p-8">
              <p className="text-lg mb-2">This guide is perfect for you if:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You've written IELTS before but can't seem to hit your target score.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You're preparing for your first attempt and want to get it right the first time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You prefer self-paced learning but still want expert structure and clarity.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You're migrating, studying abroad, or applying for jobs that require IELTS.</span>
                </li>
              </ul>
              <p className="mt-8 text-lg font-semibold text-primary">
                If that's you, this manual will save you time, money, and frustration.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What Readers Are Saying */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="text-[#1B2242] dark:text-white">What Readers Are</span> <span className="text-primary">Saying</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="relative p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-primary/40" />
                <div className="relative">
                  <div className="absolute -top-1 -left-1 text-4xl text-primary/20">"</div>
                  <blockquote className="text-lg mb-4 text-muted-foreground">
                    I finally understood what IELTS examiners are looking for. After two failed attempts, this manual helped me score an 8 overall. It's clear, motivating, and practical.
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">SO</span>
                    </div>
                    <cite className="not-italic">
                      <div className="font-semibold text-[#1B2242] dark:text-white">Sarah O.</div>
                      <div className="text-sm text-muted-foreground">IELTS Candidate</div>
                    </cite>
                  </div>
                </div>
              </Card>

              <Card className="relative p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-primary/40" />
                <div className="relative">
                  <div className="absolute -top-1 -left-1 text-4xl text-primary/20">"</div>
                  <blockquote className="text-lg mb-4 text-muted-foreground">
                    It's like having a personal coach beside you. The writing section tips alone are worth it.
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">DK</span>
                    </div>
                    <cite className="not-italic">
                      <div className="font-semibold text-[#1B2242] dark:text-white">David K.</div>
                      <div className="text-sm text-muted-foreground">Nigeria</div>
                    </cite>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing & Offer */}
      <section id="pricing" className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="text-[#1B2242] dark:text-white">Pricing</span> <span className="text-primary">& Offer</span>
            </h2>

            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left Column - Features */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-[#1B2242] dark:text-white">Complete Package Includes:</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2242] dark:text-white">Full Test Coverage</p>
                        <p className="text-sm text-muted-foreground">6 comprehensive sections for all IELTS parts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2242] dark:text-white">Practice Materials</p>
                        <p className="text-sm text-muted-foreground">Writing prompts, speaking exercises, and reflection guides</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2242] dark:text-white">Lifetime Access</p>
                        <p className="text-sm text-muted-foreground">Free updates and improvements for one year</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Right Column - Pricing */}
                <div className="text-center md:text-left md:border-l md:border-primary/20 md:pl-8">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-primary mb-2">Special Launch Price</p>
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-4xl font-bold text-[#1B2242] dark:text-white">₦5,000</span>
                      <span className="text-muted-foreground line-through">₦10,000</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Instant digital access</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Read on any device</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>30-day satisfaction guarantee</span>
                    </li>
                  </ul>

                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                        Enter your email to continue
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        required
                      />
                      {email && !email.includes('@') && (
                        <p className="text-xs text-destructive">Please enter a valid email address</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label htmlFor="referral" className="text-sm font-medium text-muted-foreground">
                        Have a referral code? <span className="text-xs text-muted-foreground/60">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="referral"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FRIEND20"
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        maxLength={20}
                      />
                    </div>

                    <motion.div whileHover={email && email.includes('@') ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}>
                      <PaystackPayment
                        email={email}
                        amount={5000}
                        productId="ielts-manual"
                        productName="IELTS Preparation Manual"
                        successPath="/payment/success"
                        referralCode={referralCode || undefined}
                        metadata={{
                          product: "IELTS Manual",
                          currency: "NGN"
                        }}
                        onError={(error) => {
                          console.error('Payment failed:', error);
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Safe & Secure Access */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-[#1B2242] dark:text-white">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Processed safely through Paystack's trusted payment gateway
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-[#1B2242] dark:text-white">Instant Access</h3>
                <p className="text-sm text-muted-foreground">
                  Read online anytime through your personal student dashboard
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-[#1B2242] dark:text-white">Protected Content</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized watermarking ensures your copy stays secure
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-[#1B2242] dark:text-white">Still Thinking About It?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              That's okay. Here's something to remember: Most people fail IELTS not because they're bad at English, but because they're not <em>strategic</em>.
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              This manual gives you that strategy. So before you spend months guessing what works, learn from something designed to help you <strong>win the test, not just write it.</strong>
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full md:w-auto text-lg h-14 px-12 cursor-pointer"
                onClick={scrollToPricing}
              >
                I'm Ready – Get the Manual
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 md:bottom-8 right-8 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors ${
          showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
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

      <SiteFooter />
    </div>
  );
}
