'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Link2, ShieldCheck, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WebhookSettings() {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/v1/dashboard/webhook-settings');
            const data = await res.json();
            if (data.success) {
                setWebhookUrl(data.data.webhookUrl || '');
                setWebhookSecret(data.data.webhookSecret || '');
            }
        } catch (error) {
            console.error('Failed to fetch webhook settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/v1/dashboard/webhook-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl })
            });
            if (res.ok) {
                alert('Webhook URL updated successfully');
            }
        } catch (error) {
            alert('Failed to update webhook URL');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('Are you sure? Old signature verification will fail immediately.')) return;
        try {
            const res = await fetch('/api/v1/dashboard/webhook-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REGENERATE_SECRET' })
            });
            const data = await res.json();
            if (data.success) {
                setWebhookSecret(data.webhookSecret);
            }
        } catch (error) {
            alert('Failed to regenerate secret');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookSecret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return null;

    return (
        <Card className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/10">
                    <Link2 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Webhook (IPN) Settings</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automated Notifications</p>
                </div>
            </div>

            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-600">
                <div>
                    <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 px-1">
                        Receiver Webhook URL
                    </label>
                    <div className="flex flex-col gap-3">
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://yourdomain.com/api/webhook"
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1a1f36] dark:text-white text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-[56px] text-white px-8 font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
                        >
                            {saving ? 'Saving...' : 'Verify & Save URL'}
                        </Button>
                    </div>
                    <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            We will send a POST request with HMAC-SHA256 signature to this URL on successful payments.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-white/5 rounded-[28px] p-7 border border-white/50 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                            IPN Secret Key
                        </label>
                        <button
                            onClick={handleRegenerate}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 font-black uppercase tracking-widest transition-all bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10"
                        >
                            <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                    </div>

                    <div className="relative group/secret">
                        <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pr-14 pl-5 py-4 font-mono text-[14px] text-blue-700 dark:text-blue-300 break-all font-bold shadow-sm min-h-[56px] flex items-center">
                            {webhookSecret || 'No secret generated'}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-xl transition-all text-slate-400 shadow-sm border border-slate-200 dark:border-white/10"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
