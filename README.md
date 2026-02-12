# 📅 Weekly Planner (المخطط الأسبوعي)

A modern, high-performance weekly planning application designed for maximum productivity and focus. Built with **Next.js 16**, **Supabase**, and **Tailwind CSS**, featuring a beautiful UI with smooth animations and full RTL support.

![Project Preview](/public/logo.png)

## ✨ Features

- **Weekly Dashboard**: specialized columns for each day of the week.
- **Brain Dump**: A sidebar to capture tasks before scheduling them.
- **Drag & Drop**: Seamlessly move tasks between days and the brain dump area.
- **Progress Tracking**: Visual indicators for completed tasks.
- **Weekly Archive**: Review past weeks and performance statistics.
- **Dark Mode / Cyber Theme**: A sleek, futuristic UI focused on clarity.
- **RTL Support**: Fully optimized for Arabic layout.
- **Privacy Focused**: Data can be exported/imported locally via JSON.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/weekly-planning.git
   cd weekly-planning
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes (login)
│   ├── (dashboard)/      # Main app layouts (planner, archive, settings)
│   ├── api/              # API routes
│   └── globals.css       # Global styles (Tailwind imports)
├── components/           # Reusable UI components
│   ├── dashboard/        # Dashboard-specific widgets (sidebar, charts)
│   ├── planner/          # Planner logic (board, tasks, dnd)
│   └── ui/               # Generic UI elements (buttons, modals) - shadcn/ui style
├── lib/                  # Utilities, stores, and Supabase client
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🛡️ License

This project is licensed under the MIT License.
