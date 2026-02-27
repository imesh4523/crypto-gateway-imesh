"use client";

import { useState } from "react";
import { User } from "lucide-react";

export function ProfileSettings({ email, role }: { email: string, role: string }) {
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");

        try {
            const res = await fetch("/api/v1/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("✅ Password updated successfully.");
                setIsChangingPass(false);
                setCurrentPass("");
                setNewPass("");
            } else {
                setStatus(`❌ ${data.error || 'Failed to update password'}`);
            }
        } catch (error) {
            setStatus("❌ An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-indigo-500/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Profile Details</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Account Identification</p>
                </div>
            </div>

            {!isChangingPass ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-black">Email Address</label>
                            <div className="flex items-center gap-2 group/email cursor-pointer">
                                <p className="text-[#1a1f36] dark:text-white font-bold text-[17px] tracking-tight">{email}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-black">Account Role</label>
                            <div className="flex">
                                <span className="capitalize bg-white dark:bg-white/5 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 text-xs font-black tracking-widest shadow-sm">
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>
                    {status && <p className="text-sm text-center text-slate-700 dark:text-slate-300 font-bold bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20 mt-6">{status}</p>}
                    <button
                        onClick={() => setIsChangingPass(true)}
                        className="w-full mt-10 py-4 border border-indigo-500/20 dark:border-white/10 rounded-2xl text-[#1a1f36] dark:text-white font-black hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                    >
                        Change Account Password
                    </button>
                </div>
            ) : (
                <form onSubmit={handlePasswordChange} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2.5 block px-1">Current Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            placeholder="••••••••"
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1a1f36] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2.5 block px-1">New Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            placeholder="Minimum 6 characters"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1a1f36] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {status && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-bold animate-in shake duration-300">{status}</div>}

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsChangingPass(false)}
                            className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-black transition-all border border-slate-200 dark:border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                        >
                            {loading ? "Saving..." : "Update Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
