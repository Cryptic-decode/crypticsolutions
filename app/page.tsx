"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  FileText,
  FileCode,
  Code,
  Lightbulb,
  TrendingUp,
  Menu,
  X,
  Send,
  Mail,
  ChevronDown,
  Zap,
  Award,
  Moon,
  Sun,
  ArrowUp,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Drawer } from "@/components/ui/drawer";
import { MainDrawer } from "@/components/navigation/main-drawer";
import { ScrollBackdrop } from "@/components/effects/scroll-backdrop";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const buttonTap = {
    scale: 0.98,
    transition: { duration: 0.1 }
  };

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
                href="#services" 
                className="text-sm font-bold text-[#1B2242] dark:text-white hover:text-primary transition-colors"
                onClick={(e) => handleNavClick(e, "services")}
              >
                Services
              </a>
              <a 
                href="#products" 
                className="text-sm font-bold text-[#1B2242] dark:text-white hover:text-primary transition-colors"
                onClick={(e) => handleNavClick(e, "products")}
              >
                Products
              </a>
              <a 
                href="#contact" 
                className="text-sm font-bold text-[#1B2242] dark:text-white hover:text-primary transition-colors"
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
      <section className="relative container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32">
        {/* Decorative Floating Elements */}
        <motion.div
          className="absolute top-16 left-8 w-6 h-6 rounded-full bg-primary/50 dark:bg-primary/45 hidden md:block z-[1] pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(147, 224, 48, 0.15), 0 0 40px rgba(147, 224, 48, 0.1)'
          }}
          aria-hidden="true"
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 0.65, 0.5],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-24 right-8 w-7 h-7 rounded-full bg-emerald-400/45 dark:bg-emerald-300/40 hidden lg:block z-[1] pointer-events-none"
          style={{
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.15), 0 0 50px rgba(34, 197, 94, 0.1)'
          }}
          aria-hidden="true"
          animate={{
            y: [0, 15, 0],
            opacity: [0.45, 0.6, 0.45],
            scale: [1, 1.25, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 right-12 w-7 h-7 rounded-full bg-primary/40 dark:bg-primary/35 hidden lg:block z-[1] pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(147, 224, 48, 0.15), 0 0 40px rgba(147, 224, 48, 0.1)'
          }}
          aria-hidden="true"
          animate={{
            y: [0, -18, 0],
            opacity: [0.4, 0.55, 0.4],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <motion.div 
          className="mx-auto max-w-4xl text-center relative z-10"
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
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            variants={fadeInUp}
          >
            <span className="text-[#1B2242] dark:text-white">Digital Products That</span>
            <span className="block mt-2 text-primary">Connect Brands to Customers</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            We create innovative digital products and solutions that empower businesses and individuals 
            to achieve their goals. From educational tools to web platforms, we're building the future of digital excellence.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
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

            {/* IELTS Manual - Featured */}
            <Card className="p-8 md:p-12 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm mb-4">
                    <Award className="h-4 w-4" />
                    <span>Ready Now</span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="text-[#1B2242] dark:text-white">IELTS Preparation</span> <span className="text-primary">Manual</span>
                  </h3>
                  
                  <p className="text-lg text-muted-foreground mb-6">
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
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Complete coverage of all IELTS sections</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Proven test-taking strategies</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Practice questions and examples</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Expert tips and insights</span>
                    </motion.div>
                  </div>

                  <motion.div whileTap={buttonTap} className="w-full sm:w-auto">
                    <Button asChild size="lg" className="w-fit">
                      <a href="/ielts-manual">
                        Get Your Manual Now
                      </a>
                    </Button>
                  </motion.div>
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
                        src="/undraw-assets/undraw_transfer-files_anat.svg"
                        alt="IELTS Preparation Manual"
                        width={300}
                        height={220}
                        className="w-full h-auto"
                      />
                    </motion.div>
                    <motion.div 
                      className="absolute -top-4 -right-4 bg-primary p-4 rounded-xl shadow-lg"
                      initial={{ rotate: -20 }}
                      animate={{ rotate: [-20, 10, -20] }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      whileHover={{ scale: 1.2, rotate: 0 }}
                    >
                      <Zap className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </Card>

            {/* Quickland */}
            <Card className="p-8 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="relative w-full max-w-md">
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
                    <motion.div 
                      className="absolute -top-4 -right-4 bg-primary p-3 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Lightbulb className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 border-primary/20 px-4 py-1.5 text-sm mb-4">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">Coming Soon</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#1B2242] dark:text-white">
                    Quickland
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    A revolutionary user input website creator that empowers you to build 
                    stunning websites without writing a single line of code. Simply provide 
                    your content and watch it come to life.
                  </p>

                  <div className="space-y-3 mb-6">
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>No coding required</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>AI-powered design suggestions</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Responsive and modern layouts</span>
                    </motion.div>
                  </div>

                  <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
                    Coming Soon
                  </Button>
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
              Get your IELTS preparation manual today and take the first step towards your 
              IELTS success. Or reach out to discuss how we can help with your digital product needs.
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
                  <a href="mailto:crypticsolutions.contact@gmail.com">
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
                    <a 
                      href="#services" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => handleNavClick(e, "services")}
                    >
                      Our Services
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#products" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => handleNavClick(e, "products")}
                    >
                      Our Products
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#contact" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => handleNavClick(e, "contact")}
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-bold text-[#1B2242] dark:text-white mb-4">Products</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <span className="text-muted-foreground">IELTS Manual</span>
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
                    <a href="mailto:crypticsolutions.contact@gmail.com" className="hover:text-primary transition-colors">
                      crypticsolutions.contact@gmail.com
                    </a>
                  </li>
                </ul>
                <div className="flex items-center gap-3 mt-4">
                  <a 
                    href="https://linkedin.com/company/cryptic-solutions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://twitter.com/crypticsolutions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
          </a>
          <a
                    href="https://facebook.com/crypticsolutions" 
            target="_blank"
            rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
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