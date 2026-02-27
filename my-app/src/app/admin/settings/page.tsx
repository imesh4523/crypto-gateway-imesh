"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Globe,
    Shield,
    Wallet,
    Mail,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Lock,
    Bell,
    Smartphone,
    Eye,
    Percent,
    ArrowDownWideNarrow,
    Server,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState<'platform' | 'financial' | 'security' | 'api'>('platform');

    const [settings, setSettings] = useState({
        siteName: "Soltio Admin",
        siteEmail: "admin@soltio.com",
        maintenanceMode: false,
        platformFee: 3.5,
        minWithdrawal: 100,
        require2FA: true,
        sessionTimeout: 60,
        nowPaymentsActive: true,
        webhookSecret: "wh_live_xxxxxxxx"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (res.ok) {
                setSettings(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // We save settings one by one or we could implement a batch update API.
            // For simplicity in this demo, we'll save the visible ones.
            const keys = {
                'SITE_NAME': settings.siteName,
                'SITE_EMAIL': settings.siteEmail,
                'MAINTENANCE_MODE': settings.maintenanceMode,
                'PLATFORM_FEE': settings.platformFee,
                'MIN_WITHDRAWAL': settings.minWithdrawal,
                'SESSION_TIMEOUT': settings.sessionTimeout
            };

            for (const [key, value] of Object.entries(keys)) {
                await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value })
                });
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Global <span className="text-indigo-600">Settings</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic uppercase tracking-[0.05em] text-xs opacity-70">Configure platform-wide parameters and security protocols.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {success ? "Saved successfully" : "Save All Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'platform', label: 'Platform Config', icon: Globe },
                        { id: 'financial', label: 'Fees & Payouts', icon: Wallet },
                        { id: 'security', label: 'Security & Access', icon: Shield },
                        { id: 'api', label: 'Integration Bus', icon: Server }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border text-sm font-black uppercase tracking-widest ${activeSection === tab.id
                                ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20'
                                : 'bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 text-slate-500 hover:bg-white/60 dark:hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeSection === tab.id ? 'text-white' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}

                    <div className="mt-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase">Critical Action</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Changes to financial or security settings will be logged in the system audit ledger.</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl"
                        >
                            {activeSection === 'platform' && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                            <Globe className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Platform Configuration</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General identity and behavior</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Brand Name</label>
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                className="w-full px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Support Email</label>
                                            <input
                                                type="email"
                                                value={settings.siteEmail}
                                                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                                                className="w-full px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            <Zap className="w-24 h-24 text-white" />
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div className="max-w-md">
                                                <h4 className="text-white font-black text-lg mb-1 italic">Maintenance Mode</h4>
                                                <p className="text-slate-500 text-xs font-bold leading-relaxed">This will disable the frontend and merchant dashboards. API access will remain active for current orders.</p>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${settings.maintenanceMode
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                                    }`}
                                            >
                                                {settings.maintenanceMode ? "Enabled" : "Disabled"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'financial' && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                            <Wallet className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Fees & Thresholds</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue and payout logic Control</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Service Fee</label>
                                                <span className="text-2xl font-black text-indigo-600 tabular-nums">{settings.platformFee}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="10"
                                                step="0.1"
                                                value={settings.platformFee}
                                                onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">
                                                <Percent className="w-3 h-3" />
                                                Fee applied to every processed transaction
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Withdrawal Threshold</label>
                                                <span className="text-2xl font-black text-emerald-600 tabular-nums">${settings.minWithdrawal}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="1000"
                                                step="10"
                                                value={settings.minWithdrawal}
                                                onChange={(e) => setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                            />
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">
                                                <ArrowDownWideNarrow className="w-3 h-3" />
                                                Minimum amount required for manual or auto payouts
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-600/10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                                <RefreshCw className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-slate-900 dark:text-white font-black uppercase italic">Automatic Reconciliation</h4>
                                                <p className="text-xs text-slate-500 font-bold">System currently runs ledger audits every 6 hours.</p>
                                            </div>
                                            <button className="ml-auto px-6 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Audit Now</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                        <div className="p-3 bg-rose-500/10 rounded-2xl">
                                            <Shield className="w-6 h-6 text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Security & Access</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System hardening and admin logic</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { id: 'require2FA', label: 'Force 2FA for Administrators', desc: 'All admin accounts MUST use an authenticator app for login.', icon: AuthenticationIcon },
                                            { id: 'autoBan', label: 'Anti-Brute Force Protection', desc: 'Auto-ban IP addresses after 5 failed login attempts within 10 minutes.', icon: Shield },
                                            { id: 'secureWebhooks', label: 'Secure Webhook Delivery', desc: 'Retries with exponential backoff and HMAC signatures are mandatory.', icon: Lock },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 group hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                                                <div className="flex gap-4">
                                                    <div className="p-3 bg-slate-100 dark:bg-black/20 rounded-2xl group-hover:scale-110 transition-transform">
                                                        <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-slate-900 dark:text-white font-black text-sm uppercase italic tracking-tight">{item.label}</h5>
                                                        <p className="text-xs text-slate-500 font-bold">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Session Timeout (Min)</label>
                                            <input
                                                type="number"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                                className="w-full px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'api' && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                            <Server className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Integration Bus</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquidity provider & backend connections</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="p-8 rounded-[2rem] bg-indigo-600 text-white">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-xl">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-black italic uppercase tracking-widest">NowPayments Network</h4>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full text-[8px] font-black uppercase">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    Connected
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">Primary Webhook Secret</p>
                                                    <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl border border-white/10">
                                                        <code className="flex-1 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">{settings.webhookSecret}</code>
                                                        <Eye className="w-4 h-4 opacity-40 cursor-pointer hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-white/10 p-4 rounded-2xl text-center">
                                                        <p className="text-[8px] font-black uppercase opacity-60 mb-1">Latency</p>
                                                        <p className="text-lg font-black tabular-nums tracking-tighter">142ms</p>
                                                    </div>
                                                    <div className="bg-white/10 p-4 rounded-2xl text-center">
                                                        <p className="text-[8px] font-black uppercase opacity-60 mb-1">Success Rate</p>
                                                        <p className="text-lg font-black tabular-nums tracking-tighter">99.8%</p>
                                                    </div>
                                                    <div className="bg-white/10 p-4 rounded-2xl text-center">
                                                        <p className="text-[8px] font-black uppercase opacity-60 mb-1">IPN Load</p>
                                                        <p className="text-lg font-black tabular-nums tracking-tighter">12/min</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 space-y-4">
                                            <h4 className="text-slate-900 dark:text-white font-black uppercase italic">Master Node API Key</h4>
                                            <p className="text-xs text-slate-500 font-bold mb-4">You are currently using the key defined in <code className="bg-slate-100 dark:bg-black/20 px-1.5 py-0.5 rounded font-mono">.env.local</code>. Manual override is disabled for security.</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-12 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 flex items-center px-4 font-mono text-xs text-slate-400">
                                                    ••••••••••••••••••••••••••••••••
                                                </div>
                                                <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Test Link</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <style jsx global>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #6366f1;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
                }
            `}</style>
        </div>
    );
}

function AuthenticationIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
    );
}
