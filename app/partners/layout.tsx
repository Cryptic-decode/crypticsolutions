import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Programme",
  description: "Join the Cryptic Partner Programme and earn commission by connecting IELTS candidates with an affordable, structured preparation portal.",
};

export default function PartnersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
