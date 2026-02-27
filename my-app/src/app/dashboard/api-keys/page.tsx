"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Plus, Key, EyeOff, Eye, ShieldCheck, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [webhookSecret, setWebhookSecret] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingWebhook, setSavingWebhook] = useState(false);
    const [isWebhookRevealed, setIsWebhookRevealed] = useState(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const [environment, setEnvironment] = useState<'live' | 'test'>('live');

    useEffect(() => {
        const storedMode = localStorage.getItem("isTestMode");
        const mode = storedMode === "true" ? 'test' : 'live';
        setEnvironment(mode);
        fetchData(mode);
    }, []);

    const fetchData = async (mode = environment) => {
        try {
            const isTest = mode === 'test';
            const [keysRes, webhookRes] = await Promise.all([
                fetch(`/api/v1/keys?isTestMode=${isTest}`),
                fetch('/api/v1/dashboard/webhook-settings')
            ]);

            const keysData = await keysRes.json();
            const webhookData = await webhookRes.json();

            if (keysData.data) setApiKeys(keysData.data);

            if (webhookData.success) {
                setWebhookSecret(webhookData.data.webhookSecret);
                setPublicKey(webhookData.data.publicKey);
                setWebhookUrl(webhookData.data.webhookUrl || "");
            } else if (webhookData.error === 'DATABASE_MIGRATION_REQUIRED' || webhookData.webhookSecret === 'ACCOUNT_NOT_FOUND') {
                console.warn("Account mismatch after migration. Please re-register.");
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSaveWebhook = async () => {
        if (!webhookUrl) return;
        setSavingWebhook(true);
        try {
            const res = await fetch('/api/v1/dashboard/webhook-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl })
            });
            if (res.ok) {
                alert('Webhook URL updated successfully');
            } else {
                alert('Failed to update webhook URL');
            }
        } catch (error) {
            alert('Error updating webhook URL');
        } finally {
            setSavingWebhook(false);
        }
    };

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) return;
        setGenerating(true);

        try {
            const res = await fetch('/api/v1/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newKeyName,
                    isTestMode: environment === 'test'
                })
            });

            const data = await res.json();
            if (data.success) {
                setNewlyGeneratedKey(data.data.key);
                setApiKeys([data.data, ...apiKeys]);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("Failed to generate key");
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (confirm("Are you sure you want to revoke this API Key? It will stop working immediately.")) {
            try {
                const res = await fetch(`/api/v1/keys?id=${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    setApiKeys(apiKeys.filter(key => key.id !== id));
                } else {
                    alert("Error: " + data.error);
                }
            } catch (error) {
                alert("Failed to revoke key.");
            }
        }
    };

    const closeGenerateModal = () => {
        setIsGenerateModalOpen(false);
        setNewKeyName("");
        setNewlyGeneratedKey(null);
    };

    if (loading) return <div className="text-white p-8 animate-pulse text-center">Loading Keys...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">
                        Identity & API Keys
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Manage your merchant credentials and authentication keys.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => window.open('/api-docs', '_blank')}
                        variant="outline"
                        className="border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-full font-black px-6 shadow-sm"
                    >
                        API Documentation
                    </Button>
                    <Button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black px-6 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                        Generate Secret Key
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Public Identity Card */}
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] overflow-hidden relative group shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-3xl bg-emerald-600/10 dark:bg-emerald-500/20 flex flex-shrink-0 items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                            <Key className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#1a1f36] dark:text-white mb-1 tracking-tight">Public Key</h3>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4 font-bold max-w-md leading-relaxed">Your unique identifier for client-side SDKs and payment widgets.</p>
                            <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl font-mono text-xs text-slate-700 dark:text-slate-300 tracking-wider flex justify-between items-center shadow-inner">
                                <span className="font-bold">{publicKey || "Loading..."}</span>
                                <button
                                    onClick={() => handleCopy(publicKey, "public")}
                                    className="ml-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-emerald-600 dark:hover:text-white"
                                >
                                    {copiedId === "public" ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Webhook Shield Card */}
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] overflow-hidden relative group shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 dark:bg-indigo-500/20 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#1a1f36] dark:text-white mb-1 tracking-tight">Webhook Secret</h3>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4 font-bold max-w-md leading-relaxed">Used to verify that webhook payload signatures were sent by Soltio securely.</p>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl font-mono text-xs text-slate-700 dark:text-slate-300 tracking-wider flex-1 flex justify-between items-center shadow-inner min-w-[200px] w-full">
                                    <span className="font-bold">{isWebhookRevealed ? webhookSecret : "whsec_••••••••••••••••••••••••••••"}</span>
                                    <button
                                        onClick={() => handleCopy(webhookSecret, "webhook")}
                                        className="ml-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                                    >
                                        {copiedId === "webhook" ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsWebhookRevealed(!isWebhookRevealed)}
                                    className="border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 w-full sm:w-auto text-slate-700 dark:text-white rounded-2xl font-black px-6 h-[46px]"
                                >
                                    {isWebhookRevealed ? (
                                        <><EyeOff className="w-4 h-4 mr-2 stroke-[3]" /> Hide</>
                                    ) : (
                                        <><Eye className="w-4 h-4 mr-2 stroke-[3]" /> Reveal</>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/20">
                                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Target Webhook (IPN) URL
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="url"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://your-site.com/api/webhook"
                                        className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1a1f36] dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                                    />
                                    <Button
                                        onClick={handleSaveWebhook}
                                        disabled={savingWebhook}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black px-6 h-[46px] shadow-lg shadow-indigo-600/20"
                                    >
                                        {savingWebhook ? "Saving..." : "Save URL"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl rounded-[28px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-500 dark:text-slate-400 font-black bg-white/40 dark:bg-transparent border-b border-white/40 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Name</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Token Prefix</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider">Created On</th>
                                <th className="px-6 py-5 font-black uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/[0.03]">
                            {apiKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                                        <div className="w-20 h-20 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50 dark:border-white/10 shadow-sm">
                                            <Key className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p className="font-black text-slate-800 dark:text-slate-300 text-lg">No API keys found</p>
                                        <p className="text-sm mt-1 text-slate-500 font-bold">Generate your first key to start using the API.</p>
                                    </td>
                                </tr>
                            ) : (
                                apiKeys.map((key) => (
                                    <tr key={key.id} className="group hover:bg-white/60 dark:hover:bg-white/[0.02] transition-all">
                                        <td className="px-6 py-5 font-black text-[#1a1f36] dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                    <Key className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                {key.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center bg-indigo-50/50 dark:bg-black/30 pl-3 pr-1 py-1 rounded-xl font-mono text-[13px] text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-white/10 shadow-inner">
                                                <span className="font-bold">{key.prefix}</span>
                                                <button
                                                    onClick={() => handleCopy(key.prefix, key.id)}
                                                    className="ml-2 p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                                                    title="Copy Token Prefix"
                                                >
                                                    {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] text-slate-600 dark:text-slate-400 font-bold">{key.created}</td>
                                        <td className="px-6 py-5 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevoke(key.id)}
                                                className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-xl font-black px-4"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2 stroke-[2.5]" /> Revoke
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Key Modal */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-white/10 backdrop-blur-2xl p-8 shadow-2xl rounded-[32px] max-w-md w-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-[#1a1f36] dark:text-white tracking-tight">
                            {newlyGeneratedKey ? "Key Generated ✅" : "New API Key"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold mt-2">
                            {newlyGeneratedKey
                                ? "Please copy this key now and store it safely. You won't be able to see it again for security reasons."
                                : "Give your key a descriptive name to help you identify it later."}
                        </DialogDescription>
                    </DialogHeader>

                    {newlyGeneratedKey ? (
                        <div className="space-y-6 my-6 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Your Secret Key</label>
                                <div className="bg-white dark:bg-black/50 border border-indigo-500/30 p-4 rounded-xl flex flex-col items-center gap-4 shadow-inner">
                                    <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold break-all text-center leading-relaxed">{newlyGeneratedKey}</code>
                                    <Button
                                        onClick={() => handleCopy(newlyGeneratedKey, 'new-key')}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 h-11"
                                    >
                                        {copiedId === 'new-key' ? <Check className="w-4 h-4 mr-2 stroke-[3]" /> : <Copy className="w-4 h-4 mr-2 stroke-[3]" />}
                                        {copiedId === 'new-key' ? 'Copied to Clipboard' : 'Copy Key'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="my-8">
                            <label className="text-[11px] font-black text-[#1a1f36] dark:text-slate-300 uppercase tracking-widest mb-3 block">Key Name</label>
                            <Input
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., Main Production Site"
                                className="bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 text-[#1a1f36] dark:text-white placeholder:text-slate-400 font-bold h-12 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        {newlyGeneratedKey ? (
                            <Button
                                onClick={closeGenerateModal}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl font-black h-12 transition-all shadow-lg"
                            >
                                I've saved my key
                            </Button>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={closeGenerateModal}
                                    className="flex-1 border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-black h-12 transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleGenerateKey}
                                    disabled={!newKeyName.trim() || generating}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black h-12 transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    {generating ? "Generating..." : "Generate Key"}
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
