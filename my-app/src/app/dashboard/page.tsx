import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, CheckCircle2, Clock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OverviewCharts from "@/components/dashboard/OverviewCharts";
import { cookies } from "next/headers";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import Link from "next/link";

const getStatusBadge = (status: string) => {
    switch (status) {
        case "SUCCESS":
        case "COMPLETED":
        case "FINISHED":
            return (
                <span className="text-[13px] font-medium text-emerald-500">
                    Finished
                </span>
            );
        case "CONFIRMED":
            return (
                <span className="text-[13px] font-medium text-emerald-500">
                    Confirmed
                </span>
            );
        case "PENDING":
        case "WAITING":
            return (
                <span className="text-[13px] font-medium text-amber-500">
                    Waiting
                </span>
            );
        case "EXPIRED":
        case "FAILED":
            return (
                <span className="text-[13px] font-medium text-rose-500">
                    {status === "FAILED" ? "Failed" : "Expired"}
                </span>
            );
        default:
            return <span className="text-[13px] font-medium text-slate-400">{status}</span>;
    }
};

export default async function DashboardOverview() {
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

    const cookieStore = await cookies();
    const isTestMode = cookieStore.get("testMode")?.value === "true";

    const recentTransactions = await prisma.transaction.findMany({
        where: {
            userId,
            isTestMode: isTestMode
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const balance = isTestMode ? user.testBalance : user.availableBalance;
    const totalIncome = isTestMode ? 0 : user.totalIncome; // Simplified for now
    const pendingBalance = isTestMode ? 0 : user.pendingBalance;
    return (
        <div className="space-y-8">
            <AutoRefresh intervalMs={5000} />
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                    Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back. Here's what's happening with your gateway today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden p-5 flex flex-col justify-between h-[150px] transition-transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-bold text-slate-700/80 dark:text-slate-300">Available Balance</h3>
                        <div className="w-[34px] h-[34px] rounded-full bg-white dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm border border-slate-100 dark:border-transparent group-hover:scale-110 transition-transform">
                            <Wallet className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[32px] font-black text-[#1a1f36] dark:text-white leading-none tracking-tight">${balance.toString()}</span>
                            {!isTestMode && (
                                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center rounded-sm">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> 12%
                                </span>
                            )}
                        </div>
                        <p className="text-[12px] text-slate-500/80 dark:text-slate-500 font-semibold leading-none">Ready to withdraw</p>
                    </div>
                </Card>

                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden p-5 flex flex-col justify-between h-[150px] transition-transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-bold text-slate-700/80 dark:text-slate-300">Pending Balance</h3>
                        <div className="w-[34px] h-[34px] rounded-full bg-white dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm border border-slate-100 dark:border-transparent group-hover:scale-110 transition-transform">
                            <Clock className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[32px] font-black text-[#1a1f36] dark:text-white leading-none tracking-tight">${pendingBalance.toString()}</span>
                        </div>
                        <p className="text-[12px] text-slate-500/80 dark:text-slate-500 font-semibold leading-none">Awaiting blockchain confirmation</p>
                    </div>
                </Card>

                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden p-5 flex flex-col justify-between h-[150px] transition-transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-bold text-slate-700/80 dark:text-slate-300">Total Income</h3>
                        <div className="w-[34px] h-[34px] rounded-full bg-white dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm border border-slate-100 dark:border-transparent group-hover:scale-110 transition-transform">
                            <Activity className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[32px] font-black text-[#1a1f36] dark:text-white leading-none tracking-tight">${totalIncome.toString()}</span>
                            {!isTestMode && (
                                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center rounded-sm">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> 8%
                                </span>
                            )}
                        </div>
                        <p className="text-[12px] text-slate-500/80 dark:text-slate-500 font-semibold leading-none">Lifetime volume processed</p>
                    </div>
                </Card>
            </div>



            <OverviewCharts />

            <div className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl rounded-[28px] overflow-hidden flex flex-col shadow-sm">
                <div className="p-6 border-b border-white/40 dark:border-white/10 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Recent Transactions</h2>
                    <Link href="/dashboard/transactions" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-500 dark:text-slate-400 font-black bg-white/40 dark:bg-transparent border-b border-white/40 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Original price</th>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Amount sent / received</th>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Created / Last update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/[0.03]">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50 dark:border-white/10 shadow-sm">
                                            <Wallet className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-black text-slate-800 dark:text-slate-300">No transactions found</p>
                                        <p className="text-sm mt-1 text-slate-500 font-medium">Recent transactions will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-white/60 dark:hover:bg-white/[0.02] transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={tx.providerTxId || "Pending"}>
                                                {tx.providerTxId || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300" title={tx.id}>
                                                {tx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-black text-[#1a1f36] dark:text-white">
                                                {tx.amount.toString()} {tx.currency === 'USD' ? 'USD' : (tx.currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-800 dark:text-slate-300">
                                                <span className="font-black">{tx.payAmount ? tx.payAmount.toString() : tx.amount.toString()} {tx.payCurrency || tx.currency}</span>
                                                <span className="text-slate-500 font-medium">{tx.status === 'SUCCESS' ? (tx.payAmount ? tx.payAmount.toString() : tx.amount.toString()) : '0'} {tx.payCurrency || tx.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                                                <span>{new Date(tx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                <span>{new Date(tx.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
