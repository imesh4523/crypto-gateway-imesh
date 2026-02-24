"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, CheckCircle2, Clock } from "lucide-react";

const mockTransactions = [
    { id: "platform_189201a", date: "2026-02-24 10:23 AM", amount: "500.00", currency: "USDT", status: "SUCCESS" },
    { id: "platform_189201b", date: "2026-02-24 09:12 AM", amount: "150.00", currency: "USDT", status: "SUCCESS" },
    { id: "platform_189201c", date: "2026-02-23 04:45 PM", amount: "3200.00", currency: "USDC", status: "PENDING" },
    { id: "platform_189201d", date: "2026-02-23 11:20 AM", amount: "45.00", currency: "BTC", status: "SUCCESS" },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Overview
                </h1>
                <p className="text-slate-400 mt-1">Welcome back. Here's what's happening with your gateway today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-medium">Available Balance</h3>
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">$45,234.00</span>
                        <span className="text-sm font-medium text-emerald-400 flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-0.5" /> 12%
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Ready to withdraw</p>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-medium">Pending Balance</h3>
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">$3,200.00</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Awaiting blockchain confirmation</p>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-medium">Total Income</h3>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">$142,390.00</span>
                        <span className="text-sm font-medium text-emerald-400 flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-0.5" /> 8%
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Lifetime volume processed</p>
                </Card>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-6 py-4 font-medium">Platform TxID</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{tx.id}</td>
                                    <td className="px-6 py-4 text-slate-400">{tx.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-medium text-white">{tx.amount}</span>{" "}
                                        <span className="text-slate-500">{tx.currency}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tx.status === "SUCCESS" ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Success
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
