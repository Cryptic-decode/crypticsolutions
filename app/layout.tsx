import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { OrganizationSchema } from "@/components/seo/structured-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com'),
  title: {
    default: "Cryptic Solutions - Premium Digital Products & Educational Resources",
    template: "%s | Cryptic Solutions"
  },
  description: "Cryptic Solutions delivers premium digital products including IELTS preparation manuals, educational resources, and custom web solutions. Transform your learning and business with our innovative tools.",
  keywords: [
    "IELTS preparation",
    "IELTS manual",
    "educational resources",
    "digital products",
    "web development",
    "business solutions",
    "online learning",
    "exam preparation",
    "study materials"
  ],
  authors: [{ name: "Cryptic Solutions" }],
  creator: "Cryptic Solutions",
  publisher: "Cryptic Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/cryptic-assets/logoIconGreen.png' },
      { url: '/cryptic-assets/logoIconGreen.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/cryptic-assets/logoIconGreen.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Cryptic Solutions',
    title: 'Cryptic Solutions - Premium Digital Products & Educational Resources',
    description: 'Premium IELTS preparation manuals, educational resources, and custom digital solutions to transform your learning journey.',
    images: [
      {
        url: '/cryptic-assets/logoIconGreen.png',
        width: 1200,
        height: 630,
        alt: 'Cryptic Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptic Solutions - Premium Digital Products & Educational Resources',
    description: 'Premium IELTS preparation manuals, educational resources, and custom digital solutions.',
    images: ['/cryptic-assets/logoIconGreen.png'],
    creator: '@crypticsolutions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to dark theme
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrganizationSchema url={process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com'} />
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
