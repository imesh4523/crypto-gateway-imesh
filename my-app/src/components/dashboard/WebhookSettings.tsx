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
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Link2 className="text-blue-400 w-5 h-5" />
                <h3 className="font-bold text-white">Webhook (IPN) Settings</h3>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Receiver Webhook URL
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://yourdomain.com/api/soltio-webhook"
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 h-auto"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        We will send a POST request to this URL whenever a payment is successful.
                    </p>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            IPN Secret Key
                        </label>
                        <button
                            onClick={handleRegenerate}
                            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-xs text-blue-300 break-all">
                            {webhookSecret || 'No secret generated'}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500">
                            Use this secret to verify the HMAC-SHA512 signature in the <code className="text-slate-300">x-soltio-signature</code> header.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
