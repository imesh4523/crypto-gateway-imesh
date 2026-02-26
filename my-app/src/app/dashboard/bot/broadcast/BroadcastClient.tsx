"use client";

import { useState, useCallback, useEffect } from "react";
import { Megaphone, Send, Loader2, ChevronLeft, Calendar, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface BroadcastMessage {
    id: string;
    content: string;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    status: string;
    sentCount: number;
    createdAt: string;
}

interface Product {
    id: string;
    name: string;
}

export default function BroadcastClient({ products, trialActive }: { products: Product[], trialActive?: boolean }) {
    const [messages, setMessages] = useState<BroadcastMessage[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [buttonText, setButtonText] = useState("");
    const [buttonType, setButtonType] = useState<"url" | "product" | "none">("none");
    const [buttonUrl, setButtonUrl] = useState("");
    const [buttonProductId, setButtonProductId] = useState("");

    const fetchMessages = useCallback(async () => {
        const res = await fetch("/api/bot/broadcast");
        if (res.ok) setMessages(await res.json());
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const maxMB = trialActive ? 3 : 10;
            if (file.size > maxMB * 1024 * 1024) {
                alert(`File too large. Current limit is ${maxMB}MB${trialActive ? ' (Free Trial)' : ''}.`);
                e.target.value = "";
                return;
            }
            setMediaFile(file);
        }
    };

    const handleSend = async () => {
        if (!content.trim() && !mediaFile) return alert("Message or Media is required");
        if (buttonType !== "none" && !buttonText.trim()) return alert("Button text is required if you attached a button action");
        if (!confirm("Are you sure you want to broadcast this message to ALL bot users?")) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("content", content);
            if (mediaFile) formData.append("media", mediaFile);
            if (buttonText) formData.append("buttonText", buttonText);
            if (buttonType === "url") formData.append("buttonUrl", buttonUrl);
            if (buttonType === "product") formData.append("buttonActionData", `prod_${buttonProductId}`);

            const res = await fetch("/api/bot/broadcast", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Broadcast started! Queueing for ${data.targets} users.`);
                setContent("");
                setMediaFile(null);
                setButtonText("");
                setButtonType("none");
                setButtonUrl("");
                setButtonProductId("");
                await fetchMessages();
            } else {
                alert(`Error: ${data.error}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/bot" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Broadcast Module</h1>
                    <p className="text-sm text-slate-500">Send mass messages, images, and custom buttons to all your Telegram bot users</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compose Message */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
                        <Megaphone className="w-5 h-5 text-indigo-500" /> New Broadcast
                    </h2>

                    {/* Media */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Image / GIF / Video (Optional)</span>
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 rounded-full py-0.5 font-bold">Max: {trialActive ? '3MB' : '10MB'}</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*,video/mp4,image/gif"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                        />
                        {mediaFile && (
                            <p className="text-xs text-emerald-500 font-bold ml-1 flex items-center gap-1">✓ Attached: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)}MB)</p>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            Message Content <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono placeholder:opacity-50"
                            placeholder="Hello *Everyone*, check out our new stock! 🚀"
                        />
                    </div>

                    {/* Custom Button Settings */}
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Call to Action Button</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setButtonType("none")} className={`py-2 px-3 text-xs font-bold rounded-lg border ${buttonType === "none" ? "bg-indigo-500 text-white border-indigo-500" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10"}`}>None</button>
                            <button onClick={() => setButtonType("url")} className={`py-2 px-3 text-xs font-bold rounded-lg border ${buttonType === "url" ? "bg-indigo-500 text-white border-indigo-500" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10"}`}>Custom URL</button>
                            <button onClick={() => setButtonType("product")} className={`col-span-2 py-2 px-3 text-xs font-bold rounded-lg border ${buttonType === "product" ? "bg-indigo-500 text-white border-indigo-500" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10"}`}>Buy Specific Product</button>
                        </div>

                        {buttonType !== "none" && (
                            <div className="space-y-3 pt-2">
                                <input
                                    value={buttonText}
                                    onChange={(e) => setButtonText(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-50"
                                    placeholder="Button Text (e.g. Buy Digital Ocean)"
                                />
                                {buttonType === "url" && (
                                    <input
                                        value={buttonUrl}
                                        onChange={(e) => setButtonUrl(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:opacity-50"
                                        placeholder="https://google.com"
                                    />
                                )}
                                {buttonType === "product" && (
                                    <select
                                        value={buttonProductId}
                                        onChange={(e) => setButtonProductId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>Select Product to Buy</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={loading || (!content.trim() && !mediaFile)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-lg mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Broadcast to All Users
                    </button>
                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold">Use this feature responsibly to avoid rate limits.</p>
                </div>

                {/* Broadcast History */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
                        <Calendar className="w-5 h-5 text-indigo-500" /> History
                    </h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {messages.length === 0 ? (
                            <div className="py-10 text-center text-slate-500">
                                No previous broadcasts found.
                            </div>
                        ) : (
                            messages.map(m => (
                                <div key={m.id} className="p-4 border border-slate-100 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>
                                        <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">{m.status}</span>
                                    </div>
                                    {m.imageUrl && (
                                        <div className="text-xs bg-indigo-500/10 text-indigo-500 p-2 rounded-lg font-bold flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Attached Media
                                        </div>
                                    )}
                                    <code className="text-xs text-slate-700 dark:text-slate-300 block bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm max-h-32 overflow-y-auto">
                                        {m.content}
                                    </code>
                                    {m.buttonText && (
                                        <div className="inline-block px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-center">
                                            [ {m.buttonText} ]
                                        </div>
                                    )}
                                    <div className="text-xs font-bold text-emerald-500 flex justify-end">
                                        ✓ Delivered to {m.sentCount} users
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
