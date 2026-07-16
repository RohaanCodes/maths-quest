# Math Quest: Next.js App Router Migration & Codebase Overview

Welcome to **Math Quest**, an interactive fantasy mathematics adventure game designed to help students master algebra, arithmetic, and mathematical operations through structured step-by-step wizard quests and adaptive gameplay.

---

## 📂 Codebase Folder Structure

Here is the complete hierarchy and layout of the project following the migration to Next.js App Router:

```text
├── .env.example              # Placeholder template for server-side Airtable integration keys
├── .gitignore                # Exclusions for build outputs, dependencies, and environment keys
├── metadata.json             # Applet metadata container (title, description, capabilities)
├── package.json              # Next.js dependencies, binding configurations, and script definitions
├── next.config.js            # Next.js options (strict mode activation, module resolving)
├── tsconfig.json             # Next.js compiler options and path aliases
├── src/                      # Source code root
│   ├── index.css             # Tailwind CSS imports, keyframe animations, custom 3D button classes
│   ├── types/                # Core TypeScript interfaces
│   │   └── index.ts          # Shared data models (Student, World, Challenge, LessonStep, etc.)
│   ├── lib/                  # Helper modules and datasets
│   │   ├── data.ts           # Curricular data-fetching API functions (Airtable-ready)
│   │   └── mock-data.ts      # Detailed static educational datasets and quest narrative lines
│   ├── components/           # Extracted modular React views
│   │   ├── AppNavigation.tsx         # Navigation sidebar adapted to next/link and next/navigation
│   │   ├── DashboardLayout.tsx       # Client shell validating sessions and syncing student levels
│   │   ├── AdventureMap.tsx          # Interactive SVG-based world and node navigation map
│   │   ├── ChallengeIntro.tsx        # Immersive fantasy challenge briefing panel
│   │   ├── ChallengeNode.tsx         # Animated map node indicating locked, unlocked, or complete
│   │   ├── LessonStepPlayer.tsx      # Step-by-step narrative and tutorial explanation card
│   │   ├── MissionCompleteScreen.tsx # Splash screen for finished quests with confetti and stats
│   │   ├── PracticeExerciseForm.tsx  # Equation solver, multiple-choice, and input validator
│   │   ├── ProgressIndicator.tsx     # Visual progress bar with step status counters
│   │   ├── StudentProfileComponent.tsx # Player avatar, current level, statistics, and badges
│   │   └── WorldCard.tsx             # Interactive card to select math worlds
│   └── app/                  # Next.js App Router folders
│       ├── layout.tsx                # Master HTML skeleton importing Google Fonts & Material Symbols
│       ├── page.tsx                  # Gateway checker (redirects logged-in users to /home or /login)
│       ├── login/
│       │   ├── page.tsx              # Server-side route handler for Login screen
│       │   └── LoginClient.tsx       # Client character creator and customized name saver
│       ├── home/
│       │   ├── page.tsx              # Server-side home loader (pre-fetches worlds/progress)
│       │   └── HomeClient.tsx        # Active quest line visualizers, streak metrics, and region cards
│       ├── adventure/
│       │   ├── page.tsx              # Server-side adventure list loader
│       │   └── AdventureClient.tsx   # Visual grid of all themed mathematical regions
│       ├── world/[worldId]/
│       │   ├── page.tsx              # Server-side dynamic loader for specific regions
│       │   └── WorldMapClient.tsx    # World maps detailing progress and connecting lines
│       ├── challenge/[challengeId]/
│       │   ├── page.tsx              # Server-side dynamic loader for lessons and math exercises
│       │   └── ChallengeClient.tsx   # Multi-stage learning player and confetti validator
│       └── profile/
│           ├── page.tsx              # Server-side student profile information loader
│           └── ProfileClient.tsx     # Visual showcase of student level accomplishments and badges
```

---

## 🛠️ Summary of Migration Accomplishments & Architectural Changes

We have converted the application into a high-performance, robust Next.js App Router application while fully preserving the pixel-perfect visual design, custom 3D buttons, audio/visual cues, and user metrics.

### 1. Unified Master Layout Shell
- Configured `src/app/layout.tsx` to handle the global HTML structures, loading Google display fonts (**Outfit**), body fonts (**Inter**), equations fonts (**JetBrains Mono**), and **Material Symbols Outlined** globally.
- Created `src/components/DashboardLayout.tsx` which acts as a nested client-side guard. It verifies the login session in browser space, registers the custom `student-progress-updated` event to synchronise stats across page routes, and coordinates loading/unrolling animations.

### 2. Full Decoupling of Data & Client Views
- Placed clean Next.js Server Components in each of the route files (`src/app/**/page.tsx`). These pages query curriculum info directly from `src/lib/data.ts` server-side, keeping all credentials, query parameters, and future APIs hidden from the browser.
- Rendered corresponding Client Components (`*Client.tsx`) to handle active state, keyboard inputs, equation validation, and sliding transitions using Tailwind CSS.
- Added a `.env.example` with placeholders ready to receive Airtable secrets in the future:
  ```text
  AIRTABLE_API_KEY=
  AIRTABLE_BASE_ID=
  AIRTABLE_CONCEPTS_TABLE=
  AIRTABLE_PROGRESS_TABLE=
  ```

### 3. Navigation Migration
- Refactored `AppNavigation.tsx` to replace `react-router-dom` imports (`NavLink`, `useLocation`, `useNavigate`) with Next.js standard imports (`Link` from `next/link`, `usePathname` and `useRouter` from `next/navigation`).
- Reimplemented active navigation state detection using `usePathname()` to dynamically highlight active sidebar items with high-contrast borders and indigo text.

### 4. Zero-Downtime Removal of Vite Configuration
- Cleanly deleted:
  - `index.html`
  - `vite.config.ts`
  - `src/main.tsx`
  - `src/App.tsx` (the original monolithic router script)
- Reprogrammed `package.json` scripts to run the dev server on port `3000` with host `0.0.0.0` (required for reverse proxy and container accessibility) and to compile standard static builds on production deployment.

### 5. Verification & Testing
- **Linter & Type Checking**: Passed with `tsc --noEmit`, resolving all TypeScript declarations.
- **Production Build Check**: Ran `npm run build` and compiled successfully.
