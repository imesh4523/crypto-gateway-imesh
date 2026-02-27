"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Copy,
    ArrowRightLeft,
    Check,
    Ban,
    Truck,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Withdrawal {
    id: string;
    amount: number;
    currency: string;
    address: string;
    status: string;
    txHash: string | null;
    createdAt: string;
    merchant: {
        name: string | null;
        email: string;
    }
}

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = () => {
        setLoading(true);
        fetch("/api/admin/withdrawals")
            .then(res => res.json())
            .then(data => {
                setWithdrawals(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleAction = async (id: string, status: string, txHash?: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/withdrawals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, txHash })
            });
            if (res.ok) fetchWithdrawals();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleBatchAction = async (action: string) => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/financials/batch-withdrawals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    withdrawalIds: selectedIds,
                    action,
                    txHash: action === 'COMPLETE' ? prompt("Enter Master TX Hash for this batch:") : undefined
                })
            });
            if (res.ok) {
                setSelectedIds([]);
                fetchWithdrawals();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev: string[]) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial <span className="text-indigo-600">Disbursement</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Review and fulfill merchant payout requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-amber-500/20">
                        {withdrawals.filter(w => w.status === 'PENDING').length} Pending Requests
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex gap-2 animate-in slide-in-from-right-4">
                            <button
                                onClick={() => handleBatchAction('APPROVE')}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                            >
                                Approve ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => handleBatchAction('COMPLETE')}
                                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                            >
                                Finalize ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => handleBatchAction('REJECT')}
                                className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/20 dark:bg-white/5 animate-pulse rounded-[2rem] backdrop-blur-md border border-white/20" />
                        ))
                    ) : withdrawals.length === 0 ? (
                        <div className="p-12 text-center bg-white/20 dark:bg-white/5 rounded-[2rem] border border-dashed border-white/40">
                            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">No withdrawal history found.</p>
                        </div>
                    ) : withdrawals.map((w, idx) => (
                        <motion.div
                            key={w.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-xl p-6 md:p-8 hover:scale-[1.01] transition-transform"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-4">
                                        {w.status === 'PENDING' && (
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(w.id)}
                                                onChange={() => toggleSelect(w.id)}
                                                className="w-5 h-5 rounded-lg border-2 border-white/20 bg-transparent checked:bg-indigo-600 transition-all cursor-pointer"
                                            />
                                        )}
                                        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-600' :
                                            w.status === 'REJECTED' ? 'bg-red-500/20 text-red-600' :
                                                'bg-amber-500/20 text-amber-600 ring-4 ring-amber-500/10'
                                            }`}>
                                            <ArrowRightLeft className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">${w.amount.toLocaleString()}</h3>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{w.currency}</span>
                                        </div>
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{w.merchant.name || 'Merchant'} • <span className="text-slate-400 font-medium italic">{w.merchant.email}</span></p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center flex-1 md:max-w-md">
                                    <div className="bg-slate-100/50 dark:bg-black/20 p-3 rounded-2xl flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Destination Address</span>
                                            <code className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-48 md:w-64">{w.address}</code>
                                        </div>
                                        <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Copy className="w-3 h-3 text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-widest">
                                        Requested on {new Date(w.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {w.status === 'PENDING' ? (
                                        <>
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => handleAction(w.id, 'REJECTED')}
                                                className="px-6 py-3 bg-red-500/10 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-500/20 flex items-center gap-2"
                                            >
                                                <Ban className="w-4 h-4" /> Reject
                                            </button>
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => {
                                                    const hash = prompt("Enter Transaction Hash (TxHash) to complete:");
                                                    if (hash) handleAction(w.id, 'COMPLETED', hash);
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                                            >
                                                <Truck className="w-4 h-4" /> Finalize Payout
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                            }`}>
                                            {w.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            Payout {w.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
