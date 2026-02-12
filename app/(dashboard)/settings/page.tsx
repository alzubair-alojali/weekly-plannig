"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { CyberButton } from "@/components/ui/cyber-button";
import { usePlannerStore } from "@/lib/planner-store";
import { motion } from "framer-motion";
import {
    Settings,
    Trash2,
    Download,
    Upload,
    Info,
    CheckCircle2,
} from "lucide-react";
import { useState, useRef } from "react";

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function SettingsPage() {
    const store = usePlannerStore();
    const [toast, setToast] = useState<string | null>(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }

    // ── Export data as JSON ──
    function handleExport() {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            tasks: store.tasks,
            brainDumpTasks: store.brainDumpTasks,
            reviews: store.reviews,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("تم تصدير البيانات بنجاح");
    }

    // ── Import data from JSON ──
    function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (!data.tasks || !data.brainDumpTasks || !data.reviews) {
                    showToast("ملف غير صالح");
                    return;
                }
                usePlannerStore.setState({
                    tasks: data.tasks,
                    brainDumpTasks: data.brainDumpTasks,
                    reviews: data.reviews,
                });
                showToast("تم استيراد البيانات بنجاح");
            } catch {
                showToast("خطأ في قراءة الملف");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // ── Clear all data ──
    function handleClearAll() {
        usePlannerStore.setState({
            tasks: [],
            brainDumpTasks: [],
            reviews: [],
        });
        setConfirmClear(false);
        showToast("تم مسح جميع البيانات");
    }

    // Stats
    const totalTasks = store.tasks.length + store.brainDumpTasks.length;
    const completedTasks = store.tasks.filter((t) => t.isCompleted).length;
    const totalReviews = store.reviews.length;

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 start-1/2 z-50 -translate-x-1/2"
                >
                    <div className="flex items-center gap-2 rounded-lg border border-cyber-neon/20 bg-cyber-neon/10 px-4 py-2.5 text-sm font-medium text-cyber-neon shadow-lg backdrop-blur-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        {toast}
                    </div>
                </motion.div>
            )}

            {/* Page Header */}
            <motion.div variants={fadeUp} className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/10">
                        <Settings className="h-5 w-5 text-cyber-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">الإعدادات</h2>
                        <p className="text-sm text-muted-foreground">
                            إدارة بيانات المخطط الخاص بك
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div variants={fadeUp}>
                <GlassCard className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-cyber-blue" />
                        <h3 className="text-sm font-bold text-foreground">نظرة عامة</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cyber-blue">{totalTasks}</p>
                            <p className="text-[11px] text-muted-foreground">إجمالي المهام</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cyber-neon">{completedTasks}</p>
                            <p className="text-[11px] text-muted-foreground">مكتملة</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cyber-cyan">{totalReviews}</p>
                            <p className="text-[11px] text-muted-foreground">مراجعات</p>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Export / Import */}
            <motion.div variants={fadeUp}>
                <GlassCard className="space-y-4 p-4">
                    <h3 className="text-sm font-bold text-foreground">
                        النسخ الاحتياطي والاستعادة
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <CyberButton
                            variant="accent"
                            size="md"
                            className="flex-1"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" />
                            تصدير البيانات
                        </CyberButton>

                        <CyberButton
                            variant="outline"
                            size="md"
                            className="flex-1"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            استيراد البيانات
                        </CyberButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                        />
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        يتم تخزين بياناتك محلياً في المتصفح. استخدم التصدير لإنشاء نسخة
                        احتياطية يمكنك استعادتها لاحقاً.
                    </p>
                </GlassCard>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={fadeUp}>
                <GlassCard className="space-y-4 border-destructive/20 p-4">
                    <h3 className="text-sm font-bold text-priority-high">منطقة الخطر</h3>

                    {!confirmClear ? (
                        <CyberButton
                            variant="destructive"
                            size="md"
                            onClick={() => setConfirmClear(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            مسح جميع البيانات
                        </CyberButton>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-priority-high">
                                هل أنت متأكد؟ سيتم حذف جميع المهام والمراجعات نهائياً.
                            </p>
                            <div className="flex gap-2">
                                <CyberButton
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleClearAll}
                                >
                                    نعم، احذف الكل
                                </CyberButton>
                                <CyberButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmClear(false)}
                                >
                                    إلغاء
                                </CyberButton>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* App Info */}
            <motion.div variants={fadeUp}>
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-foreground">المخطط الأسبوعي</p>
                            <p className="text-[11px] text-muted-foreground">
                                الإصدار 1.0.0 — مبني بـ Next.js & Zustand
                            </p>
                        </div>
                        <div className="text-[10px] text-slate-600">⚡ Cyber Theme</div>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
