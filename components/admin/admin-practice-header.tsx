"use client";

import { BookOpenCheck, Ear } from "lucide-react";
import type { KeyboardEvent } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page";
import { cn } from "@/lib/utils";

export type AdminPracticeArea = "reading" | "listening";

const practiceAreas = [
  {
    id: "reading",
    label: "Reading",
    description: "Passages and questions",
    icon: BookOpenCheck,
  },
  {
    id: "listening",
    label: "Listening",
    description: "Audio and questions",
    icon: Ear,
  },
] as const;

export function AdminPracticeHeader({
  activeArea,
  onAreaChange,
}: {
  activeArea: AdminPracticeArea;
  onAreaChange: (area: AdminPracticeArea) => void;
}) {
  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % practiceAreas.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + practiceAreas.length) % practiceAreas.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = practiceAreas.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextArea = practiceAreas[nextIndex];
    onAreaChange(nextArea.id);
    requestAnimationFrame(() => {
      document.getElementById(`admin-${nextArea.id}-tab`)?.focus();
    });
  };

  return (
    <div className="border-b border-border/70 [&>header]:border-b-0 [&>header]:pb-4">
      <DashboardPageHeader
        eyebrow="IELTS preparation"
        title="Practice content"
        description="Create, review, and publish Reading and Listening practice sets from one workspace."
      />

      <div
        role="tablist"
        aria-label="Practice content sections"
        className="-mb-px mt-2 grid grid-cols-2 gap-1 sm:flex sm:gap-2"
      >
        {practiceAreas.map((area, index) => {
          const active = area.id === activeArea;
          const Icon = area.icon;

          return (
            <button
              key={area.id}
              type="button"
              role="tab"
              id={`admin-${area.id}-tab`}
              aria-controls={`admin-${area.id}-panel`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onAreaChange(area.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                "relative flex min-h-16 cursor-pointer items-center gap-3 rounded-t-lg border-b-2 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-52 sm:px-4",
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
                  active
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border/70 bg-background text-muted-foreground",
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {area.label}
                </span>
                <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                  {area.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
