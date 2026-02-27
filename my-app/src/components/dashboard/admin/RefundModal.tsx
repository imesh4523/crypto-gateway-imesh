"use client";

import { useState } from "react";
import {
    X,
    RotateCcw,
    AlertTriangle,
    ShieldCheck,
    DollarSign,
    CornerDownRight
} from "lucide-react";
import { motion } from "framer-motion";

interface RefundModalProps {
    transaction: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function RefundModal({ transaction, onClose, onSuccess }: RefundModalProps) {
    const [amount, setAmount] = useState(transaction.amount);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRefund = async () => {
        if (!amount || amount <= 0) return setError("Amount must be positive");
        if (amount > transaction.amount) return setError("Exceeds transaction total");

        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/financials/refunds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionId: transaction.id,
                    amount,
                    reason
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || "Refund execution failed");
            }
        } catch (err) {
            setError("Network error in master node connection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-lg shadow-red-500/10">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Financial <span className="text-red-500">Refund</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{transaction.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Refund Available</p>
                                <h4 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">${transaction.amount.toLocaleString()} <span className="text-xs text-slate-400 uppercase">{transaction.currency}</span></h4>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Refund Magnitude ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] text-2xl font-black outline-none focus:ring-4 ring-red-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cancellation Logic / Reason</label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Customer requested cancellation / Chargeback dispute"
                            className="w-full p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] text-sm font-bold min-h-[120px] outline-none"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 animate-shake">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex gap-4">
                        <div className="shrink-0 p-2 bg-amber-500/10 rounded-lg h-fit">
                            <CornerDownRight className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase leading-relaxed tracking-tight">
                            Execute reversal. Funds will be deducted from the gateway master node and returned to original chain address if applicable.
                        </p>
                    </div>

                    <button
                        onClick={handleRefund}
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {loading ? "Decrypting Ledger..." : (
                            <>
                                <RotateCcw className="w-5 h-5" />
                                Commit Reversal Request
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
