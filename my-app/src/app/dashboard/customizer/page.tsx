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

                        <div className="h-px bg-slate-200 dark:bg-white/5 w-full my-8" />

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            Payment Methods
                        </h3>

                        {/* Payment Method Toggles */}
                        <div className="space-y-4 mb-8">
                            <div
                                onClick={() => setShowCryptoWallet(!showCryptoWallet)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${showCryptoWallet
                                    ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30"
                                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showCryptoWallet ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-400"}`}>
                                        <QrCode className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Crypto Wallet</p>
                                        <p className="text-[10px] text-slate-500">Enable direct wallet transfers</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${showCryptoWallet ? "bg-indigo-600" : "bg-slate-300 dark:bg-white/10"}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showCryptoWallet ? "left-6" : "left-1"}`} />
                                </div>
                            </div>

                            <div
                                onClick={() => setShowBinancePay(!showBinancePay)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${showBinancePay
                                    ? "bg-[#FCD535]/10 border-[#FCD535]/30"
                                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showBinancePay ? "bg-[#FCD535] text-black" : "bg-slate-200 dark:bg-white/10 text-slate-400"}`}>
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Binance Pay</p>
                                        <p className="text-[10px] text-slate-500">Enable Binance ecosystem payments</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${showBinancePay ? "bg-[#FCD535]" : "bg-slate-300 dark:bg-white/10"}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showBinancePay ? "left-6" : "left-1"}`} />
                                </div>
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
