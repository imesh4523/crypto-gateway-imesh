"use client";

import { useState } from "react";
import {
    X,
    Save,
    User,
    Zap,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    brandName?: string | null;
    webhookUrl?: string | null;
}

interface MerchantEditModalProps {
    merchant: Merchant;
    onClose: () => void;
    onUpdate: () => void;
    initialTab?: 'profile' | 'plan' | 'balance';
}

export function MerchantEditModal({ merchant, onClose, onUpdate, initialTab = 'profile' }: MerchantEditModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'balance'>(initialTab);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form states
    const [name, setName] = useState(merchant.name || "");
    const [email, setEmail] = useState(merchant.email);
    const [brandName, setBrandName] = useState(merchant.brandName || "");
    const [webhookUrl, setWebhookUrl] = useState(merchant.webhookUrl || "");

    const [plan, setPlan] = useState(merchant.plan);
    const [trialActive, setTrialActive] = useState(merchant.trialActive);
    const [clicksQuota, setClicksQuota] = useState(merchant.botClicksQuota);
    const [productQuota, setProductQuota] = useState(merchant.productLimitQuota || 10);

    const [adjAmount, setAdjAmount] = useState(0);
    const [adjType, setAdjType] = useState<'INCREMENT' | 'DECREMENT'>('INCREMENT');

    const handleUpdate = async (action: string, data: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/merchants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchantId: merchant.id, action, data })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    if (action !== "ADJUST_BALANCE") onUpdate();
                }, 1500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Merchant Control</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{merchant.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-slate-100 dark:border-white/10 overflow-x-auto">
                    {[
                        { id: 'profile', label: 'Identity', icon: User },
                        { id: 'plan', label: 'Ecosystem Limits', icon: Zap },
                        { id: 'balance', label: 'Financial Adjustment', icon: DollarSign }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-4 px-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                    <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Webhook Endpoint</label>
                                    <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white" placeholder="https://..." />
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpdate("UPDATE_PROFILE", { name, email, brandName, webhookUrl })}
                                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                            >
                                {loading ? "Syncing..." : success ? "Identity Updated" : "Commit Profile Changes"}
                            </button>
                        </div>
                    )}

                    {activeTab === 'plan' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-4">
                                {['FREE', 'PRO', 'PREMIUM'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlan(p)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center ${plan === p ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600 shadow-lg' : 'border-slate-100 dark:border-white/5 text-slate-500'
                                            }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">{p}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Bot Clicks Quota
                                    </label>
                                    <input type="number" value={clicksQuota} onChange={e => setClicksQuota(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-black" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> Product Catalog Limit
                                    </label>
                                    <input type="number" value={productQuota} onChange={e => setProductQuota(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-black" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-emerald-600">Active Trial Access</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Allows merchant to use premium features temporarily</span>
                                </div>
                                <button
                                    onClick={() => setTrialActive(!trialActive)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${trialActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${trialActive ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <button
                                onClick={() => handleUpdate("CHANGE_PLAN", { plan, trialActive, botClicksQuota: clicksQuota, productLimitQuota: productQuota })}
                                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg"
                            >
                                Reconfigure Ecosystem
                            </button>
                        </div>
                    )}

                    {activeTab === 'balance' && (
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex justify-between items-center border border-slate-200 dark:border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Liquid Balance</p>
                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">${merchant.availableBalance.toLocaleString()}</h4>
                                </div>
                                <div className="p-4 bg-indigo-600/10 rounded-2xl">
                                    <DollarSign className="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Logic</label>
                                <div className="flex gap-4">
                                    <button onClick={() => setAdjType('INCREMENT')} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${adjType === 'INCREMENT' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}>Increment (+)</button>
                                    <button onClick={() => setAdjType('DECREMENT')} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${adjType === 'DECREMENT' ? 'border-red-500 bg-red-500/5 text-red-600' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}>Decrement (-)</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Amount ($)</label>
                                <input type="number" value={adjAmount} onChange={e => setAdjAmount(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-2xl font-black text-center" />
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight leading-relaxed">Financial adjustments are permanent and recorded in the audit ledger. Ensure verification before committing funds.</p>
                            </div>

                            <button
                                onClick={() => handleUpdate("ADJUST_BALANCE", { amount: adjAmount, type: adjType })}
                                className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all ${adjType === 'INCREMENT' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-red-600 text-white shadow-red-500/20'
                                    }`}
                            >
                                Execute Financial Adjustment
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
