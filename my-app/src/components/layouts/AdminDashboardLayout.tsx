"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    ReceiptText,
    ArrowRightLeft,
    LogOut,
    Settings,
    Sun,
    Moon,
    ShieldCheck,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const adminSidebarLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Merchants", href: "/admin/merchants", icon: Users },
    { name: "Transactions", href: "/admin/transactions", icon: ReceiptText },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowRightLeft },
    { name: "Security", href: "/admin/security", icon: ShieldCheck },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Skip protection and layout for the login page
    const isLoginPage = pathname === "/admin/login";

    // Protection logic
    useEffect(() => {
        if (isLoginPage) return;

        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
            router.push("/dashboard"); // Redirect merchants to their dashboard
        }
    }, [status, session, router, isLoginPage]);

    if (status === "loading" || !mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if ((session?.user as any)?.role !== "ADMIN") {
        return null; // Prevents flashing content before redirect
    }

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-slate-200 relative overflow-hidden transition-colors duration-300">
            {/* Admin Specific Background - Slightly different to distinguish from merchant dash */}
            <div
                className="fixed inset-0 z-[-2] transition-colors duration-300"
                style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    opacity: theme === 'dark' ? 0.2 : 0.7
                }}
            />
            <div className="fixed inset-0 z-[-1] bg-white/40 dark:bg-black/80 backdrop-blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-64 hidden md:flex flex-col relative z-20 transition-colors duration-300 pt-6 px-3 border-r border-white/20 dark:border-white/5">
                <div className="h-16 flex items-center px-4 mb-4 gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tight italic">Admin<span className="text-indigo-600">Core</span></span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {adminSidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link key={link.name} href={link.href} className="relative block">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-admin-sidebar"
                                        className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-2xl border border-indigo-600/20 dark:border-indigo-400/20 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div
                                    className={cn(
                                        "relative flex items-center px-4 py-3.5 text-sm rounded-2xl transition-all duration-300 z-10 group",
                                        isActive
                                            ? "text-indigo-700 dark:text-white font-black"
                                            : "font-bold text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("mr-4 h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400 stroke-[2.5]" : "text-slate-500 dark:text-white/40 stroke-[2]")} />
                                    {link.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-white/75 rounded-2xl hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 z-10 relative">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            System Administrator
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{session?.user?.name || 'Administrator'}</p>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-80 uppercase">{session?.user?.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform font-black">
                                {(session?.user?.name?.[0] || 'A')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto z-10 p-6 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-[1600px] mx-auto"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
