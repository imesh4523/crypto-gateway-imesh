"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Save, CheckCircle2, QrCode, MonitorSmartphone, Palette, Check } from "lucide-react";

export default function CheckoutCustomizer() {
    const [primaryColor, setPrimaryColor] = useState("#6366f1"); // Indigo
    const [backgroundColor, setBackgroundColor] = useState("#0f172a"); // Slate 900
    const [borderRadius, setBorderRadius] = useState("16px");
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'web3'

    // Preset Colors
    const presetColors = [
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#3b82f6", // Blue
        "#ec4899", // Pink
        "#8b5cf6", // Purple
    ];

    // Preset Radius
    const presetRadius = ["0px", "8px", "16px", "24px"];

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // In a real app, you would save these to the database via API
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
                    <Palette className="w-8 h-8 text-indigo-400" /> Checkout Customizer
                </h1>
                <p className="text-slate-400 mt-2">Personalize the payment widget to match your brand identity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Controls */}
                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <h3 className="text-lg font-bold text-white mb-6">Styling Options</h3>

                        {/* Primary Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Primary Color (Buttons & Accents)</label>
                            <div className="flex flex-wrap gap-3 mb-3">
                                {presetColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setPrimaryColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${primaryColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                                            }`}
                                    >
                                        {primaryColor === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-sm font-mono text-slate-400">{primaryColor.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Background Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Widget Background</label>
                            <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-sm font-mono text-slate-400">{backgroundColor.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Border Radius */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2 border-l-2 border-indigo-500 pl-2">Border Radius</label>
                            <div className="flex flex-wrap gap-3">
                                {presetRadius.map((radius) => (
                                    <button
                                        key={radius}
                                        onClick={() => setBorderRadius(radius)}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${borderRadius === radius
                                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {radius === "0px" ? "Sharp" : radius === "24px" ? "Pill" : radius}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saved}
                            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${saved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                                }`}
                        >
                            {saved ? (
                                <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
                            ) : (
                                <><Save className="w-5 h-5" /> Save Changes</>
                            )}
                        </button>
                    </Card>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 text-sm text-indigo-200 flex gap-3 items-start">
                        <MonitorSmartphone className="w-5 h-5 mt-0.5 shrink-0" />
                        <p>
                            These changes will instantly apply to your public checkout pages and embedded widgets once saved.
                        </p>
                    </div>
                </div>

                {/* Right Side: Live Preview */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Live Preview
                    </h3>

                    <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black rounded-3xl p-8 border border-white/10 shadow-2xl flex items-center justify-center min-h-[500px]">
                        {/* The Preview Widget */}
                        <div
                            style={{
                                backgroundColor: backgroundColor,
                                borderRadius: borderRadius,
                                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)`
                            }}
                            className="w-full max-w-sm overflow-hidden transition-all duration-300"
                        >
                            <div className="p-6 text-center border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-slate-400 text-sm mb-1">Pay Demo Merchant</p>
                                <h2 className="text-2xl font-bold text-white">$150.00</h2>
                            </div>

                            <div className="p-6">
                                <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl relative z-10 w-full max-w-xs mx-auto">
                                    <button
                                        onClick={() => setActiveTab('manual')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'manual' ? 'bg-white/10 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Manual
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('web3')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'web3' ? 'bg-white/10 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Web3 Wallet
                                    </button>
                                </div>

                                {/* Manual Payment View */}
                                {activeTab === 'manual' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex justify-center mb-6">
                                            <div className="p-3 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                                <QrCode className="w-24 h-24 text-slate-900" />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Send exactly</p>
                                            <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                                                <span className="font-mono text-white">0.0245 BTC</span>
                                                <Copy className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">To this address</p>
                                            <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5 gap-2">
                                                <span className="font-mono text-white text-sm truncate">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                                                <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* Web3 View */}
                                {activeTab === 'web3' && (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-300">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl mx-auto flex items-center justify-center mb-3">
                                                <MonitorSmartphone className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-medium">Connect Wallet</h4>
                                            <p className="text-xs text-slate-400 mt-1">Pay quickly and securely</p>
                                        </div>

                                        <button className="w-full flex items-center justify-between p-3.5 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-all group hover:scale-[1.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center p-1.5">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" />
                                                </div>
                                                <span className="font-medium text-white group-hover:text-orange-400 transition-colors">MetaMask</span>
                                            </div>
                                            <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">Popular</span>
                                        </button>

                                        <button className="w-full flex items-center justify-between p-3.5 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-all group hover:scale-[1.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center p-1.5">
                                                    <img src="https://trustwallet.com/assets/images/media/assets/TWT.png" alt="Trust Wallet" className="rounded-full" />
                                                </div>
                                                <span className="font-medium text-white group-hover:text-blue-400 transition-colors">Trust Wallet</span>
                                            </div>
                                        </button>

                                        <button className="w-full flex items-center justify-between p-3.5 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-all group hover:scale-[1.02] mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center p-1.5">
                                                    <div className="w-4 h-4 bg-purple-500 rounded-full" />
                                                </div>
                                                <span className="font-medium text-white group-hover:text-purple-400 transition-colors">WalletConnect</span>
                                            </div>
                                        </button>

                                        <div className="pt-2 text-center border-t border-white/5">
                                            <p className="text-[10px] text-slate-500">Secured by Gateway</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
