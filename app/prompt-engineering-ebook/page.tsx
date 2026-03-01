"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft,
  CheckCircle2,
  FileText,
  BookOpen,
  Moon,
  Sun,
  Mail,
  Linkedin,
  Instagram,
  Shield,
  ArrowUp,
  Menu,
  X,
  Sparkles,
  Zap,
  Code,
  Lightbulb
} from "lucide-react";
import { TikTokIcon } from "@/components/ui/tiktok-icon";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Drawer } from "@/components/ui/drawer";
import { MainDrawer } from "@/components/navigation/main-drawer";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";
import { PaystackPayment } from '@/components/payment-paystack';

export default function PromptEngineeringEbookPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme'));
      setDarkMode(isDark);

      const handleScroll = () => {
        setShowBackToTop(window.scrollY > 300);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      <ScrollBackdrop />
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/cryptic-assets/fullLogo.png" 
                alt="Cryptic Solutions" 
                width={180} 
                height={45}
                className="h-[45px] w-auto dark:hidden"
                priority
              />
              <Image 
                src="/cryptic-assets/fullLogo2.png" 
                alt="Cryptic Solutions" 
                width={180} 
                height={45}
                className="h-[45px] w-auto hidden dark:block"
                priority
              />
            </Link>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleDarkMode}
                className="hidden md:block p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Drawer
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          >
            <MainDrawer
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onClose={() => setMobileMenuOpen(false)}
              links={[
                {
                  href: "/",
                  label: "Back to Home"
                }
              ]}
              ctaButton={{
                label: "Get the Ebook – ₦1,500",
                onClick: () => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
            />
          </Drawer>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
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
              <span className="text-[#1B2242] dark:text-white">Master AI Communication</span> <br />
              <span className="text-primary">Write Prompts That Actually Work</span>
            </motion.h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Stop guessing what AI needs. <strong>Talk to AI like a Pro</strong> teaches you the proven structure, templates, and strategies that transform vague requests into powerful results. Learn to communicate with AI like a pro.
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
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  Get the Ebook – ₦1,500
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Why You Need This Ebook */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="text-[#1B2242] dark:text-white">Why You</span> <span className="text-primary">Need This Ebook</span>
            </h2>
            <Card className="p-8 text-lg text-muted-foreground">
              <p className="mb-4">
                Most people struggle with AI because they don't understand how to communicate with it effectively. You might spend hours refining prompts, only to get mediocre results that don't match what you envisioned.
              </p>
              <p className="mb-4">
                The problem isn't the AI—it's how you're asking. Most prompts fail because they're too vague, too complex, or missing critical context.
              </p>
              <p className="mb-4">
                This ebook changes that.
              </p>
              <p>
                It doesn't just give you tips, it teaches you the <strong>fundamental structure</strong> of effective prompts, provides <strong>ready-to-use templates</strong>, and shows you how to avoid the common mistakes that waste your time. It's your blueprint for getting better results from AI, faster.
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
              Here's what you'll find in your copy of <strong>Talk to AI like a Pro</strong>:
            </p>
          </motion.div>

          <div className="space-y-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Introduction</h3>
                  <p className="text-muted-foreground text-sm">
                    Get oriented with the fundamentals of prompt engineering and understand why most prompts fail.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Chapter 1: Why Most AI Prompts Don't Work</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover the common mistakes that lead to poor AI responses. Learn what separates effective prompts from ineffective ones and why understanding this matters.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Chapter 2: The Simple Structure of a Great Prompt</h3>
                  <p className="text-muted-foreground text-sm">
                    Master the fundamental building blocks of effective prompts. Learn the proven structure that ensures AI understands exactly what you need.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Chapter 3: Plug-and-Play Prompt Templates</h3>
                  <p className="text-muted-foreground text-sm">
                    Get instant access to ready-to-use prompt templates for common tasks. Copy, customize, and start getting better results immediately.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Chapter 4: Avoiding Common Prompting Pitfalls & Leveling Up Fast</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn from the mistakes others make and discover advanced techniques to take your prompt engineering skills to the next level.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">Closing</h3>
                  <p className="text-muted-foreground text-sm">
                    Wrap up with key takeaways and next steps to continue improving your AI communication skills.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <motion.p 
            className="text-center mt-8 text-lg font-semibold text-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            This isn't just a guide, it's your <strong>practical roadmap to better AI results.</strong>
          </motion.p>
        </div>
      </section>

      {/* Who This Ebook Is For */}
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
              <span className="text-[#1B2242] dark:text-white">Who This Ebook</span> <span className="text-primary">Is For</span>
            </h2>
            
            <Card className="p-8">
              <p className="text-lg mb-2">This guide is perfect for you if:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You use AI tools regularly but struggle to get the results you want.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You're new to AI and want to start with best practices from day one.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You want to save time by learning proven prompt structures instead of trial and error.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You're a professional using AI for work and need reliable, consistent results.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You want ready-to-use templates you can adapt for your specific needs.</span>
                </li>
              </ul>
              <p className="mt-8 text-lg font-semibold text-primary">
                If that's you, this ebook will transform how you interact with AI and dramatically improve your results.
              </p>
            </Card>
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
                        <p className="font-medium text-[#1B2242] dark:text-white">4 Comprehensive Chapters</p>
                        <p className="text-sm text-muted-foreground">From fundamentals to advanced techniques</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2242] dark:text-white">Ready-to-Use Templates</p>
                        <p className="text-sm text-muted-foreground">Plug-and-play prompts you can use immediately</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2242] dark:text-white">Quick Read Format</p>
                        <p className="text-sm text-muted-foreground">Concise, actionable content you can finish in one sitting</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Right Column - Pricing */}
                <div className="text-center md:text-left md:border-l md:border-primary/20 md:pl-8">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-primary mb-2">Special Launch Price</p>
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-4xl font-bold text-[#1B2242] dark:text-white">₦1,500</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Instant digital download</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Read on any device</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Lifetime access</span>
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

                    <motion.div whileHover={email && email.includes('@') ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}>
                      <PaystackPayment 
                        email={email}
                        amount={1500}
                        productId="talk-to-ai-like-a-pro"
                        productName="Talk to AI like a Pro"
                        successPath="/payment/ebook-success"
                        metadata={{
                          product: "Prompt Engineering Ebook",
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
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-[#1B2242] dark:text-white">Instant Download</h3>
                <p className="text-sm text-muted-foreground">
                  Get immediate access to your ebook after purchase
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-[#1B2242] dark:text-white">Digital Format</h3>
                <p className="text-sm text-muted-foreground">
                  PDF format works on all devices - phone, tablet, or computer
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
              <span className="text-[#1B2242] dark:text-white">Ready to Master Prompt Engineering?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop wasting time on prompts that don't work. Learn the proven structure, templates, and strategies that will transform your AI interactions.
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              This quick-read ebook gives you everything you need to start getting better results from AI <strong>today.</strong>
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="lg" 
                className="w-full md:w-auto text-lg h-14 px-12 cursor-pointer"
                onClick={() => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Get the Ebook Now – ₦1,500
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors ${
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

      {/* Footer */}
      <footer className="border-t bg-secondary/30 py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="md:col-span-1">
                <div className="flex items-center cursor-pointer mb-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
                  <li>
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/#services" className="text-muted-foreground hover:text-primary transition-colors">
                      Our Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/#products" className="text-muted-foreground hover:text-primary transition-colors">
                      Our Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/#contact" className="text-muted-foreground hover:text-primary transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-bold text-[#1B2242] dark:text-white mb-4">Products</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/ielts-manual" className="text-muted-foreground hover:text-primary transition-colors">
                      IELTS Manual
                    </Link>
                  </li>
                  <li>
                    <Link href="/prompt-engineering-ebook" className="text-muted-foreground hover:text-primary transition-colors">
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
                    <a href="mailto:info@crypticsolutionsltd.com" className="hover:text-primary transition-colors">
                      info@crypticsolutionsltd.com
                    </a>
                  </li>
                </ul>
                <div className="flex items-center gap-3 mt-4">
                  <a 
                    href="https://www.tiktok.com/@cryptic.solutions?_r=1&_t=ZS-93LUV85mxZV" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://www.instagram.com/cryptic.solutions?igsh=dTR2dW5oaWc4amg4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/cryptic-solutions-5ba56b397?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
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
    </div>
  );
}
