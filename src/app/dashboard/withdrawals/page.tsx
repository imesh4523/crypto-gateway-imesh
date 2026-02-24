"use client";

import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockWithdrawals = [
    { id: "wd_1b2c3d", date: "2026-02-23 10:23 AM", amount: "5,000.00", currency: "USDT", address: "Txx...19jZ", status: "COMPLETED", txHash: "0x89f...21a" },
    { id: "wd_4e5f6g", date: "2026-02-24 08:15 AM", amount: "1,250.00", currency: "USDT", address: "Txx...19jZ", status: "PENDING", txHash: "-" },
];

export default function WithdrawalsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Withdrawals
                    </h1>
                    <p className="text-slate-400 mt-1">Request payouts from your available balance to your crypto wallet.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Request Payout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-emerald-500/20 backdrop-blur-xl p-6 rounded-2xl">
                    <h3 className="text-slate-400 font-medium mb-2 w-full flex items-center justify-between">
                        Available to Withdraw
                        <Wallet className="w-5 h-5 text-emerald-400" />
                    </h3>
                    <span className="text-4xl font-bold text-white">$45,234.00</span>
                    <p className="text-sm text-emerald-400 mt-2 bg-emerald-500/10 inline-block px-2 py-1 rounded">No minimum limits applied</p>
                </Card>

                <Card className="bg-white/5 border-amber-500/20 backdrop-blur-xl p-6 rounded-2xl">
                    <h3 className="text-slate-400 font-medium mb-2 w-full flex items-center justify-between">
                        Pending Payouts
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                    </h3>
                    <span className="text-4xl font-bold text-white">$1,250.00</span>
                    <p className="text-sm text-amber-500/80 mt-2 bg-amber-500/10 inline-block px-2 py-1 rounded">Processing within 24h</p>
                </Card>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Payout History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-6 py-4 font-medium">Req ID</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                <th className="px-6 py-4 font-medium">Destination</th>
                                <th className="px-6 py-4 font-medium">Status / TxHash</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockWithdrawals.map((wd) => (
                                <tr key={wd.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{wd.id}</td>
                                    <td className="px-6 py-4 text-slate-400">{wd.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-medium text-white">{wd.amount}</span>{" "}
                                        <span className="text-slate-500">{wd.currency}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-white/5 px-2 py-1 rounded border border-white/10 font-mono text-xs text-slate-300">
                                            {wd.address}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {wd.status === "COMPLETED" ? (
                                            <div>
                                                <span className="text-emerald-400 font-medium text-xs">Completed</span>
                                                <div className="text-slate-500 font-mono text-[10px] mt-1 hover:text-indigo-400 cursor-pointer">{wd.txHash}</div>
                                            </div>
                                        ) : (
                                            <span className="text-amber-400 font-medium text-xs">Pending Review</span>
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
