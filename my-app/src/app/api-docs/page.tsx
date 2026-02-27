"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Copy, Check, ChevronRight, Menu, X, Search,
    Book, Code2, Rocket, Shield, Webhook,
    Layers, Zap, Cpu, ArrowLeft, Terminal,
    Globe, Server, Database, Smartphone,
    AlertCircle, Info, CheckCircle2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ApiDocsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("curl");
    const [activeSection, setActiveSection] = useState("introduction");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            const sections = document.querySelectorAll("section[id]");
            let current = "";
            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute("id") || "";
                }
            });
            if (current) setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const navigation = [
        {
            group: "Getting Started",
            items: [
                { id: "introduction", title: "Introduction", icon: Book },
                { id: "standard-flow", title: "Standard Flow", icon: Layers },
                { id: "authentication", title: "Authentication", icon: Shield },
            ]
        },
        {
            group: "Payments API",
            items: [
                { id: "create-invoice", title: "Create Invoice", method: "POST" },
                { id: "create-payment", title: "Create Payment", method: "POST" },
                { id: "get-estimate", title: "Get Payment Estimate", method: "GET" },
                { id: "payment-status", title: "Get Payment Status", method: "GET" },
            ]
        },
        {
            group: "Currencies",
            items: [
                { id: "list-currencies", title: "Available Currencies", method: "GET" },
                { id: "minimum-payment", title: "Min Payment Amount", method: "GET" },
            ]
        },
        {
            group: "Integration",
            items: [
                { id: "webhooks", title: "IPN (Webhooks)", icon: Webhook },
                { id: "sandbox-testing", title: "Sandbox Testing", icon: Terminal },
                { id: "error-codes", title: "Error Codes", icon: AlertCircle },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay dark:opacity-20" />
            </div>

            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-white/70 dark:bg-[#020617]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 py-3 shadow-sm" : "bg-transparent border-transparent py-5"}`}>
                <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group text-decoration-none">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
                                <Zap className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Soltio <span className="text-indigo-600 dark:text-indigo-400 font-medium">Docs</span></span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
                            <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-decoration-none">Dashboard</Link>
                            <Link href="#" className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-0.5 text-decoration-none">API Reference</Link>
                            <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-decoration-none">SDKs</Link>
                            <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-decoration-none">Support</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 focus-within:border-indigo-500 transition-colors shadow-inner">
                            <Search className="w-3.5 h-3.5" />
                            <input type="text" placeholder="Search documentation..." className="bg-transparent border-none outline-none w-48 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" />
                        </div>
                        <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500 rounded-full font-semibold hidden sm:flex border-none px-6">
                            Start Building
                        </Button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white bg-transparent border-none">
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto flex">

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#020617] lg:bg-transparent pt-24 px-6 overflow-y-auto transition-transform lg:translate-x-0 hide-scrollbar border-r border-slate-200 lg:border-none ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
                    <div className="space-y-8 pb-10">
                        {navigation.map((group, idx) => (
                            <div key={idx} className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2.5px] px-3 mb-2">{group.group}</h4>
                                <ul className="space-y-1 list-none p-0">
                                    {group.items.map((item: any) => {
                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;
                                        return (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl transition-all group no-underline border-none ${isActive ? "bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"}`}
                                                >
                                                    {item.method ? (
                                                        <span className={`text-[9px] font-black w-12 text-center rounded px-1.5 py-0.5 ${item.method === "POST" ? "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20" : "text-indigo-600 bg-indigo-500/10 border border-indigo-500/20"}`}>
                                                            {item.method}
                                                        </span>
                                                    ) : (
                                                        Icon && <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`} />
                                                    )}
                                                    {item.title}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 lg:pl-72 pt-32 px-6 lg:px-12 pb-24 relative z-10 w-full overflow-hidden">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 max-w-full">

                        {/* Documentation Text Pane */}
                        <div className="space-y-24">

                            {/* Introduction */}
                            <section id="introduction" className="scroll-mt-32">
                                {/* Introduction */}
                                <section id="introduction" className="scroll-mt-32">
                                    <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[2px] mb-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        Soltio API Documentation
                                    </div>
                                    <h1 className="text-5xl font-black text-[#1a1f36] dark:text-white tracking-tight mb-6">Overview</h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                                        Soltio is a non-custodial cryptocurrency payment processing platform. Accept payments in a wide range of cryptos and get them instantly converted into a coin of your choice and sent to your wallet.
                                    </p>
                                    <div className="bg-white/40 dark:bg-indigo-500/5 border border-slate-200 dark:border-indigo-500/10 backdrop-blur-md rounded-3xl p-6 flex gap-4 shadow-sm transition-transform hover:-translate-y-1">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[#1a1f36] dark:text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">Key Philosophy</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                We prioritize simplicity, security, and developer freedom. Our platform requires no complex account approvals to start testing.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </section>

                            {/* Standard Flow */}
                            <section id="standard-flow" className="scroll-mt-32">
                                {/* Standard Flow */}
                                <section id="standard-flow" className="scroll-mt-32">
                                    <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white tracking-tight mb-6">Standard Payment Flow</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                                        Integrating Soltio follows a predictable 4-step process designed to minimize friction for both you and your customers.
                                    </p>
                                    <div className="space-y-8">
                                        {[
                                            { step: "01", title: "Initialize Payment", desc: "Your server sends a POST request with the order details to our API." },
                                            { step: "02", title: "Redirect Customer", desc: "Use the generated checkout URL to redirect the customer to our secure payment UI." },
                                            { step: "03", title: "Wait for Deposit", desc: "Our system monitors the blockchain for the customer's transaction." },
                                            { step: "04", title: "Receive IPN", desc: "Once verified, we send an Instant Payment Notification (Webhook) to your server." },
                                        ].map((item) => (
                                            <div key={item.step} className="flex gap-6 relative group">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600/10 group-hover:text-white group-hover:border-indigo-600/30 transition-all shadow-sm">
                                                    {item.step}
                                                </div>
                                                <div>
                                                    <h4 className="text-[#1a1f36] dark:text-white font-black mb-1">{item.title}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed font-bold">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </section>

                            {/* Authentication */}
                            <section id="authentication" className="scroll-mt-32">
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white tracking-tight mb-6">Authentication</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                    Every request to Soltio API must be authenticated using your hidden API Key.
                                </p>

                                <div className="bg-amber-500/10 dark:bg-orange-500/5 border border-amber-500/20 dark:border-orange-500/10 rounded-[24px] p-6 mb-8 flex gap-4">
                                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-orange-400 flex-shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">
                                        Keep your API keys secret. Do not use them in client-side code like React/Vue apps.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-6 rounded-[28px] bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
                                        <h4 className="text-[#1a1f36] dark:text-white font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                                            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            Required Headers
                                        </h4>
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                <tr className="group">
                                                    <td className="py-4 font-mono font-black text-indigo-600 dark:text-indigo-400">Authorization</td>
                                                    <td className="py-4 text-slate-600 dark:text-slate-500">Bearer <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-white font-mono font-bold">YOUR_API_KEY</code></td>
                                                </tr>
                                                <tr className="group">
                                                    <td className="py-4 font-mono font-black text-indigo-600 dark:text-indigo-400">Content-Type</td>
                                                    <td className="py-4 text-slate-600 dark:text-slate-500 font-mono font-bold">application/json</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            {/* Create Invoice */}
                            <section id="create-invoice" className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-[2px]">POST</span>
                                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">/api/v1/create-invoice</code>
                                </div>
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">Create Invoice</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                                    This is the most common integration. It creates a payment session where the customer chooses their preferred currency on our checkout page.
                                </p>

                                <div className="space-y-12">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-white/5 pb-2">Body Parameters</h4>
                                        <div className="space-y-8">
                                            {[
                                                { name: "amount", type: "number", req: true, desc: "The amount you want to charge. Must be positive." },
                                                { name: "currency", type: "string", req: false, desc: "Standard ISO currency code (USD, EUR, GBP). Defaults to USD.", opt: "USD" },
                                                { name: "orderId", type: "string", req: false, desc: "Internal reference for your order tracking." },
                                                { name: "orderDescription", type: "string", req: false, desc: "A short description of the products or service." },
                                            ].map((param) => (
                                                <div key={param.name} className="flex gap-16 border-b border-slate-50 dark:border-white/[0.02] pb-6 last:border-none">
                                                    <div className="w-40 flex-shrink-0">
                                                        <code className="text-sm font-black text-[#1a1f36] dark:text-white font-mono block mb-1">{param.name}</code>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono italic">{param.type}</span>
                                                            {param.req && <span className="text-[8px] text-rose-500 font-black uppercase tracking-tighter">required</span>}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed font-bold">{param.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Create Payment */}
                            <section id="create-payment" className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-[2px]">POST</span>
                                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">/api/v1/payment</code>
                                </div>
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">Create Payment</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                                    Direct payment creation. Use this if you want to handle currency selection on your own website.
                                </p>
                            </section>

                            {/* Get Payment Estimate */}
                            <section id="get-estimate" className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-[2px]">GET</span>
                                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">/api/v1/payment/estimate</code>
                                </div>
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">Get Payment Estimate</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 font-bold leading-relaxed">
                                    Calculate exactly how much crypto a user needs to send for a specific fiat amount including network fees.
                                </p>
                            </section>

                            {/* Payment Status */}
                            <section id="payment-status" className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-[2px]">GET</span>
                                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">/api/v1/payment/:id/status</code>
                                </div>
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">Transaction Status</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                    Polling for status changes. While we suggest using Webhooks, you can manually check the state of any payment.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['WAITING', 'CONFIRMING', 'FINISHED', 'EXPIRED', 'PARTIALLY_PAID', 'FAILED'].map(status => (
                                        <div key={status} className="px-4 py-2.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center justify-between shadow-sm">
                                            {status}
                                            <div className={`w-2 h-2 rounded-full ${status === 'FINISHED' ? 'bg-emerald-500 animate-pulse' : status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Available Currencies */}
                            <section id="list-currencies" className="scroll-mt-32">
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">Available Currencies</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                    Soltio supports 100+ cryptocurrencies across 20+ networks.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    {['BTC', 'ETH', 'USDT (ERC20)', 'SOL', 'USDC', 'TRX', 'DAI', 'LTC', 'BNB'].map(coin => (
                                        <div key={coin} className="p-3 text-center rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-500 font-black hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all cursor-default shadow-sm group">
                                            <span className="group-hover:scale-110 transition-transform block">{coin}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* IPN (Webhooks) */}
                            <section id="webhooks" className="scroll-mt-32">
                                <h2 className="text-3xl font-black text-[#1a1f36] dark:text-white mb-6 tracking-tight">IPN (Webhooks)</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                                    Instant Payment Notifications (IPN) are POST requests sent to your server whenever a payment status changes.
                                </p>
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[32px] bg-white/40 dark:bg-indigo-600/5 border border-slate-200 dark:border-indigo-600/20 backdrop-blur-md shadow-sm">
                                        <h4 className="text-indigo-600 dark:text-indigo-400 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Verifying Signatures
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-bold">
                                            We include an <code className="bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-black font-mono">X-Soltio-Signature</code> header. Use your Webhook Secret to generate an HMAC-SHA512 of the payload and compare it to this header.
                                        </p>
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 border border-white/5 font-mono text-[11px] shadow-2xl">
                                            <Terminal className="w-4 h-4 text-emerald-400" />
                                            <span className="text-emerald-400 overflow-hidden text-ellipsis whitespace-nowrap">hash_hmac('sha512', $payload, $secret)</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Right: Code Playground */}
                        <div className="hidden xl:block">
                            <div className="sticky top-32 space-y-12">

                                <div className="bg-[#0b1120] border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                                    <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-b border-white/5">
                                        <div className="flex gap-4">
                                            {["curl", "node", "python"].map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`text-[10px] font-black uppercase tracking-[1.5px] transition-all border-none bg-transparent cursor-pointer ${activeTab === tab ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                                                >
                                                    {tab === "curl" ? "cURL" : tab === "node" ? "Node.js" : "Python"}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                                                <Smartphone className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCopy("code", "main-code")}
                                                className="p-2 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                                            >
                                                {copiedId === "main-code" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 text-sm font-mono overflow-auto max-h-[60vh] custom-scrollbar">
                                        <AnimatePresence mode="wait">
                                            {activeTab === "curl" && (
                                                <motion.pre key="curl" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="m-0">
                                                    <code>
                                                        <span className="text-indigo-400">curl</span> -X POST https://api.soltio.com/v1/create-invoice \<br />
                                                        &nbsp;&nbsp;-H <span className="text-emerald-400">"Authorization: Bearer <span className="text-pink-400">sk_test_...</span>"</span> \<br />
                                                        &nbsp;&nbsp;-H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                                                        &nbsp;&nbsp;-d <span className="text-emerald-400">'{"{"}</span><br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"amount"</span>: <span className="text-orange-300">3999.5</span>,<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"currency"</span>: <span className="text-emerald-400">"USD"</span>,<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"orderId"</span>: <span className="text-emerald-400">"RGDBP-21314"</span>,<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"orderDescription"</span>: <span className="text-emerald-400">"Macbook Pro 2026"</span><br />
                                                        &nbsp;&nbsp;<span className="text-emerald-400">{"}"}'</span>
                                                    </code>
                                                </motion.pre>
                                            )}
                                            {activeTab === "node" && (
                                                <motion.pre key="node" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="m-0">
                                                    <code>
                                                        <span className="text-pink-400">const</span> response = <span className="text-pink-400">await</span> <span className="text-sky-400">fetch</span>(<span className="text-emerald-400">'https://api.soltio.com/v1/create-invoice'</span>, {"{"}<br />
                                                        &nbsp;&nbsp;method: <span className="text-emerald-400">'POST'</span>,<br />
                                                        &nbsp;&nbsp;headers: {"{"}<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'Authorization'</span>: <span className="text-emerald-400">'Bearer sk_test_...'</span>,<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'Content-Type'</span>: <span className="text-emerald-400">'application/json'</span><br />
                                                        &nbsp;&nbsp;{"}"},<br />
                                                        &nbsp;&nbsp;body: JSON.stringify({"{"}<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;amount: <span className="text-orange-300">3999.5</span>,<br />
                                                        &nbsp;&nbsp;&nbsp;&nbsp;orderId: <span className="text-emerald-400">'RGDBP-21314'</span><br />
                                                        &nbsp;&nbsp;{"}"})<br />
                                                        {"}"});
                                                    </code>
                                                </motion.pre>
                                            )}
                                            {activeTab === "python" && (
                                                <motion.pre key="python" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="m-0">
                                                    <code>
                                                        <span className="text-pink-400">import</span> requests<br /><br />
                                                        url = <span className="text-emerald-400">"https://api.soltio.com/v1/create-invoice"</span><br />
                                                        payload = {"{"}<br />
                                                        &nbsp;&nbsp;<span className="text-emerald-400">"amount"</span>: <span className="text-orange-300">3999.5</span>,<br />
                                                        &nbsp;&nbsp;<span className="text-emerald-400">"currency"</span>: <span className="text-emerald-400">"USD"</span><br />
                                                        {"}"}<br />
                                                        headers = {"{"}<br />
                                                        &nbsp;&nbsp;<span className="text-emerald-400">"Authorization"</span>: <span className="text-emerald-400">"Bearer sk_test_..."</span>,<br />
                                                        &nbsp;&nbsp;<span className="text-emerald-400">"Content-Type"</span>: <span className="text-emerald-400">"application/json"</span><br />
                                                        {"}"}<br /><br />
                                                        response = requests.post(url, json=payload, headers=headers)<br />
                                                        print(response.json())
                                                    </code>
                                                </motion.pre>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Sub-header for Response */}
                                    <div className="flex items-center justify-between px-6 py-3 bg-[#111827] border-t border-b border-white/5">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Example Response</span>
                                        <span className="text-[9px] font-bold text-green-400 flex items-center gap-1.5 uppercase">
                                            <div className="w-1 h-1 rounded-full bg-green-400" />
                                            201 Created
                                        </span>
                                    </div>
                                    <div className="p-8 text-[13px] font-mono text-slate-400 bg-black/40">
                                        <pre className="m-0">
                                            <code>
                                                {"{"}<br />
                                                &nbsp;&nbsp;<span className="text-sky-300">"invoiceId"</span>: <span className="text-emerald-400">"5745459419"</span>,<br />
                                                &nbsp;&nbsp;<span className="text-sky-300">"status"</span>: <span className="text-emerald-400">"waiting"</span>,<br />
                                                &nbsp;&nbsp;<span className="text-sky-300">"paymentUrl"</span>: <span className="text-emerald-400">"https://soltio.com/pay/..."</span>,<br />
                                                &nbsp;&nbsp;<span className="text-sky-300">"amount"</span>: <span className="text-orange-300">3999.5</span>,<br />
                                                &nbsp;&nbsp;<span className="text-sky-300">"currency"</span>: <span className="text-emerald-400">"usd"</span><br />
                                                {"}"}
                                            </code>
                                        </pre>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10 flex items-center justify-between">
                                    <div className="text-xs">
                                        <p className="text-white font-bold mb-1 underline">Need help with integration?</p>
                                        <p className="text-slate-500">Our engineers are available 24/7 on Discord.</p>
                                    </div>
                                    <Globe className="w-8 h-8 text-indigo-400/30" />
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Global Back Link */}
            <div className="fixed bottom-6 left-6 z-50 lg:hidden">
                <Link href="/dashboard" className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white no-underline shadow-xl border-none">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                code {
                    user-select: all;
                }
                section {
                    position: relative;
                }
            `}</style>
        </div>
    );
}
