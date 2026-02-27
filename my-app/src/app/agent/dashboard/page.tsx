"use client";

import { motion } from "framer-motion";
import { Briefcase, Users, TrendingUp, Shield, LogOut, Globe, Wallet } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function AgentDashboard() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-2 rounded-xl">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic">Agent<span className="text-emerald-500">Panel</span></h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Distribution Portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-black uppercase">{session?.user?.name || 'Agent'}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">{session?.user?.email}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/agent/login' })}
                        className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: "Direct Merchants", value: "14", icon: Users, color: "text-blue-500" },
                    { label: "Active Revenue", value: "$4,290.00", icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Commission Balance", value: "$642.15", icon: Wallet, color: "text-amber-500" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group"
                    >
                        <stat.icon className={`w-12 h-12 ${stat.color} opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform`} />
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black tabular-nums">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-600/20">
                    <Shield className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-black italic mb-2">Commission Engine <span className="text-indigo-500">Initializing</span></h2>
                <p className="text-slate-500 text-sm max-w-md font-medium">
                    The agent distribution system is being synchronized with the global ledger.
                    Detailed merchant performance and payout history will be available shortly.
                </p>
                <div className="mt-8 flex gap-4">
                    <div className="px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        Network Live
                    </div>
                </div>
            </div>
        </div>
    );
}
