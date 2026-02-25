import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, CheckCircle2, Clock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OverviewCharts from "@/components/dashboard/OverviewCharts";
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

    const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
    });
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

            <OverviewCharts />

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    <Link href="/dashboard/transactions" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-400 font-medium bg-transparent border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">Payment ID</th>
                                <th className="px-6 py-4 text-left font-medium">Order ID</th>
                                <th className="px-6 py-4 text-left font-medium">Original price</th>
                                <th className="px-6 py-4 text-left font-medium">Amount sent / received</th>
                                <th className="px-6 py-4 text-left font-medium">Status</th>
                                <th className="px-6 py-4 text-left font-medium">Created / Last update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <Wallet className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-300">No transactions found</p>
                                        <p className="text-sm mt-1">Recent transactions will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-white/[0.02] transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-300 group-hover:text-indigo-400 transition-colors" title={tx.providerTxId || "Pending"}>
                                                {tx.providerTxId || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-300" title={tx.id}>
                                                {tx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-slate-300">
                                                {tx.amount.toString()} {tx.currency === 'USD' ? 'USD' : (tx.currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-300">
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
