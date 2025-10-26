# Cryptic Solutions Design Guide

A comprehensive guide to maintaining design consistency across the Cryptic Solutions platform.

## 🎨 Brand Identity

### Logo & Branding

- **Brand Name**: Cryptic Solutions
- **Target Audience**: Business owners worldwide seeking digital products
- **Brand Personality**: Professional, modern, innovative, results-driven

### Logo Assets

Available in `/public/cryptic-assets/`:

- `fullLogo.png` - Full logo (standard)
- `fullLogo2.png` - Full logo (alternative)
- `fullLogoBlack.png` - Full logo for dark backgrounds
- `fullLogoWhite.png` - Full logo for light backgrounds
- `logoIconBlack.png` - Icon only for dark backgrounds
- `logoIconBlue.png` - Icon in blue
- `logoIconGreen.png` - Icon in green
- `logoIconWhite.png` - Icon for light backgrounds

### Color Palette

#### Primary Colors

```css
/* Primary Brand Color - Green */
--primary: 147 224 48; /* #93E030 - Cryptic Green */

/* Primary Variants */
--primary-foreground: 255 255 255; /* White text on primary */
--primary/10: rgba(147, 224, 48, 0.1); /* Light primary background */
--primary/20: rgba(147, 224, 48, 0.2); /* Medium primary background */

/* Secondary Brand Color - Navy */
--secondary: 27 34 66; /* #1B2242 - Cryptic Navy */

/* Secondary Variants */
--secondary-foreground: 255 255 255; /* White text on navy */
--secondary/10: rgba(27, 34, 66, 0.1); /* Light navy background */
--secondary/20: rgba(27, 34, 66, 0.2); /* Medium navy background */

/* Gradient Combinations */
gradient-primary: linear-gradient(135deg, #93e030 0%, #1b2242 100%);
gradient-secondary: linear-gradient(135deg, #1b2242 0%, #93e030 100%);
```

#### Neutral Colors

```css
/* Light Mode */
--background: 255 255 255; /* White */
--foreground: 15 23 42; /* Slate-900 */
--muted: 248 250 252; /* Slate-50 */
--muted-foreground: 100 116 139; /* Slate-500 */
--border: 226 232 240; /* Slate-200 */

/* Dark Mode */
--background: 15 23 42; /* Slate-900 */
--foreground: 248 250 252; /* Slate-50 */
--muted: 30 41 59; /* Slate-800 */
--muted-foreground: 148 163 184; /* Slate-400 */
--border: 51 65 85; /* Slate-700 */
```

## 🎭 Typography

### Font Stack

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Font Sizes & Weights

```css
/* Headings */
h1: text-4xl font-bold (36px, 700)
h2: text-3xl font-bold (30px, 700)
h3: text-2xl font-semibold (24px, 600)
h4: text-xl font-semibold (20px, 600)
h5: text-lg font-medium (18px, 500)
h6: text-base font-medium (16px, 500)

/* Body Text */
body-large: text-lg font-normal (18px, 400)
body: text-base font-normal (16px, 400)
body-small: text-sm font-normal (14px, 400)
caption: text-xs font-medium (12px, 500)
```

### Line Heights

```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## 🎪 Spacing System

### Base Spacing Scale

```css
/* Tailwind Spacing Scale */
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
32: 8rem (128px)
```

### Component Spacing

```css
/* Card Padding */
--card-padding: 1.5rem (24px)

/* Form Spacing */
--form-gap: 1.5rem (24px)
--input-spacing: 0.75rem (12px)

/* Section Spacing */
--section-gap: 4rem (64px)
--container-padding: 1.5rem (24px)
```

## 🧩 Component Patterns

### Cards

```tsx
// Standard Card Pattern
<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
  <CardHeader>
    <CardTitle className="text-gray-900 dark:text-white">Title</CardTitle>
    <CardDescription className="text-gray-600 dark:text-gray-400">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Gradient Card Pattern
<Card className="bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/50 dark:from-primary/10 dark:via-gray-800/50 dark:to-gray-800/50 backdrop-blur-sm border-primary/20 dark:border-primary/30">
```

### Buttons

```tsx
// Primary Button
<Button className="gradient-primary text-white hover:opacity-90 transition-opacity">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-gray-300 dark:border-gray-600 hover:border-primary/50">
  Secondary Action
</Button>

// Ghost Button
<Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-800">
  Ghost Action
</Button>
```

### Form Elements

```tsx
// Input Pattern
<div className="space-y-2">
  <Label htmlFor="field" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Label
  </Label>
  <Input
    id="field"
    className="h-12 text-base border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
    placeholder="Placeholder text"
  />
</div>

// Textarea Pattern
<div className="space-y-2">
  <Label htmlFor="textarea" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Label
  </Label>
  <Textarea
    id="textarea"
    className="min-h-[120px] text-base border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
    placeholder="Placeholder text"
  />
</div>
```

## 🎬 Animation Standards

### Framer Motion Patterns

```tsx
// Page Transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Card Animations
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
};

// Stagger Animations
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
```

### Transition Timing

```css
/* Standard Transitions */
--transition-fast: 0.15s ease-out
--transition-normal: 0.2s ease-out
--transition-slow: 0.3s ease-out

/* Hover Effects */
hover:scale-105 transition-transform duration-200
hover:opacity-80 transition-opacity duration-200
```

## 🌙 Dark Mode Standards

### Background Patterns

```tsx
// Glass Effect Backgrounds
className = "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md";

// Card Backgrounds
className = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm";

// Gradient Backgrounds
className =
  "bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/50 dark:from-primary/10 dark:via-gray-800/50 dark:to-gray-800/50";
```

### Border Patterns

```tsx
// Standard Borders
className = "border-gray-200/50 dark:border-gray-700/50";

// Primary Borders
className = "border-primary/20 dark:border-primary/30";

// Interactive Borders
className = "border-gray-300 dark:border-gray-600 hover:border-primary/50";
```

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Layout Patterns

```tsx
// Container Pattern
<div className="container mx-auto px-6 py-8">

// Grid Patterns
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="grid lg:grid-cols-2 gap-8">

// Flex Patterns
<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
```

## 🎯 Form Design Patterns

### Multi-Step Form Structure

```tsx
// Step Header
<motion.header
  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200/60 dark:border-gray-700/60"
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {/* Progress indicator and step info */}
</motion.header>

// Form Content
<motion.main
  className="container mx-auto px-6 py-8"
  variants={containerVariants}
  initial="initial"
  animate="animate"
>
  {/* Form steps */}
</motion.main>
```

### Progress Indicator

```tsx
// Step Progress
<div className="flex items-center space-x-4">
  {steps.map((step, index) => (
    <div key={step.number} className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= step.number
            ? "bg-primary text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        }`}
      >
        {step.number}
      </div>
      {index < steps.length - 1 && (
        <div
          className={`w-12 h-0.5 mx-2 ${
            currentStep > step.number
              ? "bg-primary"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      )}
    </div>
  ))}
</div>
```

## 🎨 Template Design Standards

### Template Card Pattern

```tsx
<motion.div
  variants={cardVariants}
  whileHover="hover"
  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
    selected
      ? "border-primary bg-primary/5 dark:bg-primary/10"
      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
  }`}
>
  {/* Template preview */}
  <div className="relative mb-4 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
    {/* Template icon and preview button */}
  </div>

  {/* Template details */}
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {template.title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {template.description}
    </p>
  </div>
</motion.div>
```

### Template Preview Modal

```tsx
// Modal Structure
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
        {template?.title} Template Preview
      </DialogTitle>
    </DialogHeader>

    {/* Desktop/Mobile toggle */}
    <div className="flex items-center justify-center space-x-2 mb-4">
      <Button
        variant={viewMode === "desktop" ? "default" : "outline"}
        size="sm"
      >
        <Monitor className="h-4 w-4 mr-2" />
        Desktop
      </Button>
      <Button variant={viewMode === "mobile" ? "default" : "outline"} size="sm">
        <Smartphone className="h-4 w-4 mr-2" />
        Mobile
      </Button>
    </div>

    {/* Template preview */}
    <div className="flex-1 overflow-auto">{/* Template content */}</div>
  </DialogContent>
</Dialog>
```

## 🎪 Dashboard Design Patterns

### Header Pattern

```tsx
<motion.header
  className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200/60 dark:border-gray-700/60"
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5 dark:from-primary/10 dark:via-transparent dark:to-blue-500/10" />

  <div className="relative container mx-auto px-6 py-5">
    <div className="flex justify-between items-center">
      {/* Logo and title */}
      <motion.div className="flex items-center space-x-6">
        <Logo size="md" />
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            QuickLand Control Center
          </p>
        </div>
      </motion.div>

      {/* User profile and actions */}
      <motion.div className="flex items-center space-x-4">
        {/* User profile card */}
        <motion.div className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          {/* Avatar and user info */}
        </motion.div>

        {/* Theme toggle and sign out */}
      </motion.div>
    </div>
  </div>
</motion.header>
```

### Section Layout Pattern

```tsx
// Two-column layout
<div className="grid lg:grid-cols-2 gap-8">
  <motion.div variants={cardVariants}>
    <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
      {/* Section content */}
    </Card>
  </motion.div>

  <motion.div variants={cardVariants}>
    <Card className="h-full bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/50 dark:from-primary/10 dark:via-gray-800/50 dark:to-gray-800/50 backdrop-blur-sm border-primary/20 dark:border-primary/30">
      {/* Section content */}
    </Card>
  </motion.div>
</div>
```

## 🎨 Icon Usage

### Icon Sizes

```tsx
// Standard icon sizes
h-4 w-4  // Small icons (16px)
h-5 w-5  // Medium icons (20px)
h-6 w-6  // Large icons (24px)
h-8 w-8  // Extra large icons (32px)
```

### Icon Colors

```tsx
// Standard icon colors
text-gray-400 dark:text-gray-500        // Muted icons
text-gray-600 dark:text-gray-400        // Secondary icons
text-primary                            // Primary icons
text-white                              // Icons on colored backgrounds
```

## 🎯 Accessibility Standards

### Focus States

```css
/* Focus ring */
focus:ring-2 focus:ring-primary/20 focus:ring-offset-2

/* Focus visible */
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20
```

### Color Contrast

- **Text on light backgrounds**: Minimum 4.5:1 contrast ratio
- **Text on dark backgrounds**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Include alt text for all images
- Use proper form labels and associations
- Implement proper ARIA attributes where needed

## 🚀 Performance Standards

### Image Optimization

```tsx
// Next.js Image component
<Image
  src="/path/to/image.jpg"
  alt="Descriptive alt text"
  width={400}
  height={300}
  className="rounded-lg"
  priority={false} // Only for above-the-fold images
/>
```

### Animation Performance

- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Prefer CSS transitions over JavaScript animations for simple effects

## 📝 Content Guidelines

### Writing Style

- **Tone**: Professional yet approachable
- **Voice**: Confident, helpful, innovative
- **Language**: Clear, concise, jargon-free
- **Target Audience**: Business owners worldwide

### Button Text Standards

```tsx
// Primary Actions
"Get Started";
"Create Landing Page";
"Generate Page";
"Continue";

// Secondary Actions
"Learn More";
"View Templates";
"Back";
"Cancel";

// Destructive Actions
"Delete";
"Remove";
"Sign Out";
```

### Form Labels

- Use clear, descriptive labels
- Include helpful placeholder text
- Provide validation messages
- Use consistent terminology

---

## 🎯 Quick Reference

### Most Used Classes

```css
/* Backgrounds */
bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/50

/* Borders */
border-gray-200/50 dark:border-gray-700/50
border-primary/20 dark:border-primary/30

/* Text Colors */
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400
text-primary

/* Spacing */
space-y-4 md:space-y-0
gap-6
p-6
```

### Animation Patterns

```tsx
// Standard page animation
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease: "easeOut" }}

// Hover effects
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

This design guide ensures consistency across all QuickLand components and pages. Always reference this guide when creating new components or updating existing ones! 🎨✨
