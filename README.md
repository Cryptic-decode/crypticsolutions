# Cryptic Solutions

> Building digital excellence, one product at a time.

A modern digital products platform showcasing educational tools and web solutions. Built with Next.js, TypeScript, Supabase, and Paystack integration.

## 🚀 Features

- **Homepage**: Professional landing page with services, products showcase, and contact information
- **IELTS Manual**: Dedicated product page with detailed features and secure payment integration
- **Payment Processing**: Paystack integration for secure payments
- **User Authentication**: Supabase Auth with email/password authentication
- **Dashboard**: Protected user dashboard with library access (Coming soon)
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth + Database)
- **Payment**: Paystack
- **State Management**: React Context API

## 📦 Products

### IELTS Preparation Manual

- Comprehensive preparation guide
- Complete coverage of all IELTS sections
- Proven test-taking strategies
- Practice questions and examples
- Available now for ₦5,000

### Quickland (Coming Soon)

- User input website creator
- AI-powered design suggestions
- No coding required
- Responsive and modern layouts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Paystack account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cryptic-solutions.git
cd cryptic-solutions
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:

   - Create a new project on [supabase.com](https://supabase.com)
   - Run the SQL from `database-schema.sql` in the Supabase SQL Editor
   - Get your API credentials from Project Settings → API

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cryptic-solutions/
├── app/
│   ├── dashboard/          # User dashboard (protected)
│   ├── ielts-manual/       # IELTS manual product page
│   ├── login/              # Login page
│   ├── payment/            # Payment success handling
│   ├── account-created/    # Account creation confirmation
│   ├── api/                # API routes
│   │   └── payment/        # Payment processing endpoints
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── ui/                 # shadcn/ui components
│   └── payment-paystack.tsx # Payment integration
├── lib/
│   ├── auth.tsx            # Auth context and hooks
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Utility functions
├── public/
│   └── cryptic-assets/     # Logo and icon assets
└── database-schema.sql     # Supabase database schema
```

## 🔐 Environment Variables

| Variable                          | Description               |
| --------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anonymous key    |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service role key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key       |
| `PAYSTACK_SECRET_KEY`             | Paystack secret key       |
| `NEXT_PUBLIC_APP_URL`             | Application URL           |

## 🎨 Design System

- **Primary Color**: `#93E030` (Green)
- **Secondary Color**: `#1B2242` (Navy)
- **Typography**: Geist Sans, Geist Mono
- **Dark Mode**: Enabled by default
- **Icons**: Lucide React

## 🛣️ User Flow

1. User visits homepage
2. Clicks "Get IELTS Manual" or navigates to `/ielts-manual`
3. Reviews product details and enters email
4. Completes payment via Paystack
5. Redirected to success page
6. Creates account with name and email
7. Receives confirmation email from Supabase
8. Confirms email and logs in
9. Accesses protected dashboard with manual

## 🔒 Security Features

- Email verification required before login
- Secure password generation for new users
- Row Level Security (RLS) on Supabase
- Protected routes for authenticated users
- Secure payment processing via Paystack

## 📝 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🚢 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add your environment variables
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## 📄 License

© 2025 Cryptic Solutions. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, contact us at crypticsolutions.contact@gmail.com

## 📞 Support

For support, email crypticsolutions.contact@gmail.com

---

**Building Digital Excellence, One Product at a Time.**
