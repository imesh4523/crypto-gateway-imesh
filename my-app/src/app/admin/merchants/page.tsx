"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    Zap,
    CreditCard,
    BarChart2,
    Edit2,
    Lock,
    Unlock,
    Settings,
    UserPlus,
    User,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    X,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MerchantEditModal } from "@/components/dashboard/admin/MerchantEditModal";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Merchant {
    id: string;
    name: string | null;
    email: string;
    plan: string;
    availableBalance: number;
    totalIncome: number;
    botClicksQuota: number;
    botClicksUsed: number;
    productLimitQuota: number;
    trialActive: boolean;
    isSuspended: boolean;
    brandName?: string | null;
    webhookUrl?: string | null;
}

export default function MerchantManagement() {
    const router = useRouter();
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [editTab, setEditTab] = useState<'profile' | 'plan' | 'balance'>('profile');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add Merchant Form State
    const [newMerchant, setNewMerchant] = useState({ name: "", email: "", password: "", plan: "FREE" });
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = () => {
        setLoading(true);
        setErrorMsg(null);
        fetch("/api/admin/merchants")
            .then(res => res.json())
            .then(data => {
                console.log("MERCHANT_API_DATA:", data);
                if (Array.isArray(data)) {
                    setMerchants(data);
                } else if (data.error) {
                    setErrorMsg(data.error + (data.message ? ": " + data.message : ""));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("FETCH_ERROR:", err);
                setErrorMsg("System Fetch Error");
                setLoading(false);
            });
    };

    const handleImpersonate = async (merchantId: string) => {
        try {
            const res = await fetch("/api/admin/merchants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchantId, action: "GENERATE_IMPERSONATION" })
            });
            const data = await res.json();
            if (data.impersonationToken) {
                Cookies.set("impersonate_user_id", merchantId, { expires: 1 });
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuspendToggle = async (merchant: Merchant) => {
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
            if (res.ok) fetchMerchants();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMerchant = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await fetch("/api/admin/merchants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMerchant)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewMerchant({ name: "", email: "", password: "", plan: "FREE" });
                fetchMerchants();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add merchant");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddLoading(false);
        }
    };

    const filteredMerchants = merchants.filter(m =>
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Merchant <span className="text-indigo-600">Directory</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage platform partners and their ecosystem limits.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    Manually Add Merchant
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        className="w-full pl-12 pr-4 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-indigo-500/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 transition-all">
                    <Filter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {errorMsg && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 font-bold mb-8">
                    <Shield className="w-6 h-6" />
                    <div className="flex flex-col">
                        <span>API Data Sync Failed</span>
                        <span className="text-xs opacity-70 font-medium">{errorMsg}</span>
                    </div>
                </div>
            )}

            {/* Merchants Table */}
            <div className="p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10 pb-4">
                                <th className="pb-6 pl-2">Merchant Identity</th>
                                <th className="pb-6">Plan Status</th>
                                <th className="pb-6">Balance</th>
                                <th className="pb-6">Usage (Clicks)</th>
                                <th className="pb-6 text-right pr-2">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="py-8 h-12 bg-white/10 rounded-xl my-2" />
                                    </tr>
                                ))
                            ) : filteredMerchants.map((merchant) => (
                                <tr
                                    key={merchant.id}
                                    className={`group hover:bg-white/30 dark:hover:bg-white/5 transition-all cursor-pointer ${merchant.isSuspended ? 'opacity-50 grayscale' : ''}`}
                                    onClick={() => router.push(`/admin/merchants/${merchant.id}`)}
                                >
                                    <td className="py-6 pl-2">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-lg shadow-inner relative">
                                                {merchant.name?.[0] || 'M'}
                                                {merchant.isSuspended && <Lock className="absolute -top-1 -right-1 w-4 h-4 text-red-500 fill-white dark:fill-slate-900" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 dark:text-white tabular-nums">{merchant.name || 'Anonymous Merchant'}</span>
                                                <span className="text-xs text-slate-500 font-bold opacity-70 italic">{merchant.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${merchant.plan === 'PREMIUM' ? 'bg-amber-500/20 text-amber-600' :
                                                merchant.plan === 'PRO' ? 'bg-indigo-500/20 text-indigo-600' : 'bg-slate-500/20 text-slate-500'
                                                }`}>
                                                {merchant.plan}
                                            </span>
                                            {merchant.trialActive && (
                                                <span className="text-[10px] font-bold text-emerald-500 animate-pulse uppercase tracking-tight">Active Trial</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white text-lg tabular-nums">
                                                ${merchant.availableBalance.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                Lifetime: ${merchant.totalIncome.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex flex-col gap-2 w-40">
                                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                                <span>{merchant.botClicksUsed} / {merchant.botClicksQuota}</span>
                                                <span>{merchant.botClicksQuota > 0 ? Math.round((merchant.botClicksUsed / merchant.botClicksQuota) * 100) : 0}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${merchant.botClicksQuota > 0 ? (merchant.botClicksUsed / merchant.botClicksQuota) * 100 : 0}%` }}
                                                    className={`h-full ${(merchant.botClicksUsed / merchant.botClicksQuota) > 0.8 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 text-right pr-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                    <MoreHorizontal className="w-5 h-5 text-slate-500" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2">
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase p-2">Operations</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/merchants/${merchant.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 text-sky-500 group-focus:text-white" />
                                                    <span className="font-bold">View Full Trace</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMerchant(merchant);
                                                        setEditTab('plan');
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4 text-indigo-500 group-focus:text-white" />
                                                    <span className="font-bold">Edit Quota / Plan</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleImpersonate(merchant.id);
                                                    }}
                                                >
                                                    <User className="w-4 h-4 text-violet-500 group-focus:text-white" />
                                                    <span className="font-bold">Impersonate User</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-3 p-3 rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMerchant(merchant);
                                                        setEditTab('balance');
                                                    }}
                                                >
                                                    <CreditCard className="w-4 h-4 text-emerald-500 group-focus:text-white" />
                                                    <span className="font-bold">Manual Payout</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10 my-2" />
                                                <DropdownMenuItem
                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${merchant.isSuspended ? 'focus:bg-emerald-500' : 'focus:bg-red-500'} focus:text-white`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSuspendToggle(merchant);
                                                    }}
                                                >
                                                    {merchant.isSuspended ? (
                                                        <>
                                                            <Unlock className="w-4 h-4 text-emerald-500 group-focus:text-white" />
                                                            <span className="font-bold">Reactivate Account</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-4 h-4 text-red-500 group-focus:text-white" />
                                                            <span className="font-bold">Suspend Account</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Merchant Edit Modal */}
            <AnimatePresence>
                {selectedMerchant && (
                    <MerchantEditModal
                        merchant={selectedMerchant}
                        initialTab={editTab}
                        onClose={() => {
                            setSelectedMerchant(null);
                            setEditTab('profile');
                        }}
                        onUpdate={() => {
                            setSelectedMerchant(null);
                            setEditTab('profile');
                            fetchMerchants();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Add Merchant Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black italic">Add New <span className="text-indigo-600">Merchant</span></h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"><X className="w-6 h-6 text-slate-500" /></button>
                            </div>
                            <form onSubmit={handleAddMerchant} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                                    <input required value={newMerchant.name} onChange={e => setNewMerchant({ ...newMerchant, name: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-white/10 rounded-2xl p-4 font-bold" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                                    <input required type="email" value={newMerchant.email} onChange={e => setNewMerchant({ ...newMerchant, email: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-white/10 rounded-2xl p-4 font-bold" placeholder="merchant@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Initial Password</label>
                                    <input required type="password" value={newMerchant.password} onChange={e => setNewMerchant({ ...newMerchant, password: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-white/10 rounded-2xl p-4 font-bold" placeholder="••••••••" />
                                </div>
                                <button disabled={addLoading} type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3">
                                    {addLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Provision Account</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
