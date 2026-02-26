"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [is2FA, setIs2FA] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            token: is2FA ? token : undefined,
        });

        setLoading(false);

        if (res?.error) {
            if (res.error === "2FA_REQUIRED") {
                setIs2FA(true);
            } else {
                setError(res.error);
                if (is2FA) setToken("");
            }
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden text-slate-200 bg-transparent">
            {/* Holographic Background */}
            <div className="fluid-bg">
                <div className="color-blob blob-blue"></div>
                <div className="color-blob blob-purple"></div>
                <div className="color-blob blob-pink"></div>
                <div className="color-blob blob-teal"></div>
                <div className="noise-overlay"></div>
            </div>

            <div className="w-full flex">
                {/* Left Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
                    <div className="w-full max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                            <div className="flex items-center gap-2 mb-8">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 4L14 13L9 8L1 16" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17 4H23V10" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs><linearGradient id="g1" x1="1" y1="4" x2="23" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs>
                                </svg>
                                <span className="font-bold text-2xl text-white tracking-wide">Soltio</span>
                            </div>

                            <AnimatePresence mode="wait">
                                {!is2FA ? (
                                    <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Welcome Back</h1>
                                        <p className="text-slate-400 text-sm mb-8">Sign in to manage your crypto payments and gateway settings.</p>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <label className="text-sm font-medium text-slate-300 block mb-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                                        placeholder="merchant@example.com" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-300 block mb-1">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                                        placeholder="••••••••" />
                                                </div>
                                            </div>

                                            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm text-center">{error}</div>}

                                            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-70">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                                            </button>
                                        </form>

                                        <p className="mt-8 text-center text-sm text-slate-400">
                                            Don&apos;t have an account?{" "}
                                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Apply for Merchant Account</Link>
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Two-Factor Auth</h1>
                                        <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code from your authenticator app to continue.</p>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input type="text" required maxLength={6} value={token}
                                                    onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                                                    className="w-full pl-10 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono tracking-[0.5em] text-center text-2xl"
                                                    placeholder="------" />
                                            </div>

                                            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm text-center">{error}</div>}

                                            <button type="submit" disabled={loading || token.length !== 6} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium transition-all disabled:opacity-50">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                                            </button>

                                            <button type="button" onClick={() => { setIs2FA(false); setToken(""); setError(""); }}
                                                className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors">
                                                ← Back to Login
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Right Decorative Panel */}
                <div className="hidden lg:flex w-1/2 bg-white/[0.02] border-l border-white/5 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f4ec651?auto=format&fit=crop&q=80&w=2670')" }} />
                    <div className="relative z-10 max-w-lg p-12 backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl text-center mx-8">
                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-500/20">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Bank-Grade Security</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Your crypto assets are protected by top-tier encryption and multi-factor authentication.
                        </p>
                        <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> 256-bit AES</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 2FA Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
