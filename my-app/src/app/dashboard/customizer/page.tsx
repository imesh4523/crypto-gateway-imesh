"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Save, CheckCircle2, QrCode, MonitorSmartphone, Palette, Check, ImageIcon, Type, Loader2, Upload, Trash2, ShieldCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutCustomizer() {
    const [brandName, setBrandName] = useState("");
    const [brandLogoUrl, setBrandLogoUrl] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#6366f1"); // Indigo
    const [backgroundColor, setBackgroundColor] = useState("#0f172a"); // Slate 900
    const [borderRadius, setBorderRadius] = useState("16px");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'web3'

    // Payment Method Visibility
    const [showCryptoWallet, setShowCryptoWallet] = useState(true);
    const [showBinancePay, setShowBinancePay] = useState(true);

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
                setShowCryptoWallet(data.data.enabledCryptoWallet !== false);
                setShowBinancePay(data.data.enabledBinancePay !== false);
                // Theme colors can be added to prisma later if needed, 
                // for now using existing background color state.
            }
        } catch (error) {
            console.error("Fetch settings error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File size too large. Maximum size is 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/v1/user/upload-logo', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setBrandLogoUrl(data.url);
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Logo upload error:", error);
            alert("An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            brandName,
            brandLogoUrl,
            themeBgColor: backgroundColor,
            themeCardColor: "#ffffff",
            enabledCryptoWallet: showCryptoWallet,
            enabledBinancePay: showBinancePay
        };

        try {
            const res = await fetch('/api/v1/user/gateway-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                const errorData = await res.json();
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight flex items-center gap-3">
                    Checkout Customizer
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Personalize the payment widget to match your brand identity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Controls */}
                <div className="space-y-6">
                    <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

                        <div className="flex items-center gap-4 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Palette className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Customization</h3>
                            <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-indigo-500" />
                        </div>

                        <div className="space-y-6">
                            {/* Brand Settings Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Brand Name */}
                                <div className="space-y-2.5">
                                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black block">Store Name</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                            <Type className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="Your Store Name"
                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 text-[#1a1f36] dark:text-white font-bold focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Background Color */}
                                <div className="space-y-2.5">
                                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black block">Overlay Color</label>
                                    <div className="flex items-center gap-3 bg-white dark:bg-black/20 p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                                        <input
                                            type="color"
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                                        />
                                        <span className="text-xs font-black font-mono text-slate-600 dark:text-slate-400 pr-3">{backgroundColor.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload Section */}
                            <div className="space-y-2.5">
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black block">Brand Logo</label>
                                <div className="flex items-center gap-5 p-5 bg-white/50 dark:bg-black/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner">
                                    <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden group/logo shrink-0">
                                        {brandLogoUrl ? (
                                            <img src={brandLogoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="w-7 h-7 text-slate-300" />
                                        )}
                                        {brandLogoUrl && (
                                            <button
                                                onClick={() => setBrandLogoUrl("")}
                                                className="absolute inset-0 bg-rose-600/80 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5 text-white" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2.5">
                                        <div className="flex flex-col">
                                            <p className="text-[13px] font-black text-[#1a1f36] dark:text-white tracking-tight">Upload Logo</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">PNG, SVG or JPEG (Max 2MB)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className={cn(
                                                "cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2",
                                                uploading && "opacity-50 cursor-wait"
                                            )}>
                                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                {uploading ? "Uploading..." : "Upload"}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Section */}
                            <div className="space-y-3 pt-4 border-t border-white/40 dark:border-white/10">
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black block">Enabled Payment Methods</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setShowCryptoWallet(!showCryptoWallet)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                                            showCryptoWallet
                                                ? "bg-indigo-500/5 border-indigo-500/30"
                                                : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                                                showCryptoWallet ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 dark:bg-white/10 text-slate-400"
                                            )}>
                                                <QrCode className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1a1f36] dark:text-white">Direct Crypto</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Self-custody</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-9 h-5 rounded-full relative transition-all",
                                            showCryptoWallet ? "bg-indigo-600 shadow-inner" : "bg-slate-200 dark:bg-white/10"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                                                showCryptoWallet ? "left-5" : "left-1"
                                            )} />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setShowBinancePay(!showBinancePay)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                                            showBinancePay
                                                ? "bg-[#FCD535]/5 border-[#FCD535]/30"
                                                : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                                                showBinancePay ? "bg-[#FCD535] text-black shadow-lg shadow-[#FCD535]/20" : "bg-slate-100 dark:bg-white/10 text-slate-400"
                                            )}>
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1a1f36] dark:text-white">Binance Pay</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Exchange-linked</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-9 h-5 rounded-full relative transition-all",
                                            showBinancePay ? "bg-[#FCD535] shadow-inner" : "bg-slate-200 dark:bg-white/10"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                                                showBinancePay ? "left-5" : "left-1"
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || saved}
                                className={cn(
                                    "w-full py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all",
                                    saved
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                        : "bg-[#1a1f36] dark:bg-indigo-600 hover:bg-[#2d334d] dark:hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20"
                                )}
                            >
                                {saving ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Configuration...</>
                                ) : saved ? (
                                    <><CheckCircle2 className="w-5 h-5" /> All Changes Saved</>
                                ) : (
                                    <><Save className="w-5 h-5 stroke-[2.5]" /> Apply Settings</>
                                )}
                            </button>
                        </div>
                    </Card>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 text-sm text-indigo-700 dark:text-indigo-300 flex gap-4 items-start shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                            <MonitorSmartphone className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black">Instant Integration</p>
                            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">Everything you customize here will reflect instantly on your hosted checkout pages and API deployments.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Live Preview */}
                <div className="flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Live Preview
                    </h3>

                    <div className="bg-slate-200/50 dark:bg-black/20 rounded-[2.5rem] p-4 sm:p-8 border border-white/20 shadow-inner flex items-center justify-center min-h-[700px] w-full relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                        {/* The High-Fidelity Preview Widget */}
                        <div
                            style={{ backgroundColor: backgroundColor }}
                            className="w-full max-w-[360px] flex flex-col items-center pt-2 pb-6 px-4 rounded-[2.5rem] shadow-2xl relative z-10 transition-all duration-500 border border-white/10"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mb-4 mt-1" />

                            <div className="bg-white rounded-[2rem] w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100">
                                {/* Header */}
                                <div className="p-5 bg-white border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {brandLogoUrl ? (
                                            <img src={brandLogoUrl} alt="Logo" className="h-7 object-contain" />
                                        ) : (
                                            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="font-black text-white text-[10px] tracking-tighter">{brandName ? brandName.substring(0, 2).toUpperCase() : "SM"}</span>
                                            </div>
                                        )}
                                        <span className="font-black text-base tracking-tight text-slate-900">{brandName || "Oriyoto"}</span>
                                    </div>
                                    <div className="bg-slate-950 text-white text-[9px] font-black py-1.5 px-3.5 rounded-full uppercase tracking-wider">Sign up</div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 pt-5">
                                    {/* Payment Method Section */}
                                    <div className="mb-6">
                                        {(showCryptoWallet || showBinancePay) ? (
                                            <>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] mb-3 ml-1">Payment Method</p>
                                                <div className={`grid gap-2.5 ${showCryptoWallet && showBinancePay ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                    {/* Crypto Card */}
                                                    {showCryptoWallet && (
                                                        <div className="p-3 rounded-[1.2rem] border-2 border-indigo-500 bg-indigo-50/50 shadow-sm flex flex-col gap-1.5 relative transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm p-1.5 border border-slate-100">
                                                                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024" className="w-full h-full" alt="Crypto" />
                                                                </div>
                                                                <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white stroke-[3px]" /></div>
                                                            </div>
                                                            <div className="mt-1">
                                                                <p className="font-black text-xs text-slate-900 leading-none mb-0.5">Crypto</p>
                                                                <p className="text-[8px] text-slate-400 font-bold whitespace-nowrap">BTC, USDT, ETH...</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Binance Card */}
                                                    {showBinancePay && (
                                                        <div className={`p-3 rounded-[1.2rem] border-2 flex flex-col gap-1.5 relative transition-all ${!showCryptoWallet ? 'border-[#F0B90B] bg-[#FFFBEB] shadow-sm' : 'border-slate-100 bg-white'}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="w-7 h-7 bg-[#F0B90B] rounded-lg flex items-center justify-center shadow-sm p-1.5 border border-[#F0B90B]/20">
                                                                    <div className="w-full h-full text-black font-black italic text-[10px] flex items-center justify-center">B</div>
                                                                </div>
                                                                {!showCryptoWallet && <div className="w-4 h-4 bg-[#F0B90B] rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-black stroke-[3px]" /></div>}
                                                            </div>
                                                            <div className="mt-1">
                                                                <p className="font-black text-xs text-slate-800 leading-none mb-0.5">Binance Pay</p>
                                                                <p className="text-[8px] text-slate-400 font-bold">Pay via ID</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-6 border-2 border-dashed border-slate-100 rounded-[1.2rem] text-center">
                                                <p className="text-[10px] font-bold text-slate-400 italic">No methods enabled</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Select Payment Section */}
                                    <div className="mb-6">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] mb-4 ml-1">Select Payment</p>

                                        <div className="space-y-4">
                                            {/* Currency Select */}
                                            <div>
                                                <label className="text-[8px] font-black text-slate-400 mb-1.5 block uppercase tracking-[1px] ml-1">1. Choose Currency</label>
                                                <div className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-[1.2rem] shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center p-1.5 border border-slate-50">
                                                            <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024" className="w-full h-full" alt="USDT" />
                                                        </div>
                                                        <span className="font-black text-slate-900 text-sm">USDT</span>
                                                    </div>
                                                    <Check className="w-4 h-4 text-slate-200 transition-transform rotate-90" />
                                                </div>
                                            </div>

                                            {/* Network Select */}
                                            <div>
                                                <label className="text-[8px] font-black text-slate-400 mb-1.5 block uppercase tracking-[1px] ml-1">2. Choose Network</label>
                                                <div className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-[1.2rem] shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center p-1.5 border border-slate-50">
                                                            <img src="https://cryptologos.cc/logos/tron-trx-logo.svg?v=024" className="w-full h-full" alt="Tron" />
                                                        </div>
                                                        <span className="font-black text-slate-900 text-sm italic">TRON (TRC-20)</span>
                                                    </div>
                                                    <Check className="w-4 h-4 text-slate-200 transition-transform rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Card */}
                                    <div className="bg-[#0f121d] rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                                        {/* Glow Effect */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />

                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[1.5px] mb-3">Total to pay</p>
                                        <div className="flex items-baseline gap-2 mb-5">
                                            <span className="text-4xl font-black tabular-nums">3</span>
                                            <span className="text-xl font-bold text-slate-400 uppercase italic">USD</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1">
                                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f121d] z-20">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-[#0f121d] z-10">
                                                    <QrCode className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[1px]">Global Secure Protocol</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-[9px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                                Powered by <span className="text-white/70">Oriyoto Gateway</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
