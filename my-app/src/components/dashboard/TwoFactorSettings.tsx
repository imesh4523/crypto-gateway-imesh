"use client";

import { useState } from "react";
import { Shield, Lock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function TwoFactorSettings({ initiallyEnabled }: { initiallyEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initiallyEnabled);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const generate2FA = async () => {
        setLoading(true);
        setStatus("");
        try {
            const res = await fetch("/api/v1/auth/2fa/generate", { method: "POST" });
            const result = await res.json();

            if (res.ok) {
                setQrCodeUrl(result.data.qrCodeUrl);
                setSecret(result.data.secret);
                setIsSettingUp(true);
            } else {
                setStatus(`❌ ${result.error || 'Failed to generate 2FA'}`);
            }
        } catch (error) {
            setStatus("❌ Error communicating with server.");
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        try {
            const res = await fetch("/api/v1/auth/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const result = await res.json();

            if (res.ok) {
                setEnabled(true);
                setIsSettingUp(false);
                setStatus("✅ 2FA successfully enabled!");
                setToken("");
            } else {
                setStatus(`❌ ${result.error || 'Invalid Token'}`);
            }
        } catch (error) {
            setStatus("❌ Error verifying OTP token.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    enabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-400 dark:text-slate-500"
                )}>
                    <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Two-Factor Auth</h3>
            </div>

            {enabled ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-[13px] font-black">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        2FA is Active and protecting your account.
                    </div>
                    {status && <p className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-white/20">{status}</p>}
                </div>
            ) : !isSettingUp ? (
                <div className="space-y-8">
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Enhance your account security by requiring a 6-digit verification code from your authenticator app (Google Authenticator, Authy, etc.) whenever you sign in.
                    </p>
                    {status && <p className="text-sm text-rose-500 dark:text-rose-400 font-bold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{status}</p>}
                    <button
                        onClick={generate2FA}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                    >
                        <Lock className="w-4 h-4 mr-2 stroke-[3]" /> {loading ? "Generating..." : "Enable 2FA Protection"}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 1: Scan QR Code</p>
                        <div className="bg-white p-4 rounded-[24px] inline-block shadow-inner border border-slate-100">
                            {qrCodeUrl && (
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Manual Entry Key</label>
                            <code className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-500/5 px-2 py-1 rounded w-fit">{secret}</code>
                        </div>
                    </div>

                    <form onSubmit={verify2FA} className="space-y-6 pt-4 border-t border-white/40 dark:border-white/10">
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Step 2: Verify Token</p>
                        <input
                            type="text"
                            required minLength={6} maxLength={6}
                            placeholder="000 000"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-[#1a1f36] dark:text-white font-mono tracking-[0.5em] text-center text-xl font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                        />
                        {status && <p className="text-sm text-rose-500 dark:text-rose-400 font-bold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">{status}</p>}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSettingUp(false)}
                                className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-black transition-all border border-slate-200 dark:border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                            >
                                Verify & Activate
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
