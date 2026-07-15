"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Code,
  Lightbulb,
  TrendingUp,
  Menu,
  X,
  Mail,
  Zap,
  Award,
  Moon,
  Sun,
  ArrowUp,
  Linkedin,
  Instagram
} from "lucide-react";
import { TikTokIcon } from "@/components/ui/tiktok-icon";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Drawer } from "@/components/ui/drawer";
import { MainDrawer } from "@/components/navigation/main-drawer";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SUPPORT_EMAIL } from "@/lib/contact";
import { SiteFooter } from "@/components/layout/site-footer";
import { fadeInUp, staggerContainer, buttonTap } from "@/lib/animations";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Check if user landed here from a password reset link
    // Supabase adds hash fragments like #access_token=...&type=recovery
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Redirect to update-password page to handle the recovery session
      router.replace('/update-password');
      return;
    }

    // Also check if user has a session but is on homepage - might be recovery session
    // Wait for auth to load before checking
    if (!authLoading && user) {
      // Check if this is a recovery session by looking at URL params or hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
        router.replace('/update-password');
        return;
      }
    }

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Check local storage (client-side only)
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme'));
      setDarkMode(isDark);

      // Handle scroll for Back to Top button
      const handleScroll = () => {
        setShowBackToTop(window.scrollY > 300);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Track active section using Intersection Observer
  useEffect(() => {
    const sections = ['about', 'services', 'products', 'contact'];
    const observers: IntersectionObserver[] = [];

    // Clear active section when at top (Hero section)
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener('scroll', handleScroll);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        },
        {
          rootMargin: '-20% 0px -60% 0px', // Trigger when section is in upper portion of viewport
          threshold: 0.1,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((observer) => observer.disconnect());
    };
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Animation variants now imported from @/lib/animations

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <ScrollBackdrop />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#about"
                className={`text-sm font-bold transition-colors ${activeSection === "about"
                  ? "text-primary"
                  : "text-[#1B2242] dark:text-white hover:text-primary"
                  }`}
                onClick={(e) => handleNavClick(e, "about")}
              >
                About
              </a>
              <a
                href="#services"
                className={`text-sm font-bold transition-colors ${activeSection === "services"
                  ? "text-primary"
                  : "text-[#1B2242] dark:text-white hover:text-primary"
                  }`}
                onClick={(e) => handleNavClick(e, "services")}
              >
                Services
              </a>
              <a
                href="#products"
                className={`text-sm font-bold transition-colors ${activeSection === "products"
                  ? "text-primary"
                  : "text-[#1B2242] dark:text-white hover:text-primary"
                  }`}
                onClick={(e) => handleNavClick(e, "products")}
              >
                Products
              </a>
              <a
                href="#contact"
                className={`text-sm font-bold transition-colors ${activeSection === "contact"
                  ? "text-primary"
                  : "text-[#1B2242] dark:text-white hover:text-primary"
                  }`}
                onClick={(e) => handleNavClick(e, "contact")}
              >
                Contact
              </a>
              {!authLoading && !user && (
                <Link
                  href="/signin"
                  className="text-sm font-bold text-[#1B2242] dark:text-white hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <motion.div whileTap={buttonTap}>
                {user ? (
                  <Button asChild size="sm">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <a href="#products" onClick={(e) => handleNavClick(e, "products")}>Get Started</a>
                  </Button>
                )}
              </motion.div>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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
                  href: "#about",
                  label: "About",
                  onClick: (e) => handleNavClick(e, "about")
                },
                {
                  href: "#services",
                  label: "Services",
                  onClick: (e) => handleNavClick(e, "services")
                },
                {
                  href: "#products",
                  label: "Products",
                  onClick: (e) => handleNavClick(e, "products")
                },
                {
                  href: "#contact",
                  label: "Contact",
                  onClick: (e) => handleNavClick(e, "contact")
                },
                ...(!authLoading && !user ? [{
                  href: "/signin",
                  label: "Sign In",
                  onClick: undefined
                }] : [])
              ]}
              ctaButton={{
                label: user ? "Dashboard" : "Get Started",
                onClick: () => {
                  if (user) {
                    router.push("/dashboard");
                  } else {
                    // Scroll to products section
                    const el = document.getElementById("products");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                },
              }}
            />
          </Drawer>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-20 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            className="relative z-10 text-center lg:text-left"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border bg-primary/10 border-primary/20 px-4 py-1.5 text-sm mb-8 backdrop-blur-sm shadow-sm dark:shadow-primary/5"
              variants={fadeInUp}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Building Digital Excellence</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-6xl font-bold tracking-tight mb-6"
              variants={fadeInUp}
            >
              <span className="text-[#1B2242] dark:text-white">Digital Products That</span>
              <span className="block mt-2 text-primary">Connect Brands to Customers</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl lg:max-w-none"
              variants={fadeInUp}
            >
              We create innovative digital products and solutions that empower businesses and individuals
              to achieve their goals. From educational tools to web platforms, we're building the future of digital excellence.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center lg:items-start"
              variants={fadeInUp}
            >
              <motion.div
                whileTap={buttonTap}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/20 transition-shadow">
                  <a href="#products" onClick={(e) => handleNavClick(e, "products")}>
                    Explore Products
                  </a>
                </Button>
              </motion.div>
              <motion.div
                whileTap={buttonTap}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto hover:bg-primary/5 hover:border-primary/30 transition-colors">
                  <a href="#services" onClick={(e) => handleNavClick(e, "services")}>Learn More</a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative hidden lg:flex justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/undraw-assets/undraw_designing-components_kb05.svg"
              alt="Illustration of designing components"
              width={720}
              height={520}
              priority
              className="w-full max-w-md h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        {/* Subtle right accent */}
        <motion.div
          className="absolute top-8 right-6 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/15 hidden md:block pointer-events-none"
          style={{
            boxShadow:
              "0 0 30px rgba(147, 224, 48, 0.12), 0 0 60px rgba(147, 224, 48, 0.08)",
          }}
          aria-hidden="true"
          animate={{
            y: [0, 10, 0],
            opacity: [0.35, 0.5, 0.35],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="text-[#1B2242] dark:text-white">About</span> <span className="text-primary">Cryptic Solutions</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            We build innovative digital products and human‑centered solutions that simplify complex workflows,
            improve productivity, and drive measurable growth. Our approach blends product thinking, clean
            engineering, and practical UX to deliver secure, scalable, easy‑to‑use software.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-semibold text-[#1B2242] dark:text-white">What we do</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span>Educational tools that make learning accessible and effective</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span>Custom digital products tailored to business workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span>Web platforms and applications for interaction and automation</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-semibold text-[#1B2242] dark:text-white">Why choose us</h3>
              <p className="text-muted-foreground">
                We don’t just build features — we connect the right pieces. By focusing on outcomes and user
                experience, we translate complex challenges into elegant, practical solutions that save time,
                reduce cost, and unlock new value.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* What We Do */}
      <section id="services" className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#1B2242] dark:text-white">What</span> <span className="text-primary">We Do</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Innovative solutions that transform ideas into impactful digital products
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all border hover:border-primary/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1B2242] dark:text-white">Educational Tools</h3>
                <p className="text-muted-foreground">
                  Comprehensive digital learning solutions that make education more accessible and effective.
                </p>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all border hover:border-primary/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1B2242] dark:text-white">Digital Products</h3>
                <p className="text-muted-foreground">
                  Innovative solutions that solve real-world problems and create value for users.
                </p>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all border hover:border-primary/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1B2242] dark:text-white">Web Platforms</h3>
                <p className="text-muted-foreground">
                  Scalable web solutions that help businesses and individuals achieve their digital goals.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-[#1B2242] dark:text-white">Our</span> <span className="text-primary">Products</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Innovative solutions designed to help you succeed
              </p>
            </div>

            {/* Available Products - Horizontal Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* IELTS Manual */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm mb-4">
                    <Award className="h-4 w-4" />
                    <span>Ready Now</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    <span className="text-[#1B2242] dark:text-white">IELTS Preparation</span> <span className="text-primary">Manual</span>
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    Comprehensive preparation guide designed to help you achieve your IELTS goals.
                    Master all four sections with proven strategies and practice materials.
                  </p>

                  <div className="space-y-3 mb-8">
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Complete coverage of all IELTS sections</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Proven test-taking strategies</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Practice questions and examples</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Expert tips and insights</span>
                    </motion.div>
                  </div>

                  <motion.div whileTap={buttonTap} className="w-full">
                    <Button asChild size="lg" className="w-full">
                      <a href="/ielts-manual">
                        Start Learning Now
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </Card>

              {/* Prompt Engineering Ebook */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>Ready Now</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    <span className="text-[#1B2242] dark:text-white">Talk to AI</span> <span className="text-primary">like a Pro</span>
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    Master the art of writing effective AI prompts. Learn proven structures, ready-to-use templates, and strategies that transform your AI interactions.
                  </p>

                  <div className="space-y-3 mb-8">
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">4 comprehensive chapters</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Plug-and-play prompt templates</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Quick read format</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Avoid common prompting pitfalls</span>
                    </motion.div>
                  </div>

                  <motion.div whileTap={buttonTap} className="w-full">
                    <Button asChild size="lg" variant="outline" className="w-full hover:bg-primary/5 hover:border-primary/30">
                      <a href="/prompt-engineering-ebook">
                        Get Instant Access
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </div>

            {/* Quickland - Coming Soon */}
            <Card className="p-8 md:p-12 mt-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 border-primary/20 px-4 py-1.5 text-sm mb-4">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">Coming Soon</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    <span className="text-[#1B2242] dark:text-white">Quickland</span>
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    A revolutionary user input website creator that empowers you to build
                    stunning websites without writing a single line of code. Simply provide
                    your content and watch it come to life.
                  </p>

                  <div className="space-y-3 mb-8">
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">No coding required</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">AI-powered design suggestions</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Responsive and modern layouts</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Fast deployment</span>
                    </motion.div>
                  </div>

                  <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
                    Coming Soon
                  </Button>
                </div>

                <div className="flex items-center justify-center">
                  <motion.div
                    className="relative w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center p-8"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src="/undraw-assets/undraw_building-blocks_h5jb.svg"
                        alt="Quickland Website Builder"
                        width={260}
                        height={180}
                        className="w-full h-auto"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#1B2242] dark:text-white">Ready to</span> <span className="text-primary">Get Started?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our digital products and take the next step in your journey. Or reach out to discuss how we can help with your digital product needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileTap={buttonTap}>
                <Button asChild size="lg">
                  <a href="/ielts-manual">
                    Get IELTS Manual
                  </a>
                </Button>
              </motion.div>
              <motion.div whileTap={buttonTap}>
                <Button asChild size="lg" variant="outline">
                  <a href="/prompt-engineering-ebook">
                    Get Prompt Engineering Ebook
                  </a>
                </Button>
              </motion.div>
              <motion.div whileTap={buttonTap}>
                <Button variant="outline" size="lg" asChild>
                  <a href="#contact">Contact Us</a>
                </Button>
              </motion.div>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#1B2242] dark:text-white">Get in</span> <span className="text-primary">Touch</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Have questions about our products or need custom digital solutions?
              We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileTap={buttonTap}>
                <Button asChild variant="outline" size="lg">
                  <a href={`mailto:${SUPPORT_EMAIL}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Us
                  </a>
                </Button>
              </motion.div>
              <motion.div whileTap={buttonTap}>
                <Button asChild variant="outline" size="lg">
                  <a href="#products" onClick={(e) => handleNavClick(e, "products")}>
                    Explore Products
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors ${showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
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

      <SiteFooter
        quickLinks={[
          { href: "#services", label: "Our Services", onClick: (e) => handleNavClick(e, "services") },
          { href: "#products", label: "Our Products", onClick: (e) => handleNavClick(e, "products") },
          { href: "#contact", label: "Contact Us", onClick: (e) => handleNavClick(e, "contact") },
        ]}
      />
    </div>
  );
}