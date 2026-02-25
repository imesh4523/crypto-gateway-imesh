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
    const [loading, setLoading] = useState(true);
    const [isWebhookRevealed, setIsWebhookRevealed] = useState(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [keysRes, webhookRes] = await Promise.all([
                fetch('/api/v1/keys'),
                fetch('/api/v1/dashboard/webhook-settings')
            ]);

            const keysData = await keysRes.json();
            const webhookData = await webhookRes.json();

            if (keysData.data) setApiKeys(keysData.data);

            if (webhookData.success) {
                setWebhookSecret(webhookData.data.webhookSecret);
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
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) return;
        setGenerating(true);

        try {
            const res = await fetch('/api/v1/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        API Keys
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your keys for authenticating API requests.</p>
                </div>
                <Button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Key
                </Button>
            </div>

            <Card className="bg-indigo-500/10 border-indigo-500/20 backdrop-blur-xl p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex flex-shrink-0 items-center justify-center text-indigo-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Webhook Secret</h3>
                        <p className="text-sm text-slate-400 mb-2">Used to verify that webhook payload signatures were sent by Soltio.</p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg font-mono text-xs text-slate-300 tracking-wider flex-1 flex justify-between items-center">
                                <span>{isWebhookRevealed ? webhookSecret : "whsec_******************************"}</span>
                                <button
                                    onClick={() => handleCopy(webhookSecret, "webhook")}
                                    className="ml-4 hover:text-white transition-colors"
                                >
                                    {copiedId === "webhook" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsWebhookRevealed(!isWebhookRevealed)}
                                className="border-white/10 bg-white/5 hover:bg-white/10 w-full sm:w-auto text-white"
                            >
                                {isWebhookRevealed ? (
                                    <><EyeOff className="w-4 h-4 mr-2" /> Hide</>
                                ) : (
                                    <><Eye className="w-4 h-4 mr-2" /> Reveal</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Token Prefix</th>
                                <th className="px-6 py-4 font-medium">Created On</th>
                                <th className="px-6 py-4 font-medium">Last Used</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {apiKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        No API keys found. Generate one to get started.
                                    </td>
                                </tr>
                            ) : (
                                apiKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            <Key className="w-4 h-4 text-slate-500" />
                                            {key.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center bg-black/30 px-2 py-1 rounded font-mono text-xs text-indigo-300 border border-white/5">
                                                {key.prefix}
                                                <button
                                                    onClick={() => handleCopy(key.prefix, key.id)}
                                                    className="ml-2 hover:text-white transition-colors"
                                                    title="Copy Token Prefix"
                                                >
                                                    {copiedId === key.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{key.created}</td>
                                        <td className="px-6 py-4 text-slate-400">{key.lastUsed}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevoke(key.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Revoke
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
                <DialogContent className="bg-slate-900 border-white/10 text-white p-6 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {newlyGeneratedKey ? "API Key Generated ✅" : "Generate New API Key"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {newlyGeneratedKey
                                ? "Please copy this key now. You won't be able to see it again."
                                : "Give your new API key a memorable name to identify its purpose."}
                        </DialogDescription>
                    </DialogHeader>

                    {newlyGeneratedKey ? (
                        <div className="space-y-4 my-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Secret Key</label>
                                <div className="bg-black/50 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between gap-4 break-all">
                                    <code className="text-indigo-300 font-mono text-sm">{newlyGeneratedKey}</code>
                                    <Button
                                        size="sm"
                                        onClick={() => handleCopy(newlyGeneratedKey, 'new-key')}
                                        className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                                    >
                                        {copiedId === 'new-key' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copiedId === 'new-key' ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="my-4">
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Key Name</label>
                            <Input
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., Production Next.js App"
                                className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        {newlyGeneratedKey ? (
                            <Button
                                onClick={closeGenerateModal}
                                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                Done
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={closeGenerateModal}
                                    className="border-white/10 bg-transparent text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleGenerateKey}
                                    disabled={!newKeyName.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generate
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
