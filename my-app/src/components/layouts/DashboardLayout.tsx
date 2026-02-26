"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KeyRound, ReceiptText, ArrowRightLeft, LogOut, Settings, Palette, Sun, Moon, Puzzle } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, createContext, useContext } from "react";
import { Beaker, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";

const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
    { name: "Checkout Widget", href: "/dashboard/customizer", icon: Palette },
    { name: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Withdrawals", href: "/dashboard/withdrawals", icon: ArrowRightLeft },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedMode = Cookies.get("testMode");
        if (storedMode === "true") setIsTestMode(true);
    }, []);

    const toggleTestMode = () => {
        const newMode = !isTestMode;
        setIsTestMode(newMode);
        Cookies.set("testMode", newMode.toString(), { expires: 365 });
        // Reload to ensure all components fetch the correct data for the mode
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-slate-200 relative overflow-hidden bg-transparent transition-colors duration-300">
            {/* Static Colorful Background */}
            <div className="fixed inset-0 z-[-2] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-300" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-300" />
                <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-300" />
                <div className="noise-overlay opacity-10 dark:opacity-20 pointer-events-none"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 hidden md:flex flex-col relative z-20 bg-white/60 dark:bg-slate-950/20 backdrop-blur-xl transition-colors duration-300">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/10 gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 4L14 13L9 8L1 16" stroke="currentColor" className="text-indigo-600 dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 4H23V10" stroke="currentColor" className="text-indigo-600 dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-bold text-xl text-slate-900 dark:text-white tracking-wide">Soltio</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link key={link.name} href={link.href} className="relative block">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar-nav"
                                        className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div
                                    className={cn(
                                        "relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors z-10",
                                        isActive
                                            ? "text-indigo-600 dark:text-white shadow-sm font-semibold"
                                            : "text-slate-600 dark:text-white/75 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600 dark:text-white" : "text-slate-500 dark:text-white/75")} />
                                    {link.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-white/75 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-slate-500 dark:text-white/75" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Header */}
                <header className={cn(
                    "h-16 border-b flex items-center justify-between px-8 z-10 relative backdrop-blur-md transition-all duration-300",
                    isTestMode
                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
                        : "bg-white/60 dark:bg-slate-950/20 border-slate-200 dark:border-white/10"
                )}>
                    <div className="flex items-center">
                        {isTestMode && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 animate-pulse">
                                <Beaker className="w-3 h-3" />
                                Sandbox / Test Mode
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Environment Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                            <button
                                onClick={toggleTestMode}
                                className={cn(
                                    "px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    !isTestMode ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                )}
                            >
                                <ShieldCheck className="w-3 h-3" /> Live
                            </button>
                            <button
                                onClick={toggleTestMode}
                                className={cn(
                                    "px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    isTestMode ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                )}
                            >
                                <Beaker className="w-3 h-3" /> Test
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{session?.user?.name || 'Merchant User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{session?.user?.email || 'merchant@example.com'}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 uppercase backdrop-blur-md font-semibold">
                                {(session?.user?.name?.[0] || 'M')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto z-10 p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-6xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
