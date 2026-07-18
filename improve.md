
Improvement Plan
Phase 1 — Cleanup (no behavioral change)
┌─────┬─────────────────────────────────────────────────────────────────────┬────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┐
│ #   │ Task                                                                │ Files                  │ Why                                                                                         │
├─────┼─────────────────────────────────────────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1   │ Remove unused imports (ChevronDown, Send, FileCode)                 │ app/page.tsx           │ Dead code, no impact                                                                        │
│ 2   │ Delete stale SQL file (lydei-schema.sql)                            │ supabase/lydei-schema. │ Leftover from removed Lydei product                                                         │
│     │                                                                     │ sql                    │                                                                                             │
│ 3   │ Fix IELTS footer Products column — missing Prompt Engineering Ebook │ app/ielts-manual/page. │ Inconsistency — homepage and prompt-eng footers both list all 3 products; IELTS footer only │
│     │ link                                                                │ tsx                    │ lists 2                                                                                     │
└─────┴─────────────────────────────────────────────────────────────────────┴────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
Phase 2 — UX improvements
┌─────┬───────────────────────────────────────────┬─────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ #   │ Task                                      │ Files                           │ Why                                                                                                           │
├─────┼───────────────────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4   │ Replace Drawer mobile nav with direct CTA │ app/ielts-manual/page.tsx, app/ │ Following the pattern from the (now-removed) kitchen page: put a visible "Get It" button in the navbar + add  │
│     │ on IELTS manual + Prompt Engineering      │ prompt-engineering-ebook/page.t │ a sticky bottom CTA card on mobile. Removes dependency on Drawer + MainDrawer for these pages. Fasters CTA    │
│     │ pages                                     │ sx                              │ access.                                                                                                       │
│ 5   │ Dashboard "Browse Products" should also   │ app/dashboard/page.tsx          │ Currently only links to /ielts-manual                                                                         │
│     │ link to Prompt Engineering ebook          │                                 │                                                                                                               │
│ 6   │ Consolidate TikTok Pixel scripts from 4   │ app/layout.tsx                  │ 4 pixel scripts is likely redundant — confirm which are actually needed and keep only those                   │
│     │ down to verified count                    │                                 │                                                                                                               │
└─────┴───────────────────────────────────────────┴─────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
Phase 3 — DRY refactor (biggest impact)
┌─────┬─────────────────────────────────────┬─────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────┐
│ #   │ Task                                │ Files                                                           │ Why                                                                                │
├─────┼─────────────────────────────────────┼─────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────┤
│ 7   │ Extract shared footer into a        │ New: components/layout/site-footer.tsxModify: app/page.tsx,     │ The 4-column footer with brand, links, products, contact, and social icons is      │
│     │ reusable component                  │ app/ielts-manual/page.tsx,                                      │ identical across all 3 pages (~80 lines each). Extract once.                       │
│     │                                     │ app/prompt-engineering-ebook/page.tsx                           │                                                                                    │
│ 8   │ Extract shared navigation for       │ New: components/layout/product-nav.tsxModify:                   │ The nav bar (logo + dark mode toggle + mobile CTA) is identical on both product    │
│     │ product pages into a reusable       │ app/ielts-manual/page.tsx,                                      │ pages. The homepage nav is different (has section links), so that stays separate.  │
│     │ component                           │ app/prompt-engineering-ebook/page.tsx                           │                                                                                    │
│ 9   │ Centralize animation variants       │ New: lib/animations.tsModify: app/page.tsx,                     │ Same 3 Framer Motion variant objects defined in every file. ~15 lines each,        │
│     │ (fadeInUp, staggerContainer,        │ app/ielts-manual/page.tsx,                                      │ trivial but clean.                                                                 │
│     │ buttonTap)                          │ app/prompt-engineering-ebook/page.tsx                           │                                                                                    │
└─────┴─────────────────────────────────────┴─────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────┘
Dependency order
Phase 1 ──► Phase 2 ──► Phase 3
(no deps)    (no deps)    (Phase 1 clears unused imports first)