"use client";

import { useEffect, useState } from "react";
import {
    ShieldAlert,
    Globe,
    Lock,
    UserCheck,
    History,
    Search,
    Plus,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    Activity,
    Server,
    Smartphone,
    MapPin,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

type Tab = 'logins' | 'audit' | 'blacklist' | 'geofencing';

export default function SecurityManagement() {
    const [activeTab, setActiveTab] = useState<Tab>('logins');
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [ipBlacklist, setIpBlacklist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [newIp, setNewIp] = useState("");
    const [newIpReason, setNewIpReason] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'logins') {
                const res = await fetch("/api/admin/security/login-history");
                const data = await res.json();
                setLoginHistory(Array.isArray(data) ? data : []);
            } else if (activeTab === 'audit') {
                const res = await fetch("/api/admin/security/audit-logs");
                const data = await res.json();
                setAuditLogs(Array.isArray(data) ? data : []);
            } else if (activeTab === 'blacklist') {
                const res = await fetch("/api/admin/security/ip-blacklist");
                const data = await res.json();
                setIpBlacklist(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIp = async () => {
        if (!newIp) return;
        try {
            const res = await fetch("/api/admin/security/ip-blacklist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ipAddress: newIp, reason: newIpReason })
            });
            if (res.ok) {
                setNewIp("");
                setNewIpReason("");
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveIp = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/security/ip-blacklist?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Security <span className="text-red-500">Command</span> Center</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic opacity-80 uppercase tracking-[0.05em] text-xs">Monitor threats and enforce core system security protocols.</p>
            </div>

            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Threats', value: '0', color: 'bg-emerald-500', icon: ShieldCheck },
                    { label: 'Blocked IPs', value: (ipBlacklist?.length ?? 0).toString(), color: 'bg-red-500', icon: Lock },
                    { label: 'Login Attempts (24h)', value: '142', color: 'bg-indigo-500', icon: Activity },
                    { label: 'System Integrity', value: '100%', color: 'bg-indigo-500', icon: Server },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.color} text-white`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Security Tabs */}
            <div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'logins', label: 'Login Audit', icon: History },
                    { id: 'audit', label: 'Admin Logs', icon: ShieldAlert },
                    { id: 'blacklist', label: 'IP Blacklist', icon: Lock },
                    { id: 'geofencing', label: 'Geo-Fencing', icon: Globe }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-500 hover:bg-white/10'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'logins' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key="logins"
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10">
                                        <th className="pb-6 pl-2">Subject / Identity</th>
                                        <th className="pb-6">Access Point (IP)</th>
                                        <th className="pb-6">Device / Agent</th>
                                        <th className="pb-6">Status</th>
                                        <th className="pb-6 text-right pr-2">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning logs...</td></tr>
                                    ) : loginHistory.map((log) => (
                                        <tr key={log.id} className="group hover:bg-white/10 transition-colors">
                                            <td className="py-6 pl-2">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 dark:text-white">{log.user.name || 'Anonymous'}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{log.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-2 font-black tabular-nums text-slate-600 dark:text-slate-300">
                                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                                    {log.ipAddress || '0.0.0.0'}
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 max-w-[200px] truncate">
                                                    <Smartphone className="w-4 h-4" />
                                                    {log.userAgent || 'Unknown Agent'}
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right pr-2 font-bold tabular-nums text-slate-400 text-xs italic">
                                                {format(new Date(log.createdAt), 'yyyy.MM.dd | HH:mm:ss')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key="audit"
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10">
                                        <th className="pb-6 pl-2">Admin Authority</th>
                                        <th className="pb-6">Protocol / Action</th>
                                        <th className="pb-6">Payload / Details</th>
                                        <th className="pb-6 text-right pr-2">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Parsing master logs...</td></tr>
                                    ) : auditLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-white/10 transition-colors">
                                            <td className="py-6 pl-2 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black italic shadow-lg shadow-indigo-500/20">
                                                    {log.adminName?.[0] || 'A'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{log.adminName}</span>
                                                    <span className="text-[8px] text-slate-500 font-bold tabular-nums opacity-60 italic">{log.adminId}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-6">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm">{log.details}</p>
                                            </td>
                                            <td className="py-6 text-right pr-2 font-bold tabular-nums text-slate-400 text-xs italic opacity-70">
                                                {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'blacklist' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key="blacklist"
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Restoration / <span className="text-red-500">Ban</span></h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-red-500">Target IP Address</label>
                                        <input
                                            value={newIp}
                                            onChange={e => setNewIp(e.target.value)}
                                            placeholder="127.0.0.1"
                                            className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-black tabular-nums"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Threat Reason</label>
                                        <textarea
                                            value={newIpReason}
                                            onChange={e => setNewIpReason(e.target.value)}
                                            placeholder="Suspected brute-force attack from high-risk node..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold min-h-[100px]"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddIp}
                                        className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group active:scale-95 transition-all"
                                    >
                                        Terminate Access
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/10">
                                                <th className="pb-6 pl-2">Restricted Host</th>
                                                <th className="pb-6">Intelligence / Reason</th>
                                                <th className="pb-6 text-right pr-2">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loading ? (
                                                <tr><td colSpan={3} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Evaluating blacklist...</td></tr>
                                            ) : ipBlacklist.length === 0 ? (
                                                <tr><td colSpan={3} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active IP restrictions.</td></tr>
                                            ) : ipBlacklist.map((item) => (
                                                <tr key={item.id} className="group hover:bg-white/10 transition-colors">
                                                    <td className="py-6 pl-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="font-black tabular-nums text-slate-900 dark:text-white">{item.ipAddress}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-xs font-bold text-slate-500 max-w-xs">{item.reason}</p>
                                                    </td>
                                                    <td className="py-6 text-right pr-2">
                                                        <button
                                                            onClick={() => handleRemoveIp(item.id)}
                                                            className="p-3 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'geofencing' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key="geofencing"
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-12 text-center shadow-xl"
                    >
                        <div className="max-w-md mx-auto space-y-6 py-12">
                            <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/10 border-t-red-500 animate-spin-slow">
                                <Globe className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Geo-Fencing <span className="text-red-500">Inertia</span></h2>
                            <p className="text-slate-500 font-medium leading-relaxed italic uppercase tracking-tighter text-sm">
                                Planetary-scale node restriction protocols are currently under development.
                                <br />Coming in <span className="text-indigo-600 font-black">v2.4.0-SECURITY</span>.
                            </p>
                            <div className="pt-8">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-gradient-to-r from-red-500 to-indigo-600 animate-pulse" />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <span>Deployment Progress</span>
                                    <span>85% Complete</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
