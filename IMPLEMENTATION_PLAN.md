# Weekly Personal Planner - Full Implementation Plan (Refined)

## 1. Project Overview
A high-performance Personal Weekly Planner focusing on productivity cycles.
**Aesthetic:** Cyber/Dark Dashboard (Deep Slate, Electric Blue, Glassmorphism).
**Locale:** Arabic (RTL).
**Tech Stack:** Next.js 16, Tailwind v4, Framer Motion, Hello-Pangea DnD, Recharts, Supabase.
**UI Library Strategy:** Custom Tailwind for layout/visuals + **shadcn/ui** for complex interactions (Dialogs, Sheets, Tabs).

---

## 2. Architecture & Design System (Skill: `frontend-design`)

### 2.1 Core Configuration
- [ ] **Tailwind v4 Setup:**
    - Define CSS variables for the color palette in `globals.css` (Deep Slate `#020617` background).
    - Configure `@custom-variant dark`.
- [ ] **Shadcn/ui Integration:**
    - Install base components: `npx shadcn@latest init`.
    - **Crucial:** Override `globals.css` and `tailwind.config` to force the Cyber Theme colors on shadcn components (remove default light/white styles).
    - Install specific components: `sheet`, `dialog`, `tabs`, `dropdown-menu`, `scroll-area`.
- [ ] **Typography:**
    - Install `next/font/google` with **Cairo** or **Alexandria**.
    - Apply font globally with `dir="rtl"`.
- [ ] **Global Overlay:**
    - Create the "Cyber Grid" and radial gradient effects in `globals.css`.

### 2.2 Shared UI Components (Skill: `ui-ux-pro-max`)
- [ ] **`GlassCard`**: 
    - Custom wrapper: `backdrop-blur-md`, `border-slate-800`, `bg-slate-900/50`.
- [ ] **`Button`**:
    - Custom variants: `glow` (primary), `ghost` (nav).
- [ ] **`Badge`**:
    - Priority Indicators (High/Red, Medium/Orange, Low/Blue).

---

## 3. Layout & Navigation

### 3.1 App Layout Structure
- [ ] **`Sidebar` (Desktop)**:
    - Fixed collapsible sidebar.
    - Links: Dashboard, Planner, Archive, Settings.
- [ ] **`MobileSidebar` (Mobile)**:
    - **Component:** **shadcn/ui `Sheet`**.
    - Trigger: Hamburger menu in TopBar.
    - Content: Mirror of Desktop Sidebar navigation.
- [ ] **`AppShell`**:
    - Responsive layout wrapper.

---

## 4. Feature: The Dashboard
**Route:** `/`

### 4.1 Stats & Activity
- [ ] **Stats Grid:** 4 Cards (Focus, Tasks, Challenge, Streak).
- [ ] **Activity Chart:** `recharts` AreaChart with gradient fill.

---

## 5. Feature: The Planner (Core Logic)
**Route:** `/planner`

### 5.1 Weekly Board Layout (Responsive Strategy)
- [ ] **Desktop View (Visible on `md:block`)**:
    - Horizontal Kanban Board (7 Columns: Sat -> Fri).
    - Horizontal scrolling container.
- [ ] **Mobile View (Visible on `block md:hidden`)**:
    - **Component:** **shadcn/ui `Tabs`**.
    - Tabs List: Mon/Tue/Wed... (Scrollable trigger list).
    - Tab Content: Single Day Column.
    - Swipe Interaction: (Bonus) Wrap in `framer-motion` for swipe-to-change gestures.

### 5.2 Optimistic Drag & Drop
- [ ] Implement `onDragEnd` logic:
    1.  **Immediately** update local state (Zustand/React State).
    2.  Send API request to Supabase in background.
    3.  Revert state if API fails (Optimistic UI).

### 5.3 Weekly Review Feature
- [ ] **Trigger:** "Start Weekly Review" button on the Planner page.
- [ ] **UI:** **shadcn/ui `Dialog`** (Modal).
- [ ] **Content:**
    - Form with 3 Textareas (What went well? What didn't? Lessons learned?).
    - "Save & Close Week" button.

---

## 6. Feature: Brain Dump & Task Management

### 6.1 Brain Dump Area
- [ ] **Component:** Collapsible drawer or Section in Sidebar.
- [ ] **Logic:** Tasks created here have `isBrainDump: true` and `weekId: null`.

### 6.2 Task Interactions
- [ ] **Completing:** Satisfaction animation (line-through + glow).
- [ ] **Editing:** **shadcn/ui `Dialog`** or Popover for editing details.

---

## 7. Data Models (Refined)

```typescript
// types/index.ts

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  
  // Scheduling Logic
  isBrainDump: boolean;       // True if in the inbox/sidebar
  weekId: string | null;      // Null if not assigned to a specific week
  date: string | null;        // ISO Date string (e.g., "2023-10-27")
  
  // Positioning
  order: number;              // Float value for precise DnD positioning
  
  createdAt: string;
}

export interface WeeklyReview {
  id: string;
  weekId: string;
  good: string;
  bad: string;
  learned: string;
  completedAt: string;
}
```

## 8. Development Phases

1.  **Foundation:** Global Styles, Font, Root Layout, Shadcn Init.
2.  **Navigation:** Desktop Sidebar + **Shadcn Sheet Mobile Menu**.
3.  **Planner Infrastructure:**
    - State Management (Zustand) with Optimistic UI support.
    - Drag & Drop Handling (@hello-pangea/dnd).
4.  **Planner UI:**
    - Desktop Kanban Columns.
    - **Mobile Tabs View**.
5.  **Review System:** **Shadcn Dialog** for Weekly Review.
6.  **Refinement:** Theming Shadcn components to match Cyber aesthetic.
