import Image from "next/image";
import { BookOpen, GraduationCap, PanelsTopLeft } from "lucide-react";

const capabilities = [
  {
    title: "Practical ebooks",
    description: "Learn and apply",
    icon: BookOpen,
    position: "left-0 top-[21%]",
  },
  {
    title: "Learning tools",
    description: "Build real skills",
    icon: GraduationCap,
    position: "bottom-[18%] left-[-2%]",
  },
  {
    title: "Useful software",
    description: "Tools that work",
    icon: PanelsTopLeft,
    position: "right-0 top-[48%]",
  },
] as const;

export function BrandHeroVisual() {
  return (
    <div className="relative isolate h-[32rem] w-full" aria-hidden="true">
      <div className="absolute inset-[-4%] [mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)]">
        <Image
          src="/cryptic-assets/hero-sculpture-light-transparent.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 560px, 0px"
          className="object-contain dark:hidden"
        />
        <Image
          src="/cryptic-assets/hero-sculpture-dark-transparent.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 560px, 0px"
          className="hidden object-contain dark:block"
        />
      </div>

      {capabilities.map(({ title, description, icon: Icon, position }) => (
        <div
          key={title}
          className={`absolute ${position} flex min-w-44 items-center gap-3 rounded-lg border border-border/70 bg-background/80 px-4 py-3 shadow-[0_12px_35px_rgba(20,25,16,.12)] backdrop-blur-md dark:bg-[#0b0d0a]/80 dark:shadow-[0_16px_40px_rgba(0,0,0,.3)]`}
        >
          <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold leading-5 text-foreground">{title}</p>
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
