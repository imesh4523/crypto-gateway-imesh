"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Save, CheckCircle2, QrCode, MonitorSmartphone, Palette, Check, ImageIcon, Type, Loader2 } from "lucide-react";

export default function CheckoutCustomizer() {
    const [brandName, setBrandName] = useState("");
    const [brandLogoUrl, setBrandLogoUrl] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#6366f1"); // Indigo
    const [backgroundColor, setBackgroundColor] = useState("#0f172a"); // Slate 900
    const [borderRadius, setBorderRadius] = useState("16px");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'web3'

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/user/gateway-settings');
            const data = await res.json();
            if (data.success && data.data) {
                setBrandName(data.data.brandName || "");
                setBrandLogoUrl(data.data.brandLogoUrl || "");
                setBackgroundColor(data.data.themeBgColor || "#0f172a");
                // Theme colors can be added to prisma later if needed, 
                // for now using existing background color state.
            }
        } catch (error) {
            console.error("Fetch settings error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            brandName,
            brandLogoUrl,
            themeBgColor: backgroundColor,
            themeCardColor: "#ffffff",
        };
        console.log('Sending save request...', payload);

        try {
            const res = await fetch('/api/v1/user/gateway-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', res.status);
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                const errorData = await res.json();
                console.error('Save failed:', errorData);
                alert(`Error: ${errorData.error || "Failed to save settings"}`);
            }
        } catch (error) {
            console.error("Save settings error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p className="font-medium">Loading Customizer...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 flex items-center gap-3">
                    <Palette className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> Checkout Customizer
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Personalize the payment widget to match your brand identity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Controls */}
                <div className="space-y-6">
                    <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Brand Identity</h3>

                        {/* Brand Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Brand / Store Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <Type className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="Enter your store name"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Logo URL */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Logo URL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={brandLogoUrl}
                                    onChange={(e) => setBrandLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none text-sm"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-wider font-semibold">Recommended size: 120x40px (PNG/SVG)</p>
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-white/5 w-full my-8" />

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Styling Options</h3>

                        {/* Background Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Widget Background</label>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/5">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{backgroundColor.toUpperCase()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || saved}
                            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${saved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                                }`}
                        >
                            {saving ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                            ) : saved ? (
                                <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
                            ) : (
                                <><Save className="w-5 h-5" /> Save Changes</>
                            )}
                        </button>
                    </Card>

                    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 text-sm text-indigo-800 dark:text-indigo-200 flex gap-3 items-start">
                        <MonitorSmartphone className="w-5 h-5 mt-0.5 shrink-0" />
                        <p>
                            These changes will instantly apply to your public checkout pages and embedded widgets once saved.
                        </p>
                    </div>
                </div>

                {/* Right Side: Live Preview */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Live Preview
                    </h3>

                    <div className="bg-slate-300 rounded-3xl p-8 border border-white/10 shadow-2xl flex items-center justify-center min-h-[500px] w-full">
                        {/* The Preview Widget - Mocking the Real Checkout Page */}
                        <div
                            style={{
                                backgroundColor: backgroundColor,
                                transition: 'all 0.5s ease'
                            }}
                            className="w-full max-w-sm flex flex-col items-center py-6 px-4 rounded-[2rem] shadow-2xl overflow-hidden scale-90 origin-center"
                        >
                            <div className="bg-white rounded-3xl w-full shadow-lg overflow-hidden flex flex-col">
                                {/* Mock Header */}
                                <div className="p-4 bg-[#f8f9fa] border-b border-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {brandLogoUrl ? (
                                            <img src={brandLogoUrl} alt="Logo" className="h-6 object-contain" />
                                        ) : (
                                            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
                                                <span className="font-bold text-slate-500 text-[10px]">{brandName ? brandName.substring(0, 2).toUpperCase() : "SM"}</span>
                                            </div>
                                        )}
                                        <span className="font-bold text-sm text-slate-800">{brandName || "My Store"}</span>
                                    </div>
                                    <div className="bg-black text-white text-[10px] font-bold py-1 px-3 rounded-full">Sign up</div>
                                </div>

                                {/* Mock Content */}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Select currency</h2>

                                    <div className="mb-4">
                                        <p className="font-bold text-slate-800">150.00 USD</p>
                                        <p className="text-[10px] text-slate-500 font-medium tracking-tight">Select network</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-4">
                                        <Palette className="w-3 h-3" />
                                        <span>You pay network fee</span>
                                    </div>

                                    {/* Mock Timer Card */}
                                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 mb-4 shadow-sm">
                                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-medium text-slate-400">Expiration time</p>
                                            <p className="text-emerald-500 font-bold text-xs">00:59:59</p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">U</div>
                                            <span className="text-xs font-medium text-slate-700">USDT (TRC-20)</span>
                                        </div>
                                        <Check className="w-3 h-3 text-slate-300" />
                                    </div>

                                    <div className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-center text-xs">
                                        Proceed to the payment
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-[10px] text-slate-500/50 font-medium">AML Policy</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
