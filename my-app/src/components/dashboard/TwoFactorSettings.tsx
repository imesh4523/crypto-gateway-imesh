"use client";

import { useState } from "react";
import { Shield, Lock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

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
        <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
                <Shield className={`w-5 h-5 ${enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <h3 className="font-bold text-slate-900 dark:text-white">Two-Factor Auth</h3>
            </div>

            {enabled ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        2FA is Active and protecting your account.
                    </div>
                    {status && <p className="text-sm mt-2 text-slate-700 dark:text-slate-300">{status}</p>}
                </div>
            ) : !isSettingUp ? (
                <>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Enhance your account security by requiring a code from your authenticator app.</p>
                    {status && <p className="text-sm text-rose-500 dark:text-rose-400 mb-4">{status}</p>}
                    <button
                        onClick={generate2FA}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Lock className="w-4 h-4 mr-2" /> {loading ? "Generating..." : "Enable 2FA"}
                    </button>
                </>
            ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm text-slate-600 dark:text-slate-400">1. Scan this QR code using Google Authenticator or Authy.</p>

                    <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                        {qrCodeUrl && (
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Secret: {secret}</p>

                    <form onSubmit={verify2FA} className="mt-4 space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">2. Enter the 6-digit code from your app to verify.</p>
                        <input
                            type="text"
                            required minLength={6} maxLength={6}
                            placeholder="000000"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500"
                        />
                        {status && <p className="text-sm text-rose-500 dark:text-rose-400">{status}</p>}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSettingUp(false)}
                                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-colors border border-slate-200 dark:border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                Verify & Enable
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
