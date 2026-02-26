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
                <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 font-medium">Available Balance</h3>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">${balance.toString()}</span>
                        {!isTestMode && (
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-0.5" /> 12%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Ready to withdraw</p>
                </Card>

                <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 font-medium">Pending Balance</h3>
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">${pendingBalance.toString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Awaiting blockchain confirmation</p>
                </Card>

                <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Income</h3>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">${totalIncome.toString()}</span>
                        {!isTestMode && (
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-0.5" /> 8%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Lifetime volume processed</p>
                </Card>
            </div>

            {/* BOT INTEGRATION QUOTAS */}
            {user.botIntegrationEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in slide-in-from-bottom-6 duration-700">
                    <Card className="bg-white/60 dark:bg-slate-900 border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    Bot Clicks Quota
                                </h3>
                                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                                    {user.botClicksUsed} <span className="text-sm font-medium text-slate-500">/ {user.botClicksQuota}</span>
                                </div>
                            </div>
                            {user.trialActive ? (
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                                    Free Trial
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${(user.botClicksUsed / user.botClicksQuota) > 0.9
                                    ? 'bg-rose-500'
                                    : (user.botClicksUsed / user.botClicksQuota) > 0.7
                                        ? 'bg-amber-500'
                                        : 'bg-indigo-500'
                                    }`}
                                style={{ width: `${Math.min(100, (user.botClicksUsed / user.botClicksQuota) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-3 font-medium">
                            {user.botClicksQuota - user.botClicksUsed} clicks remaining in your current plan.
                        </p>
                    </Card>

                    <Card className="bg-white/60 dark:bg-slate-900 border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Compute Power Used
                                </h3>
                                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                                    {(Number(user.hostingPowerLimit) * 0.42).toFixed(2)}vCPU <span className="text-sm font-medium text-slate-500">/ {user.hostingPowerLimit.toString()}vCPU Limit</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `42%` }} // Mock usage
                            />
                        </div>
                        <div className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System healthy and under limits.
                        </div>
                    </Card>
                </div>
            )}

            <OverviewCharts />

            <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                    <Link href="/dashboard/transactions" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-500 dark:text-slate-400 font-medium bg-transparent border-b border-slate-200 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">Payment ID</th>
                                <th className="px-6 py-4 text-left font-medium">Order ID</th>
                                <th className="px-6 py-4 text-left font-medium">Original price</th>
                                <th className="px-6 py-4 text-left font-medium">Amount sent / received</th>
                                <th className="px-6 py-4 text-left font-medium">Status</th>
                                <th className="px-6 py-4 text-left font-medium">Created / Last update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/[0.03]">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-white/10">
                                            <Wallet className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-300">No transactions found</p>
                                        <p className="text-sm mt-1">Recent transactions will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer">
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
                                            <div className="text-[13px] font-medium text-slate-800 dark:text-slate-300">
                                                {tx.amount.toString()} {tx.currency === 'USD' ? 'USD' : (tx.currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-800 dark:text-slate-300">
                                                <span className="font-medium">{tx.payAmount ? tx.payAmount.toString() : tx.amount.toString()} {tx.payCurrency || tx.currency}</span>
                                                <span className="text-slate-500">{tx.status === 'SUCCESS' ? (tx.payAmount ? tx.payAmount.toString() : tx.amount.toString()) : '0'} {tx.payCurrency || tx.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-400">
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
