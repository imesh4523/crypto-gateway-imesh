"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KeyRound, ReceiptText, ArrowRightLeft, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
    { name: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
    { name: "Withdrawals", href: "/dashboard/withdrawals", icon: ArrowRightLeft },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-200">
            {/* Sidebar sidebar bg-gradient-to-b from-slate-900 to-slate-950 */}
            <aside className="w-64 border-r border-white/10 hidden md:flex flex-col relative z-20 bg-slate-950/50 backdrop-blur-xl">
                <div className="h-16 flex items-center px-6 border-b border-white/10 gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 4L14 13L9 8L1 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 4H23V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-bold text-xl text-white tracking-wide">Soltio</span>
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
                                        isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                                    {link.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
                        <LogOut className="mr-3 h-5 w-5 text-slate-500" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-end px-8 z-10 relative bg-slate-950/40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">Merchant User</p>
                            <p className="text-xs text-slate-400">merchant@example.com</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                            M
                        </div>
                    </div>
                </header>

                {/* Page Content Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto z-10 p-8">
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
