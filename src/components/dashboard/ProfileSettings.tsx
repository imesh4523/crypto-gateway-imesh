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
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <User className="text-indigo-400 w-5 h-5" />
                <h3 className="font-bold text-white">Profile Details</h3>
            </div>

            {!isChangingPass ? (
                <div className="space-y-4">
                    <div className="space-y-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Address</label>
                            <p className="text-slate-200 font-medium">{email}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Account Role</label>
                            <div className="flex">
                                <span className="capitalize bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-300 border border-indigo-500/20 text-xs font-bold tracking-wide">
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>
                    {status && <p className="text-sm text-center">{status}</p>}
                    <button
                        onClick={() => setIsChangingPass(true)}
                        className="w-full mt-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Change Password
                    </button>
                </div>
            ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <label className="text-xs text-slate-400 font-medium">Current Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-medium">New Password</label>
                        <input
                            type="password"
                            required minLength={6}
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {status && <p className="text-sm text-rose-400">{status}</p>}

                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsChangingPass(false)}
                            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
