# Milaap — Reconnect With Your Own People

**Small connections. Real belonging.**

Milaap is a hyperlocal social-connection prototype: a frontend-only web app that helps people
discover the neighbours, students, colleagues and senior citizens already around them, and then
gives them a reason to actually meet — a chai, a twenty-minute skill swap, a walk, a lane clean-up.

> Most platforms help us connect with people we already know.
> Milaap helps us discover the people around us and gives us a reason to connect with them in real life.

Milaap is **not** a dating app and **not** a social network: there are no follower counts, no likes
and no endless feed. It is a working prototype you can demo end to end.

---

## Running it

```bash
cd milaap
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on `0.0.0.0:5173` |
| `npm run build` | Type-check (`tsc -b`) then production build into `dist/` |
| `npm run preview` | Serve the production build on `0.0.0.0:4173` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Headless jsdom test: renders **all 22 routes** and a few interactions |
| `npm run journey` | Headless end-to-end test of the whole demo user journey |
| `npm test` | Runs both suites (43 assertions, 0 console errors) |

No backend, no database, no authentication, no API keys, no paid services. All state lives in
`localStorage` under the key `milaap:data:v1`.

---

## The ten sections (all working, all routed)

| Route | Section | Highlights |
| --- | --- | --- |
| `/` | **Home** | Greeting for the demo user Aarav, community selector, “Your weekly Milaap”, 4 quick actions, profile-progress card, weekly matches, upcoming + personalised activities, suggested skill swaps, recent local activity, community challenges |
| `/discover` | **Discover People** | 12 seeded profiles, search, 5 filters + shared-only toggle, 4 sort modes, grid/list toggle, match %, “Why this match?”, bookmark, dismiss, profile detail, add/remove connection, restore dismissed, reset |
| `/activities` | **Activities** | 12 activity categories, 14 seeded activities, search, category/community/date filters, 4 sorts, tabs (All / Joined / Saved / Created by me), join, leave, save, create, edit, delete, detail dialog |
| `/skills` | **Skill Exchange** | 22 seeded listings, teach/learn filters, categories, format + availability filters, complementary matching, 20-minute swap plans, create offer, create request, edit/delete, save |
| `/community` | **Community** | Overview with contribution summary, challenge board, month calendar with events, volunteering section, discussion prompts, local problem board, create/edit/delete challenges, join/leave, tick tasks, save |
| `/connections` | **My Connections** | Search, shared-interest filter, cards/list, skill-swap summary, link to each meet-up, plan an activity, remove, reason-for-recommendation, suggestions, empty state |
| `/schedule` | **My Schedule** | Upcoming / past / invitations / cancelled / saved tabs, grouped-by-date or flat view, detail dialog, create + edit + cancel + delete invitations, mark completed, join/leave |
| `/notifications` | **Notifications** | Seeded + action-generated notifications, kind filters, unread state, mark read, mark all read, clear all (confirmed), deep links into the app |
| `/profile` + `/profile/edit` | **My Profile** | Avatar, completion checklist, contribution dashboard, interests/hobbies/skills/languages/availability/accessibility editor with validation and sticky save bar |
| `/settings` | **Settings & privacy** | Light/dark theme, reduced motion, six notification preferences, JSON export, restore sample data, clear local data (confirmed), full privacy statement |

Global search (top bar, or **Ctrl/⌘ + K**) searches people, skills, activities and challenges with
categorised, clickable results, recent searches and a clear-search action.

---

## How the matching works

The engine is deterministic and explainable — the same profile and the same member always produce
the same score, so nothing jumps around on re-render (`src/utils/matching.ts`):

| Signal | Weight |
| --- | --- |
| Shared interests | up to 45 |
| Complementary skills (they teach what you want / you teach what they want) | up to 35 |
| Shared preferred activity types | up to 15 |
| Shared languages | up to 5 |
| Same community | up to 6 |

Every card and profile shows the specific sentences behind the number (“Why this match?”), plus
conversation starters generated from the real overlap between the two profiles.

---

## Project structure

```
milaap/
├─ src/
│  ├─ components/
│  │  ├─ cards/        MemberCard (+MatchRing), ActivityCard, SkillCard, ChallengeCard, StatCard
│  │  ├─ forms/        ActivityFormModal, SkillFormModal, ChallengeFormModal
│  │  ├─ layout/       AppLayout, SidebarNav, BottomNav
│  │  ├─ ui/           primitives (Button/Card/Badge/Chip/Avatar/Progress/Empty/Skeleton/Notice…),
│  │  │                Modal, ConfirmDialog, Toaster, Form (TextField/TextArea/SelectField/
│  │  │                ChipSelect/Switch/RadioCards), PageHeader, Tabs, SearchInput,
│  │  │                CategoryIcon, ErrorBoundary
│  │  ├─ PlanActivityModal, ProfileDetailModal, ActivityDetailModal,
│  │  │  ChallengeBoardModal, CommunityCalendar, CommunitySelector, GlobalSearch
│  ├─ context/         AppContext.tsx — single store: state, actions, notifications, persistence, toasts
│  ├─ data/            seed.ts — 12 members, 14 activities, 22 skill listings, 6 challenges, 5 notifications
│  ├─ hooks/           useMilaap, useToast, useDebouncedValue, useMediaQuery, useDocumentTitle,
│  │                   useRecentSearches, useDialogA11y, useCommunities
│  ├─ pages/           HomePage, DiscoverPage, ActivitiesPage, SkillsPage, CommunityPage,
│  │                   ConnectionsPage, SchedulePage, NotificationsPage, ProfilePage,
│  │                   ProfileEditPage, SettingsPage, NotFoundPage
│  ├─ types/           UserProfile, CommunityMember, Connection, Activity, Invitation, SkillListing,
│  │                   CommunityChallenge, Notification, AppSettings, MatchResult, AppData
│  └─ utils/           date, helpers, matching, validation, profile, conversation, storage, exportData
└─ scripts/            smoke.tsx, journey.tsx (jsdom test suites)
```

The persistence layer (`src/utils/storage.ts`) repairs anything malformed field by field: a bad
`localStorage` payload falls back to the seeded sample data instead of crashing, missing arrays are
re-created, and completed-task IDs are re-applied onto the challenge task lists.

---

## Demonstration data — please read aloud

Every person, activity, challenge, participant count, event and notification inside Milaap is
**fictional sample content written for this prototype**. Nothing here contacts a real person:

- No account, no signup, no password, no email — so no login screen exists anywhere in the app.
- Adding a connection, joining an activity, ticking a task or creating an invitation only edits
  this browser’s storage. No message is sent and nobody else can see it.
- “Demo invitation created locally. No real message has been sent.” is shown in the invitation flow,
  the schedule and the notifications.
- Contribution numbers on My Profile are derived from your own clicks and are not social-impact
  statistics.

**Privacy statement (also shown verbatim in Settings):**

> “Milaap is a frontend demonstration. Profile information and activity changes are stored locally in
> this browser. No backend account is created and no information is transmitted to a Milaap server.”

Browser `localStorage` is plain text and **not** encrypted — Milaap never asks for an address, phone
number, ID, payment detail or anything else sensitive.

---

## Suggested 5-minute demo script

1. **Home** — read the positioning line, switch the community selector, point at “Your weekly Milaap”.
2. **Discover People** — open a profile (e.g. Sana Sheikh), read the *Why this match?* reasons, then
   “Plan an activity with Sana” → set 20 minutes → create the invitation. Show the notice that
   nothing was sent.
3. **My Schedule** — the invitation is already there; edit it, mark it completed, then cancel another.
4. **Skill Exchange** — open *Complementary matches*: Rajesh teaches car maintenance and wants
   photography; Aarav teaches photography and wants car maintenance. Create a 20-minute swap.
5. **Activities** — join “Morning stretch for desk workers”, save “Photography walk”, create your own.
6. **Community** — open a challenge board, tick two tasks, watch the progress bar, check the calendar.
7. **Notifications** — show entries generated by the actions just taken, mark all read, clear.
8. **Settings** — toggle dark mode, export the JSON file, then restore sample data.

---

## Test coverage (headless, no browser needed)

`npm test` runs two jsdom suites against the real component tree:

- **`scripts/smoke.tsx`** — renders all 22 routes including deep links (`?focus=`, `?challenge=`,
  `?tab=`), asserts non-empty output, opens a profile dialog, adds a connection, checks it persisted,
  toggles theme + reduced motion, edits and saves the profile name, and fails on any console error.
- **`scripts/journey.tsx`** — 40+ assertions: past-date invitation rejection, invitation → schedule →
  notification, activity completion, join/save persistence, activity search filtering, skill listing
  creation, challenge tasks and join/leave, notification read/clear, home CTA routing, duplicate
  connection prevention, discover search and reset, profile validation and persistence, JSON export,
  restore sample data, clear local data, and deep links on a cleared store.

Both suites currently report **0 console errors**.
