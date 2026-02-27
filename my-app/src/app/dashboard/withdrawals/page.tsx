import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function WithdrawalsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        redirect("/login");
    }

    const withdrawals = await prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">
                        Withdrawals
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Request payouts from your available balance to your crypto wallet.</p>
                </div>
                <Button className="bg-indigo-600/50 dark:bg-indigo-600/30 text-white/50 rounded-full px-8 font-black h-12 cursor-not-allowed border-none shadow-sm">
                    <ArrowRightLeft className="w-4 h-4 mr-2 stroke-[3]" />
                    Request Payout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-emerald-500/10 backdrop-blur-md p-8 rounded-[32px] overflow-hidden relative group shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[11px]">Available to Withdraw</h3>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">${user.availableBalance.toString()}</span>
                            <span className="text-sm font-bold text-slate-400">USD</span>
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-6 font-black bg-emerald-500/10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> No minimum limits applied
                        </div>
                    </div>
                </Card>

                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-amber-500/10 backdrop-blur-md p-8 rounded-[32px] overflow-hidden relative group shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[11px]">Pending Payouts</h3>
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">${user.pendingBalance.toString()}</span>
                            <span className="text-sm font-bold text-slate-400">USD</span>
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-6 font-black bg-amber-500/10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Processing within 24h
                        </div>
                    </div>
                </Card>
            </div>

            <div className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl rounded-[28px] overflow-hidden mt-8 shadow-sm">
                <div className="p-6 border-b border-white/40 dark:border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Payout History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-500 dark:text-slate-400 font-black bg-white/40 dark:bg-transparent border-b border-white/40 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Req ID</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Destination</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Status / TxHash</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/[0.03]">
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                        <div className="w-20 h-20 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50 dark:border-white/10 shadow-sm">
                                            <ArrowRightLeft className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p className="font-black text-slate-800 dark:text-slate-300 text-lg">No withdrawal history</p>
                                        <p className="text-sm mt-1 text-slate-500 font-bold">Your payout requests will appear here.</p>
                                    </td>
                                </tr>
                            ) : null}
                            {withdrawals.map((wd: any) => (
                                <tr key={wd.id} className="group hover:bg-white/60 dark:hover:bg-white/[0.02] transition-all">
                                    <td className="px-6 py-5 text-[#1a1f36] dark:text-white font-mono text-xs font-black">{wd.id}</td>
                                    <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-bold text-[13px]">{new Date(wd.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-[#1a1f36] dark:text-white text-base">${wd.amount.toString()}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wd.currency}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="inline-flex items-center bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-inner">
                                            {wd.address.substring(0, 12)}...{wd.address.substring(wd.address.length - 8)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {wd.status === "COMPLETED" ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 w-fit">Completed</span>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] mt-1 font-bold hover:underline cursor-pointer flex items-center gap-1">
                                                    {wd.txHash ? `${wd.txHash.substring(0, 16)}...` : "-"}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 w-fit">Pending Review</span>
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
