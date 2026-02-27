"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Download,
    ExternalLink,
    ShieldCheck,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Search as SearchIcon,
    RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RefundModal } from "@/components/dashboard/admin/RefundModal";

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    profitPlatform: number;
    createdAt: string;
    merchant: {
        name: string | null;
        email: string;
    }
}

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [showRefund, setShowRefund] = useState(false);

    useEffect(() => {
        fetch("/api/admin/transactions")
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filtered = transactions.filter(t =>
        t.merchant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Transaction <span className="text-indigo-600">Ledger</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Master log of all cryptographic financial activity.</p>
                </div>
                <button className="flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 px-6 py-3 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:bg-white/60 transition-all">
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Merchant, ID or Currency..."
                        className="w-full pl-12 pr-4 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-indigo-500/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['SUCCESS', 'PENDING', 'FAILED'].map(status => (
                        <button key={status} className="px-5 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-colors">
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10 pb-4">
                                <th className="pb-6 pl-2">Merchant</th>
                                <th className="pb-6">Amount / Asset</th>
                                <th className="pb-6">Platform Fee</th>
                                <th className="pb-6">Profit</th>
                                <th className="pb-6">Status</th>
                                <th className="pb-6">Date & Time</th>
                                <th className="pb-6 text-right pr-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="py-8 h-12 bg-white/10 rounded-xl my-2" />
                                    </tr>
                                ))
                            ) : filtered.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-white/30 dark:hover:bg-white/5 transition-all">
                                    <td className="py-6 pl-2">
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums">{tx.merchant.name || 'Merchant'}</span>
                                            <span className="text-[10px] text-slate-500 font-bold opacity-70 italic">{tx.merchant.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white tabular-nums">
                                                {tx.amount.toLocaleString()} {tx.currency}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                ID: {tx.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="text-sm font-bold text-slate-500 italic">3% Platform</span>
                                    </td>
                                    <td className="py-6 font-black text-emerald-500 text-lg tabular-nums">
                                        +${tx.profitPlatform.toFixed(2)}
                                    </td>
                                    <td className="py-6 text-right pr-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' :
                                            tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="py-6 text-xs font-bold text-slate-500 tabular-nums">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="py-6 text-right pr-2">
                                        <div className="flex items-center justify-end gap-2">
                                            {tx.status === 'SUCCESS' && (
                                                <button
                                                    onClick={() => { setSelectedTx(tx); setShowRefund(true); }}
                                                    className="p-3 hover:bg-red-500/10 rounded-xl transition-all group" title="Refund"
                                                >
                                                    <RotateCcw className="w-4 h-4 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            )}
                                            <button className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all">
                                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showRefund && selectedTx && (
                    <RefundModal
                        transaction={selectedTx}
                        onClose={() => setShowRefund(false)}
                        onSuccess={() => {
                            // Refresh logic
                            window.location.reload();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
