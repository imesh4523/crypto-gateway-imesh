"use client";

import { useEffect, useState } from "react";
import {
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PieChart as PieChartIcon,
    TrendingUp,
    Clock,
    DollarSign,
    Zap,
    ExternalLink,
    ReceiptText
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { motion } from "framer-motion";

interface StatData {
    totalProfit: number;
    totalVolume: number;
    successTransactions: number;
    merchantCount: number;
    pendingWithdrawals: number;
    recentTransactions: any[];
    volumeByCurrency: any[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981'];

export default function AdminOverview() {
    const [stats, setStats] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/20 dark:bg-white/5 animate-pulse rounded-3xl backdrop-blur-md border border-white/20" />
                    ))}
                </div>
                <div className="h-[400px] bg-white/20 dark:bg-white/5 animate-pulse rounded-3xl backdrop-blur-md border border-white/20" />
            </div>
        );
    }

    const cards = [
        {
            title: "Platform Revenue",
            value: `$${Number(stats?.totalProfit || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            trend: "+12.5%",
            isPositive: true
        },
        {
            title: "Total Volume",
            value: `$${Number(stats?.totalVolume || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-500/10",
            trend: "+8.2%",
            isPositive: true
        },
        {
            title: "Active Merchants",
            value: stats?.merchantCount || 0,
            icon: Users,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-500/10",
            trend: "+4",
            isPositive: true
        },
        {
            title: "Pending Payouts",
            value: stats?.pendingWithdrawals || 0,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
            trend: stats?.pendingWithdrawals ? "Action needed" : "All clear",
            isPositive: stats?.pendingWithdrawals === 0
        }
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time performance metrics and global health.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative p-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {card.trend}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{card.value}</h3>
                        </div>

                        {/* Decorative Background Blob */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${card.bg}`} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-500" />
                                Growth Momentum
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue and volume tracking</p>
                        </div>
                        <select className="bg-white/50 dark:bg-slate-800/50 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/50">
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                            <option>All Time</option>
                        </select>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[] /* Mock or aggregated data */}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Currency Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-xl"
                >
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <PieChartIcon className="w-5 h-5 text-purple-500" />
                        Asset Split
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Volume distribution per currency</p>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.volumeByCurrency.map(v => ({
                                        name: v.currency,
                                        value: Number(v._sum.amount)
                                    })) || []}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.volumeByCurrency.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 space-y-3">
                        {stats?.volumeByCurrency.map((v, i) => (
                            <div key={v.currency} className="flex justify-between items-center bg-white/20 dark:bg-white/5 p-3 rounded-2xl border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{v.currency}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">${Number(v._sum.amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Global Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <ReceiptText className="w-5 h-5 text-indigo-500" />
                            Global Pulse
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Most recent transactions across the network</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                        View All <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10 pb-4">
                                <th className="pb-4">Merchant</th>
                                <th className="pb-4">Amount</th>
                                <th className="pb-4">Profit</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats?.recentTransactions.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white tabular-nums">{tx.merchant.name || 'Merchant'}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">{tx.merchant.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{Number(tx.amount).toLocaleString()} {tx.currency}</span>
                                    </td>
                                    <td className="py-4 font-bold text-emerald-500 tabular-nums">
                                        ${Number(tx.profitPlatform).toFixed(2)}
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' :
                                            tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-xs font-medium text-slate-500 tabular-nums">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
