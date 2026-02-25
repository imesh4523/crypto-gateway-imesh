"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, Loader2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(data.error || "Something went wrong during registration.");
            }
        } catch (err) {
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex relative overflow-hidden text-slate-200">
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

            <div className="w-full flex">
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
                    <div className="w-full max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

                            <div className="flex items-center gap-2 mb-8">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 4L14 13L9 8L1 16" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17 4H23V10" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs><linearGradient id="g2" x1="1" y1="4" x2="23" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#10b981" /><stop offset="1" stopColor="#6366f1" /></linearGradient></defs>
                                </svg>
                                <span className="font-bold text-2xl text-white tracking-wide">Soltio</span>
                            </div>

                            {success ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">Registration Successful!</h3>
                                    <p className="text-slate-400">Redirecting you to the login page...</p>
                                </motion.div>
                            ) : (
                                <motion.div key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Create Account</h1>
                                    <p className="text-slate-400 text-sm mb-8">Join Soltio to start accepting crypto payments on your platform.</p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 block mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                                                    placeholder="John Doe" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 block mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                                                    placeholder="merchant@example.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 block mb-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                                                    placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 block mb-1">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6}
                                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                                                    placeholder="••••••••" />
                                            </div>
                                        </div>

                                        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm text-center">{error}</div>}

                                        <button type="submit" disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-70">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                    </form>

                                    <p className="mt-6 text-center text-sm text-slate-400">
                                        Already have an account?{" "}
                                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Sign in here</Link>
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Right Decorative Panel */}
                <div className="hidden lg:flex w-1/2 bg-white/[0.02] border-l border-white/5 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=2670')" }} />
                    <div className="relative z-10 max-w-lg p-12 backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl text-center mx-8">
                        <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] border border-indigo-500/20">
                            <Rocket className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Start Accepting Crypto Today</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Join thousands of merchants integrating seamless crypto gateways. Get your API keys in seconds, zero setup fees required.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <h4 className="text-emerald-400 font-bold mb-1">Instant Setup</h4>
                                <p className="text-xs text-slate-400">No KYC required for sandbox mode. Start building right away.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <h4 className="text-indigo-400 font-bold mb-1">Global Reach</h4>
                                <p className="text-xs text-slate-400">Accept 50+ cryptocurrencies from customers all worldwide.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
