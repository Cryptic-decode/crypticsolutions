"use client";

import { useState } from "react";

import {
  AdminPracticeHeader,
  type AdminPracticeArea,
} from "@/components/admin/admin-practice-header";
import { ListeningPracticeAdmin } from "@/components/admin/listening-practice-admin";
import { ReadingPracticeAdmin } from "@/components/admin/reading-practice-admin";

export function AdminPracticeWorkspace() {
  const [activeArea, setActiveArea] = useState<AdminPracticeArea>("reading");

  return (
    <>
      <AdminPracticeHeader
        activeArea={activeArea}
        onAreaChange={setActiveArea}
      />

      <section
        id="admin-reading-panel"
        role="tabpanel"
        aria-labelledby="admin-reading-tab"
        hidden={activeArea !== "reading"}
      >
        <ReadingPracticeAdmin />
      </section>

      <section
        id="admin-listening-panel"
        role="tabpanel"
        aria-labelledby="admin-listening-tab"
        hidden={activeArea !== "listening"}
      >
        <ListeningPracticeAdmin />
      </section>
    </>
  );
}
