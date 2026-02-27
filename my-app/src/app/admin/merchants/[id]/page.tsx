"use client";

import { useEffect, useState } from "react";
import {
    Shield,
    ArrowLeft,
    Mail,
    Key,
    Wallet,
    Bot,
    BarChart3,
    History,
    Users,
    ShoppingCart,
    Lock,
    Unlock,
    RefreshCcw,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface MerchantDetail {
    id: string;
    name: string | null;
    email: string;
    role: string;
    plan: string;
    availableBalance: number;
    totalIncome: number;
    publicKey: string;
    webhookSecret: string;
    isSuspended: boolean;
    createdAt: string;
    brandName: string | null;
    webhookUrl: string | null;
    BotIntegration: any;
    stats: {
        totalCustomers: number;
        totalOrders: number;
        totalProducts: number;
        recentTransactions: any[];
        recentWithdrawals: any[];
        recentCustomers: any[];
        recentOrders: any[];
    }
}

export default function MerchantDetailPage({ params }: { params: { id: string } }) {
    const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();

    useEffect(() => {
        fetchMerchant();
    }, [params.id]);

    const fetchMerchant = async () => {
        try {
            const res = await fetch(`/api/admin/merchants/${params.id}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setMerchant(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async () => {
        try {
            const res = await fetch("/api/admin/merchants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchantId: merchant?.id, action: "GENERATE_IMPERSONATION" })
            });
            const data = await res.json();
            if (data.impersonationToken) {
                Cookies.set("impersonate_user_id", merchant!.id, { expires: 1 });
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuspendToggle = async () => {
        if (!merchant) return;
        try {
            const res = await fetch("/api/admin/merchants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    merchantId: merchant.id,
                    action: "SUSPEND",
                    data: { isSuspended: !merchant.isSuspended }
                })
            });
            if (res.ok) fetchMerchant();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex h-[70vh] items-center justify-center">
            <RefreshCcw className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
    );

    if (!merchant) return (
        <div className="text-center p-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black">Merchant Not Found</h2>
            <Link href="/admin/merchants" className="text-indigo-500 font-bold mt-4 inline-block">Back to Directory</Link>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/merchants" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black italic">{merchant.name || 'Anonymous'}</h1>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{merchant.plan}</span>
                            {merchant.isSuspended && <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Suspended</span>}
                        </div>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">{merchant.email} • Joined {new Date(merchant.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleImpersonate}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        Impersonate Account
                    </button>
                    <button
                        onClick={handleSuspendToggle}
                        className={`p-3 rounded-2xl transition-all ${merchant.isSuspended ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                    >
                        {merchant.isSuspended ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Current Balance", value: `$${merchant.availableBalance.toLocaleString()}`, icon: Wallet, color: "text-emerald-500" },
                    { label: "Total Lifetime", value: `$${merchant.totalIncome.toLocaleString()}`, icon: BarChart3, color: "text-indigo-500" },
                    { label: "Total Orders", value: merchant.stats.totalOrders, icon: ShoppingCart, color: "text-amber-500" },
                    { label: "Store Customers", value: merchant.stats.totalCustomers, icon: Users, color: "text-violet-500" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</span>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <h3 className="text-2xl font-black tabular-nums">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-px">
                {["Overview", "Financials", "Identity & Keys", "Store Activity", "Bot Config"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.toLowerCase() ? 'text-indigo-600' : 'text-slate-500'}`}
                    >
                        {tab}
                        {activeTab === tab.toLowerCase() && <motion.div layoutId="merch-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="grid grid-cols-1 gap-8">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Identity Trace */}
                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                Governance Identity Trace
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Public Wallet Identity</p>
                                    <p className="font-mono text-xs break-all text-slate-700 dark:text-slate-300">{merchant.publicKey}</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Webhook Intelligence Secret</p>
                                    <p className="font-mono text-xs break-all text-slate-700 dark:text-slate-300">{merchant.webhookSecret}</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Store Gateway Brand</p>
                                    <p className="font-bold">{merchant.brandName || "Default System Gate"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-emerald-500" />
                                Real-time Transaction Ledger
                            </h3>
                            <div className="space-y-3">
                                {merchant.stats.recentTransactions.length > 0 ? merchant.stats.recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                <div className={`w-2 h-2 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight">${tx.amount} {tx.currency}</p>
                                                <p className="text-[10px] text-slate-500 font-bold">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{tx.status}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-500 text-xs font-bold">No active transactions traced.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "financials" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                                Balance Adjustment
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-3 px-4 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">Add Funds</button>
                                        <button className="py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest">Deduct</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                                    <input type="number" placeholder="500.00" className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black tabular-nums outline-none focus:ring-2 ring-indigo-500/50" />
                                </div>
                                <button className="w-full py-4 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                                    Apply Adjustment
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-500" />
                                Recent Withdrawals
                            </h3>
                            <div className="space-y-3">
                                {merchant.stats.recentWithdrawals.map((w: any) => (
                                    <div key={w.id} className="flex justify-between items-center p-4 bg-white/10 rounded-2xl">
                                        <div>
                                            <p className="text-xs font-black uppercase">${w.amount} {w.currency}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{new Date(w.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{w.status}</span>
                                    </div>
                                ))}
                                {merchant.stats.recentWithdrawals.length === 0 && <p className="text-center py-10 text-xs font-bold text-slate-500 italic">No withdrawal history traced.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "identity & keys" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-indigo-500" />
                                API & Webhook Intelligence
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="p-5 bg-white/5 border border-white/5 rounded-3xl relative group">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Live Public Key (PK_LIVE)</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-xs font-mono text-indigo-500 break-all">{merchant.publicKey}</code>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><ExternalLink className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white/5 border border-white/5 rounded-3xl relative group">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Webhook Signing Secret</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-xs font-mono text-red-500 blur-sm hover:blur-none transition-all cursor-crosshair">{merchant.webhookSecret}</code>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-all"><RefreshCcw className="w-3 h-3 text-slate-500" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                                    <p className="text-xs font-black text-indigo-600 uppercase mb-2">Security Advisory</p>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Directly modifying or regenerating keys will immediately disconnect any active 3rd party integrations. Proceed with caution.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" />
                                Profile Governance
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                        <input defaultValue={merchant.brandName || ""} className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                                        <input defaultValue={merchant.name || ""} className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Email Node</label>
                                    <input defaultValue={merchant.email} className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none" />
                                </div>
                                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20">
                                    Override Profile Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "store activity" && (
                    <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                        <h3 className="text-xl font-black mb-6 italic">Global Store <span className="text-indigo-600">Intelligence</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center py-20">
                            <div>
                                <Users className="w-12 h-12 text-violet-500 mx-auto mb-4" />
                                <h4 className="text-4xl font-black">{merchant.stats.totalCustomers}</h4>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Identified Store Customers</p>
                            </div>
                            <div>
                                <ShoppingCart className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                <h4 className="text-4xl font-black">{merchant.stats.totalOrders}</h4>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Successful Order Fulfilled</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-sm font-black uppercase tracking-tight mb-4 text-violet-500">Recent Customers Traced</h4>
                                <div className="space-y-3">
                                    {merchant.stats.recentCustomers.length > 0 ? merchant.stats.recentCustomers.map((cust: any) => (
                                        <div key={cust.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black">{cust.username || cust.firstName || 'Anonymous'}</span>
                                                <span className="text-[10px] text-slate-500 font-bold">{cust.telegramId}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-500 tabular-nums">${Number(cust.balance).toFixed(2)}</span>
                                        </div>
                                    )) : <div className="text-[10px] text-slate-500 font-bold italic py-4 text-center">No customers yet.</div>}
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-sm font-black uppercase tracking-tight mb-4 text-amber-500">Recent Orders Traced</h4>
                                <div className="space-y-3">
                                    {merchant.stats.recentOrders.length > 0 ? merchant.stats.recentOrders.map((order: any) => (
                                        <div key={order.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black">{order.product?.name || 'Deleted Product'}</span>
                                                <span className="text-[10px] text-slate-500 font-bold">{order.status}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )) : <div className="text-[10px] text-slate-500 font-bold italic py-4 text-center">No orders yet.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-sm font-black text-amber-600 uppercase">Customer Privacy Intelligence</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">Full PII (Personally Identifiable Information) tracing is available for law enforcement or dispute resolution. All identified customer emails, IP addresses, and purchase histories are logged in the master audit vault.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "bot config" && (
                    <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                        <h3 className="text-xl font-black mb-8 italic">Telegram Ecosystem <span className="text-sky-500">Configuration</span></h3>

                        {merchant.BotIntegration ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Bot Father Token</p>
                                        <div className="flex items-center gap-2 group">
                                            <p className="font-mono text-sm blur-sm group-hover:blur-none transition-all">{merchant.BotIntegration.telegramToken || "NOT_SET"}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Bot Username</p>
                                        <p className="font-black text-sky-500 italic">@{merchant.BotIntegration.botUsername || "unconfigured"}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                                    <h4 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Deployment Connectivity
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold">Webhook Status</span>
                                            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase">Active</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold">Total Products in Bot</span>
                                            <span className="font-black">{merchant.stats.totalProducts}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Bot className="w-20 h-20 text-slate-300 mx-auto mb-4 opacity-20" />
                                <p className="text-slate-500 font-black italic uppercase text-sm">Bot Ecosystem not yet provisioned for this merchant.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
