# Caritas — AI Study Companion

> A premium, Apple-inspired AI study platform for university students. Caritas unifies an AI tutor, course material analyzer, study planner, GPA calculator, research assistant and history workspace into one focused, minimal experience.

Built for **Caritas University** (~3,000 students) with a FAANG-level UI/UX bar: clean typography, glass surfaces, semantic design tokens, smooth motion, and full responsive support across desktop, tablet, and mobile.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment & Secrets](#environment--secrets)
6. [Design System](#design-system)
7. [Application Routes & Pages](#application-routes--pages)
8. [Core Features](#core-features)
9. [Authentication](#authentication)
10. [Database Schema](#database-schema)
11. [Edge Functions (Supabase)](#edge-functions-supabase)
12. [Frontend Hooks](#frontend-hooks)
13. [Storage Buckets](#storage-buckets)
14. [Document Parsing Pipeline](#document-parsing-pipeline)
15. [State Management & Data Flow](#state-management--data-flow)
16. [Deployment](#deployment)
17. [Security Notes](#security-notes)
18. [Contributing](#contributing)

---

## Overview

Caritas is a single-page React application backed by Supabase (Postgres, Auth, Storage, Edge Functions). It exposes seven primary student workflows through a unified, gated experience:

- **AI Chat** — conversational tutor with context-aware responses
- **Dashboard** — activity overview, quick actions, recent history
- **GPA Calculator** — semester and cumulative GPA with grade weighting
- **Study Planner** — dynamic, duration-aware schedule generation
- **Course Assistant** — upload materials, generate notes/quizzes/flashcards
- **Research Assistant** — academic search with insights and saved library
- **History** — searchable archive of every AI interaction

All "key" pages (Chat, Dashboard, History, feature tools) are gated behind a modern auth modal. The landing page is public.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS 3 + semantic HSL tokens + `tailwindcss-animate` |
| UI primitives | shadcn/ui (Radix UI) |
| Routing | react-router-dom v6 |
| Data | @tanstack/react-query v5 |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Icons | lucide-react |
| Theming | next-themes (light/dark/system) |
| Toasts | sonner |
| Backend | Supabase (Postgres 15, Auth, Storage, Edge Functions on Deno) |
| AI Providers | Google AI (Gemini), OpenRouter, OpenAI, Serper (web search) |
| Document parsing | pdf-parse, mammoth, jsonrepair |

---

## Project Structure

```
.
├── api/                          # Vercel serverless shims (proxy, hello, slug router)
├── public/                       # Static assets
├── src/
│   ├── components/
│   │   ├── auth/                 # AuthModal
│   │   ├── chat/                 # Enhanced chat UI (container, input, message, suggestions)
│   │   ├── course/               # Course material upload, library, study tools
│   │   ├── dashboard/            # Welcome card, quick actions, activity chart, recent activity
│   │   ├── gpa/                  # GPA form + results
│   │   ├── history/              # History list, card, filters, modal, skeleton, empty state
│   │   ├── landing/              # Hero, Features, Stats, CTA
│   │   ├── navigation/           # Header, menu, controls, mobile header
│   │   ├── research/             # Search bar, results, insights, library, error
│   │   ├── studyplanner/         # Setup, form, display, saved plans, tips
│   │   ├── studytools/           # Flashcards, quizzes, notes, chatbot, tabs
│   │   ├── ui/                   # shadcn primitives
│   │   ├── Navigation.tsx        # Sidebar shell
│   │   └── PageLayout.tsx        # Auth-gated layout wrapper
│   ├── data/                     # Static chat responses & university info
│   ├── hooks/                    # useAuth, useAIProcessor, useResearch, useStudyPlan, ...
│   ├── integrations/supabase/    # Generated client + types (DO NOT edit types.ts)
│   ├── pages/                    # Route components
│   ├── types/                    # Shared TS types (ai, auth, gpa, database)
│   ├── utils/                    # aiUtils (history persistence), researchUtils
│   ├── index.css                 # Design tokens (HSL) + global styles
│   └── main.tsx                  # App entry
├── supabase/
│   ├── config.toml               # Supabase project config
│   └── functions/                # Deno edge functions (see below)
├── tailwind.config.ts
├── vite.config.ts
└── vercel.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- A Supabase project (already wired)

### Install & run

```bash
# install
npm install        # or: bun install

# dev server (Vite, default http://localhost:5173)
npm run dev

# production build
npm run build

# development-mode build (source maps, dev flags)
npm run build:dev

# preview built bundle
npm run preview

# lint
npm run lint
```

The `.env` file is **auto-populated** by Lovable with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```
Do not commit secrets — only the publishable (anon) key belongs in the frontend.

---

## Environment & Secrets

### Frontend (`.env`)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key (safe in browser) |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |

### Edge Function Secrets (Supabase → Settings → Functions)
| Secret | Used by |
|---|---|
| `GOOGLE_AI_KEY` | `process-ai-query`, `process-chat`, `generate-study-aids`, `api-info` |
| `OPENROUTER_KEY` | `process-ai-query` (alternate provider), `api-info` |
| `OPENAI_API_KEY` | Optional fallback for AI calls |
| `SERPER_API_KEY` | `search-academic-results`, `api-info` |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Internal — auto-injected into edge runtime |
| `SUPABASE_DB_URL` | Direct DB access (server-side only) |

> ⚠️ **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or pass it as a caller token.

---

## Design System

The visual language is defined by **semantic HSL tokens** in `src/index.css` and exposed via Tailwind in `tailwind.config.ts`. Components must consume tokens (`bg-background`, `text-foreground`, `border-border/60`) — never hardcoded colors (`bg-blue-600`).

Highlights:
- **Aesthetic**: Apple/Linear minimalism — generous spacing, hairline borders, glass morphism, restrained motion.
- **Surfaces**: `bg-foreground/[0.04]`, frosted blur backdrops, subtle radial gradients in `PageLayout`.
- **Motion**: `transition-smooth` and `transition-spring` utilities with custom cubic-bezier timing functions defined as raw CSS (not via `@apply ease-[...]`).
- **Theming**: light, dark, and system via `next-themes` with `attribute="class"`.
- **Typography**: Tailwind defaults + `@tailwindcss/typography` for AI-rendered prose.

See `mem://design/aesthetic-clean-minimal-apple-linear` for the full guideline.

---

## Application Routes & Pages

| Path | Page | Gated | Purpose |
|---|---|---|---|
| `/` | `Index` | ❌ | Landing: Hero, Features, Stats, CTA |
| `/auth` | `Auth` | ❌ | Sign-in / sign-up screen |
| `/dashboard` | `Dashboard` | ✅ | Welcome, stats, quick actions, recent activity, activity chart |
| `/chat` | `Chat` | ✅ | Conversational AI tutor (`EnhancedChatContainer`) |
| `/gpa-calculator` | `GPACalculator` | ✅ | GPA form + computed results |
| `/study-planner` | `StudyPlanner` | ✅ | Plan setup, generated schedule, saved plans, tips |
| `/course-assistant` | `CourseAssistant` | ✅ | Upload materials → notes / quiz / flashcards / chatbot |
| `/research-assistant` | `ResearchAssistant` | ✅ | Academic search, insights, saved library |
| `/history` | `History` | ✅ | Search/filter all past AI interactions |
| `*` | `NotFound` | ❌ | 404 |

Gating is enforced by `PageLayout.tsx` + `useAuthGuard`, which renders the `AuthModal` over a blurred preview if the visitor isn't authenticated.

---

## Core Features

### 1. AI Chat (`/chat`)
- Centered "What can I help with?" welcome screen
- Asymmetric message bubbles (user bubbles inverted in dark mode)
- Pill-shaped input with attachment support
- Suggestion carousel for cold-start prompts
- Streams responses through `process-ai-query` (Google AI by default, OpenRouter optional)
- Conversational tone enforced — no generic "Hello there!" openings (see `mem://features/ai-chat-conversational-tone`)

### 2. Dashboard (`/dashboard`)
- **WelcomeCard** — personalized greeting + animated number counters
- **QuickActions** — one-click entry to each tool
- **ActivityChart** — recharts visualization of recent usage
- **RecentActivity** — last N history entries with deep-links

### 3. GPA Calculator (`/gpa-calculator`)
- Add/remove courses with credit hours and letter grades
- Real-time semester GPA + cumulative computation
- Configurable grading scale (4.0 / 5.0)

### 4. Study Planner (`/study-planner`)
- **SimpleStudyPlanSetup** — pick courses, study days, hours
- Dynamic schedule generation that respects total available time and per-subject difficulty (see `mem://features/study-planner-dynamic-duration`)
- **StudyPlanDisplay** — day-by-day timetable
- **SimpleSavedPlansManager** — persist/restore plans from `study_plans` table
- **StudyTips** — context-aware advice

### 5. Course Assistant (`/course-assistant`)
- **MaterialUploadForm** — upload PDFs, DOCX, TXT to `course-materials` bucket
- **MaterialLibrary** — browse, preview, delete uploads
- **StudyToolsGenerator** → tabs:
  - **NotesDisplay** — AI-summarized study notes
  - **QuizComponent** — auto-generated MCQs with scoring
  - **Flashcard** — front/back cards with flip animation
  - **ChatbotComponent** — material-grounded Q&A

### 6. Research Assistant (`/research-assistant`)
- **ResearchSearchBar** — query input with filters
- **ResearchResults** — academic results (title, snippet, source, link)
- **ResearchInsights** — AI-summarized synthesis across results
- **ResearchLibrary** — bookmark and revisit findings
- **ResearchError** — graceful failure state

### 7. History (`/history`)
- **HistoryList** + **HistoryCard** — paginated archive
- **HistoryFilters** — by category, date, search text
- **HistoryDetailModal** — full Q&A view
- **HistorySkeleton** / **HistoryEmptyState**

---

## Authentication

- Provider: **Supabase Auth** (email/password + OAuth-ready)
- Session: managed via `useAuth` hook (`src/hooks/useAuth.tsx`)
- Profile auto-creation: `handle_new_user()` trigger inserts a `profiles` row on signup, copying `full_name` and `avatar_url` from `raw_user_meta_data`
- Gating: `useAuthGuard` + `AuthModal` (see `mem://features/authentication-gating`)
- All RLS policies enforce `auth.uid() = user_id` ownership on user-scoped tables

---

## Database Schema

All tables live in `public`. Source of truth: `src/integrations/supabase/types.ts` (auto-generated — never edit).

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | User profile data | `id` (FK auth.users), `full_name`, `avatar_url`, timestamps |
| `chat_history` | All AI Q&A interactions | `user_id`, `query`, `answer`, `category`, `created_at` |
| `materials` | Uploaded course material metadata | `user_id`, `title`, `file_path`, `content_type`, `size` |
| `uploads` | Generic upload records | `user_id`, `file_path`, `metadata` |
| `segments` | Parsed/chunked material segments | `material_id`, `content`, `order` |
| `summaries` | AI-generated material summaries | `material_id`, `content` |
| `flashcards` | Generated flashcards | `material_id`, `front`, `back` |
| `quizzes` | Generated quiz items | `material_id`, `question`, `options`, `answer` |
| `study_plans` | Saved study schedules | `user_id`, `name`, `payload` (jsonb) |

### Database Functions
- `handle_new_user()` — trigger that creates a `profiles` row on `auth.users` insert
- `update_updated_at_column()` — generic `updated_at` touch trigger

---

## Edge Functions (Supabase)

All edge functions live in `supabase/functions/<name>/index.ts`, run on Deno, and are deployed automatically. Most require JWT (`verify_jwt = true` in `supabase/config.toml`).

### `process-ai-query` 🔐
General-purpose AI router used by Chat and most tools.
- **Body**: `{ query, userId, category, additionalData?, provider? }`
- **Providers**: `google` (Gemini, default) or `openrouter`
- **Categories**: `default`, `google-ai`, `openrouter`, `course-tutor`, `material-tutor`, `analyze-documents`, `process-course-material`, `study-planner`, `generate-study-aids`, `research`
- **Returns**: `{ answer: string, ... }`

### `process-chat`
Lightweight chat-only handler. Used by certain components for streamlined conversational flows.

### `process-course-material` 🔐
- Parses uploaded materials (PDF / DOCX / TXT)
- Splits into segments, persists to `segments`
- Triggers downstream summary generation

### `generate-study-aids` 🔐
- Input: a material ID (or raw content) + tool type
- Output: structured notes, quiz items (with `jsonrepair` to recover from malformed model JSON), or flashcards
- Persists to `summaries`, `quizzes`, `flashcards`

### `upload-course-material`
- Accepts multipart upload, stores in the private `course-materials` bucket
- Inserts a `materials` row with metadata
- Returns signed URL + material record

### `search-academic-results`
- Wraps **Serper** Google Scholar / Search API
- Normalizes results for `ResearchResults`
- Optionally hands results to `process-ai-query` (`category: 'research'`) for synthesis

### `api-info`
Public health/diagnostics endpoint.
- Probes Google AI, OpenRouter, and Serper with 5s timeouts
- Returns availability, quota hints, and timing
- In-memory rate limit: 100 req/hour per IP

> Configure secrets at **Supabase → Project Settings → Functions** before invoking.

---

## Frontend Hooks

| Hook | Responsibility |
|---|---|
| `useAuth` | Session, sign-in/up/out, current user |
| `useAuthGuard` | Redirect/modal gate for protected pages |
| `useAIProcessor` | Calls `process-ai-query`, manages loading/result, persists to history |
| `useDocumentProcessor` | Parses PDFs (pdf-parse) / DOCX (mammoth) client-side when needed |
| `useMaterials` | CRUD over `materials` + storage |
| `useStudyMaterials` | Aggregates segments/summaries/quizzes/flashcards per material |
| `useStudyPlan` | Generation + persistence of study plans |
| `useResearch` | Drives `search-academic-results` + insights |
| `useApiConfig` / `useApiStatus` | Surface `api-info` health to UI |
| `use-mobile` | Responsive breakpoint detection |
| `use-toast` | Sonner toast helper |

---

## Storage Buckets

| Bucket | Public | Used for |
|---|---|---|
| `course-materials` | ❌ | User-uploaded PDFs/DOCX/TXT for the Course Assistant. Access through signed URLs only. |

---

## Document Parsing Pipeline

Supported formats and libraries (see `mem://features/course-assistant-document-parsing`):

| Format | Library |
|---|---|
| PDF | `pdf-parse` (server) / PDF.js (client) |
| DOCX | `mammoth` |
| TXT / MD | Native `TextDecoder` |

Flow: **Upload → Storage → `process-course-material` → segments → `generate-study-aids` → notes/quiz/flashcards → UI**.

---

## State Management & Data Flow

- **Server state**: `@tanstack/react-query` for caching, retries, and invalidation
- **Auth state**: React context via `useAuth`
- **Theme**: `next-themes` provider in `App.tsx`
- **Forms**: `react-hook-form` + `zod` resolvers
- **Toasts**: `sonner` + shadcn `<Toaster />`

---

## Deployment

Two supported targets:

### Lovable
Click **Publish** in the Lovable editor. Edge functions deploy automatically with each change. Custom domains can be attached in Project Settings.

### Vercel
- `vercel.json` configures the SPA + serverless shims under `api/`
- `_redirects` ensures SPA fallback for static hosts
- Set the same Supabase env vars in Vercel Project Settings

---

## Security Notes

- **Roles**: never store roles on `profiles`. If/when roles are introduced, use a dedicated `user_roles` table + a `SECURITY DEFINER` `has_role()` function (per Supabase best practice).
- **RLS**: enabled on all user-scoped tables; policies enforce `auth.uid() = user_id`.
- **Service role key**: server-only; accessed inside edge functions via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`.
- **Rate limiting**: `api-info` includes a basic in-memory limiter; production-grade limiting should move to a shared store (e.g., Upstash) if traffic grows.
- **Validation**: prefer trigger-based validation over Postgres `CHECK` constraints with non-immutable expressions.

---

## Contributing

1. Create a feature branch.
2. Follow the design system — only semantic tokens, never hardcoded colors.
3. Keep components small, focused, and typed.
4. Use `react-query` for any server interaction.
5. Run `npm run lint` and `npm run build` before opening a PR.
6. Update relevant memory docs (`mem://...`) when introducing new conventions.

---

## License

Proprietary — © Caritas University project. All rights reserved.
