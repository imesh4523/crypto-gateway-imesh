"use client";

import { useState } from "react";
import { RefreshCcw, ChevronLeft, Package, Clock, DollarSign, Search } from "lucide-react";
import Link from "next/link";

interface Order {
    id: string;
    status: string;
    createdAt: string;
    product: {
        name: string;
        price: number;
    } | null;
    customer: {
        telegramId: string;
        username: string | null;
    } | null;
    credential: {
        content: string;
    } | null;
}

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = initialOrders.filter(o => {
        const query = searchTerm.toLowerCase();
        return (o.id.toLowerCase().includes(query)) ||
            (o.product?.name.toLowerCase().includes(query)) ||
            (o.customer?.telegramId.toLowerCase().includes(query)) ||
            (o.customer?.username && o.customer.username.toLowerCase().includes(query)) ||
            (o.credential?.content.toLowerCase().includes(query));
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/bot" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
                        <p className="text-sm text-slate-500">History of products sold via Bot</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search product, username, id..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <RefreshCcw className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Orders Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Adjust your search term or wait for new purchases.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(o => (
                            <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:ring-2 ring-indigo-500/50 transition-all">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-none">{o.product?.name || "Unknown Product"}</h3>
                                            <span className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider py-0.5 px-2 rounded-lg">
                                                {o.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <span>Buyer: {o.customer?.telegramId || "Unknown"}</span>
                                            {o.customer?.username && <span className="text-indigo-500">(@{o.customer.username})</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3" /> Price</span>
                                        <span className="font-bold text-slate-900 dark:text-white">${o.product?.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Date</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{new Date(o.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 flex flex-col">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Credential (Sent)</span>
                                        <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                            {o.credential?.content || "N/A"}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
