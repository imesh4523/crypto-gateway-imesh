"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    BarChart3,
    TrendingUp,
    ShieldCheck,
    Wallet,
    History,
    FileText,
    Download,
    RefreshCw,
    Search,
    Filter,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { format } from "date-fns";

export default function FinancialManagement() {
    const [stats, setStats] = useState<any>(null);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'monitor' | 'refunds' | 'reports'>('monitor');

    useEffect(() => {
        fetchStats();
        fetchRefunds();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/financials/stats");
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRefunds = async () => {
        try {
            const res = await fetch("/api/admin/financials/refunds");
            const data = await res.json();
            setRefunds(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const liquidityRatio = stats ? (stats.totalRevenue / (stats.merchantObligations || 1) * 100).toFixed(1) : "0";

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Treasury <span className="text-emerald-500">& Liquidity</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic uppercase tracking-[0.05em] text-xs opacity-70">Monitor global system liquidity and financial obligations.</p>
                </div>
                <div className="flex gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-1.5 rounded-2xl shadow-sm">
                    {[
                        { id: 'monitor', label: 'Monitor', icon: BarChart3 },
                        { id: 'refunds', label: 'Refunds', icon: History },
                        { id: 'reports', label: 'Reports', icon: FileText }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'monitor' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key="monitor"
                        className="space-y-8"
                    >
                        {/* Major Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Wallet className="w-32 h-32" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Platform Treasury Revenue</p>
                                <h3 className="text-5xl font-black tabular-nums">${stats?.totalRevenue.toLocaleString()}</h3>
                                <div className="mt-8 flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Master Profit Margin</span>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Merchant Obligations (Debt)</p>
                                <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">${stats?.merchantObligations.toLocaleString()}</h3>
                                <div className="mt-8 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                        <span className="text-slate-400">System Coverage</span>
                                        <span className="text-emerald-500">240%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Total Gateway Volume</p>
                                <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">${stats?.totalVolume.toLocaleString()}</h3>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{stats?.merchantPending.toLocaleString()} Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart and History Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[3rem] p-8">
                                <div className="flex justify-between items-center mb-10 px-2">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Revenue Velocity</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Rolling 7-Day Performance Insight</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Daily</button>
                                        <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest opacity-40">Monthly</button>
                                    </div>
                                </div>

                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.dailyRevenue}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#888', fontSize: 10, fontWeight: 800 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#888', fontSize: 10, fontWeight: 800 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#6366f1', fontSize: '10px', fontWeight: 'black', marginBottom: '4px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#6366f1"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorRev)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[3rem] p-8">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-8">System Health</h3>

                                <div className="space-y-8">
                                    {[
                                        { label: 'Liquidity Ratio', value: liquidityRatio + '%', status: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' },
                                        { label: 'Payout Efficiency', value: '98.2%', status: 'Healthy', icon: ArrowUpRight, color: 'text-indigo-500' },
                                        { label: 'Refund Rate', value: '0.4%', status: 'Excellent', icon: ArrowDownLeft, color: 'text-emerald-500' },
                                        { label: 'Blockchain Sync', value: 'Active', status: 'Live', icon: RefreshCw, color: 'text-emerald-500' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl">
                                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{item.value}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${item.color} bg-white/10 border border-white/5`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-6 bg-indigo-600 rounded-[2rem] text-white shadow-lg shadow-indigo-600/30">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black uppercase tracking-tighter opacity-80 italic">Global Wallet Node</p>
                                        <ShieldCheck className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <h4 className="text-2xl font-black mt-4 tabular-nums">$2,410,293.42</h4>
                                    <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Refill Master Liquidity</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'refunds' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key="refunds"
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[3rem] p-8 shadow-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10">
                                        <th className="pb-6 pl-2">Merchant Entity</th>
                                        <th className="pb-6">Refund Amount</th>
                                        <th className="pb-6">Original Transaction</th>
                                        <th className="pb-6">Status / Logic</th>
                                        <th className="pb-6 text-right pr-2">Execution Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {refunds.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">No processed refunds detected in ledger.</td></tr>
                                    ) : refunds.map((refund) => (
                                        <tr key={refund.id} className="group hover:bg-white/10 transition-colors">
                                            <td className="py-6 pl-2">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{refund.merchant.name}</span>
                                                    <span className="text-[10px] text-indigo-500 font-bold italic">{refund.merchant.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-red-500 tabular-nums">-${refund.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-medium text-slate-500 uppercase">{refund.transaction.currency}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">ID: {refund.transaction.platformTxId}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Original: ${refund.transaction.amount.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${refund.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {refund.status}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right pr-2 font-bold tabular-nums text-slate-400 text-xs italic">
                                                {format(new Date(refund.createdAt), 'MMM dd, yyyy | HH:mm')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key="reports"
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[3rem] p-12 text-center flex flex-col items-center">
                            <div className="h-20 w-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-8 border border-indigo-600/20 shadow-xl shadow-indigo-600/10">
                                <BarChart3 className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-4">Daily Settlement Report</h3>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-10 text-sm">Automated reconciliation of all merchant accounts, gateway fees, and platform profits.</p>
                            <button className="flex items-center gap-3 bg-indigo-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-indigo-600/30 group active:scale-95 transition-all">
                                Generate PDF Archive
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>

                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[3rem] p-12 text-center flex flex-col items-center">
                            <div className="h-20 w-20 bg-emerald-600/10 rounded-full flex items-center justify-center mb-8 border border-emerald-600/20 shadow-xl shadow-emerald-600/10">
                                <ArrowRight className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-4">Tax & Compliance Ledger</h3>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-10 text-sm">Comprehensive financial disclosure document for quarterly tax filings and AML audits.</p>
                            <button className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 px-10 rounded-2xl shadow-xl active:scale-95 transition-all">
                                Export CSV Dataset
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
