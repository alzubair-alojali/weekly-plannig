"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { CyberButton } from "@/components/ui/cyber-button";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { usePlannerStore } from "@/lib/planner-store";
import { formatWeekRange } from "@/lib/week-utils";
import {
  Target,
  CheckCircle2,
  Flame,
  Lightbulb,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const tasks = usePlannerStore((s) => s.tasks);
  const brainDumpTasks = usePlannerStore((s) => s.brainDumpTasks);
  const currentDate = usePlannerStore((s) => s.currentDate);

  const weekRange = formatWeekRange(currentDate);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Count days with at least one task
    const activeDays = new Set(tasks.filter((t) => t.date).map((t) => t.date)).size;

    return {
      total,
      completed,
      percentage,
      remaining: total - completed,
      brainDump: brainDumpTasks.length,
      activeDays,
    };
  }, [tasks, brainDumpTasks]);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={fadeUp} className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">مرحباً بك 👋</h2>
        <p className="text-sm text-muted-foreground">{weekRange}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Tasks Completed */}
        <GlassCard interactive glow>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                المهام المكتملة
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-blue/10">
                <CheckCircle2 className="h-4 w-4 text-cyber-blue" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyber-blue">
                {stats.completed}
                <span className="text-lg text-muted-foreground">
                  /{stats.total}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stats.percentage}% إنجاز
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-linear-to-l from-cyber-blue to-cyber-cyan"
              />
            </div>
          </div>
        </GlassCard>

        {/* Focus */}
        <GlassCard interactive>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                التركيز
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-cyan/10">
                <Target className="h-4 w-4 text-cyber-cyan" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyber-cyan">
                {stats.remaining}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                مهام متبقية
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Active Days */}
        <GlassCard interactive>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                الأيام النشطة
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-neon/10">
                <Flame className="h-4 w-4 text-cyber-neon" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyber-neon">
                {stats.activeDays}
                <span className="text-lg text-muted-foreground">/7</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                أيام فيها مهام
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Brain Dump */}
        <GlassCard interactive>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                تفريغ الأفكار
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <Lightbulb className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">
                {stats.brainDump}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                فكرة غير مجدولة
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Activity Chart */}
      <motion.div variants={fadeUp}>
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyber-blue" />
              <h3 className="text-sm font-bold text-foreground">
                نشاط الأسبوع
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-cyber-blue" />
                <span>إجمالي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-cyber-cyan" />
                <span>مكتملة</span>
              </div>
            </div>
          </div>
          <ActivityChart />
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <Link href="/planner">
          <CyberButton variant="glow" className="gap-2">
            <span>ابدأ التخطيط</span>
            <ArrowLeft className="h-4 w-4" />
          </CyberButton>
        </Link>
      </motion.div>
    </motion.div>
  );
}
