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
        <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Link2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Webhook (IPN) Settings</h3>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                        Receiver Webhook URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://yourdomain.com/api/soltio-webhook"
                            className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1a1f36] dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 h-[46px] text-white px-8 font-black rounded-xl shadow-lg shadow-blue-600/20"
                        >
                            {saving ? 'Saving...' : 'Save URL'}
                        </Button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> We will send a POST request with HMAC-SHA256 signature to this URL on successful payments.
                    </p>
                </div>

                <div className="bg-white/50 dark:bg-black/20 rounded-[24px] p-6 border border-white/50 dark:border-white/5 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            IPN Secret Key
                        </label>
                        <button
                            onClick={handleRegenerate}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 font-black uppercase tracking-widest transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 font-mono text-[13px] text-blue-700 dark:text-blue-300 break-all font-bold shadow-sm">
                            {webhookSecret || 'No secret generated'}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-blue-600 dark:hover:text-white shadow-sm border border-slate-200 dark:border-white/10"
                        >
                            {copied ? <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
