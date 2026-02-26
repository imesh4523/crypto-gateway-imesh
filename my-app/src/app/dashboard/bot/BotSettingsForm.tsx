"use client";

import { useState } from "react";
import { Save, HelpCircle, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function BotSettingsForm({ initialData }: { initialData: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [telegramToken, setTelegramToken] = useState(initialData?.telegramToken || "");
    const [binancePayId, setBinancePayId] = useState(initialData?.binancePayId || "");
    const [binanceApiKey, setBinanceApiKey] = useState(initialData?.binanceApiKey || "");
    const [binanceSecretKey, setBinanceSecretKey] = useState(initialData?.binanceSecretKey || "");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/bot/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telegramToken, binancePayId, binanceApiKey, binanceSecretKey }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Bot settings saved successfully!' });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-8 bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl shadow-xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Bot className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bot settings</h2>
                    <p className="text-slate-500 text-sm">Configure your Telegram bot tokens.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Telegram Bot Token (BotFather)</label>
                        <input
                            type="text"
                            value={telegramToken}
                            onChange={(e) => setTelegramToken(e.target.value)}
                            className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="123456789:ABCdefGHIJklmNOPqrstUVWxyz"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Binance Pay ID</label>
                            <input
                                type="text"
                                value={binancePayId}
                                onChange={(e) => setBinancePayId(e.target.value)}
                                className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="123456789"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Binance API Key</label>
                            <input
                                type="password"
                                value={binanceApiKey}
                                onChange={(e) => setBinanceApiKey(e.target.value)}
                                className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••••••••••"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Binance Secret Key</label>
                            <input
                                type="password"
                                value={binanceSecretKey}
                                onChange={(e) => setBinanceSecretKey(e.target.value)}
                                className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <HelpCircle className="w-4 h-4" /> Need help finding your API keys?
                    </span>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Card>
    );
}
