import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Video Editing Programme",
  description:
    "Learn practical mobile video editing with free guided tutorials, complete a creative assessment, and earn a certificate of completion.",
  alternates: { canonical: "/mobile-video-editing" },
  openGraph: {
    title: "Mobile Video Editing Programme | Cryptic Solutions",
    description:
      "Learn to edit engaging videos using your smartphone and CapCut.",
    url: "/mobile-video-editing",
    type: "website",
  },
};

export default function MobileVideoEditingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

