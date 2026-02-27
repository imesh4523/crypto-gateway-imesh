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
        <div className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors",
                    enabled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                        : "bg-slate-500/10 text-slate-400 dark:text-slate-500 border-slate-500/10"
                )}>
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Two-Factor Auth</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Enhanced Security</p>
                </div>
            </div>

            {enabled ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-4 px-5 py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-[14px] font-bold">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        2FA is active and protecting your account.
                    </div>
                </div>
            ) : !isSettingUp ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Add an extra layer of security to your account. We'll ask for a code from your authenticator app when you log in.
                    </p>
                    <button
                        onClick={generate2FA}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 group/btn"
                    >
                        <Lock className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" /> {loading ? "Generating Setup..." : "Enable 2FA Protection"}
                    </button>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Scan QR Code</p>
                        </div>

                        <div className="bg-white p-5 rounded-[32px] inline-block shadow-xl border border-slate-100 dark:border-white/5 mx-auto">
                            {qrCodeUrl && (
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 mix-blend-multiply dark:mix-blend-normal" />
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Manual Entry Key</label>
                            <code className="text-[13px] text-indigo-600 dark:text-indigo-400 font-mono font-black break-all">{secret}</code>
                        </div>
                    </div>

                    <form onSubmit={verify2FA} className="space-y-6 pt-6 border-t border-white/40 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verify Token</p>
                        </div>

                        <input
                            type="text"
                            required minLength={6} maxLength={6}
                            placeholder="000 000"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-5 text-[#1a1f36] dark:text-white font-mono tracking-[0.4em] text-center text-2xl font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                        />

                        {status && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-bold animate-in shake duration-300">{status}</div>}

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSettingUp(false)}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-black transition-all border border-slate-200 dark:border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                            >
                                {loading ? "Verifying..." : "Verify & Activate"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
