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
        <div className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Profile Details</h3>
            </div>

            {!isChangingPass ? (
                <div>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Email Address</label>
                            <p className="text-[#1a1f36] dark:text-white font-black text-lg">{email}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Account Role</label>
                            <div className="flex">
                                <span className="capitalize bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-black tracking-wider">
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>
                    {status && <p className="text-sm text-center text-slate-700 dark:text-slate-300 font-bold bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20 mt-4">{status}</p>}
                    <button
                        onClick={() => setIsChangingPass(true)}
                        className="w-full mt-8 py-3.5 border border-white/50 dark:border-white/10 rounded-2xl text-[#1a1f36] dark:text-white font-black hover:bg-white/50 dark:hover:bg-white/10 transition-all shadow-sm"
                    >
                        Change Password
                    </button>
                </div>
            ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2 block">Current Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1a1f36] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2 block">New Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1a1f36] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                        />
                    </div>

                    {status && <p className="text-sm text-rose-500 dark:text-rose-400 font-bold">{status}</p>}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsChangingPass(false)}
                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-black transition-all border border-slate-200 dark:border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                        >
                            {loading ? "Saving..." : "Save Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
