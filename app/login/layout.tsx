import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login - Access Your Dashboard",
  description: "Sign in to your Cryptic Solutions account to access your purchased products, IELTS manual, and learning resources.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

