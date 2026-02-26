"use client";

import { useState } from "react";
import { Users as UsersIcon, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Customer {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    balance: number;
    ordersCount: number;
}

export default function UsersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = initialCustomers.filter(c => {
        const query = searchTerm.toLowerCase();
        return c.telegramId.toLowerCase().includes(query) ||
            (c.username && c.username.toLowerCase().includes(query)) ||
            (c.firstName && c.firstName.toLowerCase().includes(query)) ||
            (c.lastName && c.lastName.toLowerCase().includes(query));
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/bot" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Telegram Users</h1>
                        <p className="text-sm text-slate-500">View and search your bot customers</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, @username, id..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm border-dashed">
                        <UsersIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Users Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Check your search term or wait for new users.</p>
                    </div>
                ) : (
                    filtered.map(c => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <UsersIcon className="w-24 h-24 text-indigo-500 transform translate-x-4 -translate-y-4" />
                            </div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                                    {c.firstName?.[0] || "U"}
                                </div>
                                <div className="space-y-1 w-full">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                        {c.firstName} {c.lastName}
                                    </h3>
                                    <code className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg inline-block">
                                        ID: {c.telegramId}
                                    </code>
                                    {c.username && (
                                        <p className="text-sm text-indigo-500 font-medium">@{c.username}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Balance</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">${c.balance.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Orders</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{c.ordersCount}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
