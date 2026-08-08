import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductVisualProps {
  kind: "ielts" | "prompts";
  className?: string;
  priority?: boolean;
}

const covers = {
  ielts: {
    src: "/product-assets/ielts-manual-cover.png",
    alt: "IELTS Preparation Manual cover",
  },
  prompts: {
    src: "/product-assets/prompt-engineering-cover.png",
    alt: "Talk to AI Like a Pro ebook cover",
  },
};

export function ProductVisual({ kind, className, priority = false }: ProductVisualProps) {
  const cover = covers[kind];

  return (
    <div className={cn("relative isolate flex min-h-80 items-center justify-center overflow-hidden bg-muted/45 p-8 dark:bg-white/[0.025]", className)}>
      <div className="absolute -bottom-5 left-1/2 h-10 w-48 -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl dark:bg-black/55" />
      <div className="relative aspect-[.707] w-44 sm:w-52">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 176px, 208px"
          className="rounded-sm object-cover shadow-[16px_22px_45px_rgba(0,0,0,.28)] ring-1 ring-black/10 dark:ring-white/10"
        />
      </div>
    </div>
  );
}
