"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft, Download, ExternalLink, Check, Copy, ChevronRight,
    Zap, Shield, Globe, Package, Terminal, BookOpen,
    CheckCircle2, Clock, Star, ArrowRight, Code2, Puzzle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Real platform SVG icons
const PlatformIcon = ({ id, size = 28 }: { id: string; size?: number }) => {
    switch (id) {
        case "woocommerce":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <path d="M2 4.5C2 3.67 2.67 3 3.5 3H20.5C21.33 3 22 3.67 22 4.5V16.5C22 17.33 21.33 18 20.5 18H14L12 21L10 18H3.5C2.67 18 2 17.33 2 16.5V4.5Z" fill="#96588a" />
                    <circle cx="7" cy="10" r="1.5" fill="white" />
                    <circle cx="12" cy="10" r="1.5" fill="white" />
                    <circle cx="17" cy="10" r="1.5" fill="white" />
                    <path d="M6 13.5C6.5 14.5 7.5 15 8.5 14.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <path d="M11 13.5C11.5 14.5 12.5 15 13.5 14.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <path d="M16 13.5C16.5 14.5 17.5 15 18.5 14.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                </svg>
            );
        case "shopify":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <path d="M15.34 3.04C15.34 3.04 15.11 3.1 14.74 3.2C14.68 2.98 14.58 2.72 14.42 2.46C13.96 1.68 13.28 1.28 12.46 1.28C12.36 1.28 12.26 1.28 12.16 1.3C12.12 1.24 12.08 1.2 12.04 1.14C11.68 0.76 11.22 0.58 10.68 0.6C9.64 0.62 8.6 1.38 7.78 2.66C7.2 3.56 6.76 4.7 6.62 5.56C5.48 5.9 4.7 6.14 4.68 6.16C4.12 6.34 4.1 6.36 4.04 6.88C3.98 7.28 2 22 2 22L16.08 24L22 22.38C22 22.38 18.22 4.54 18.18 4.34C18.14 4.14 17.96 4.02 17.82 4C17.66 3.98 15.36 3.06 15.36 3.06L15.34 3.04ZM13.56 3.56C13.24 3.66 12.88 3.76 12.5 3.9V3.7C12.5 3.02 12.4 2.5 12.22 2.1C12.82 2.2 13.26 2.88 13.56 3.56ZM11.38 2.22C11.58 2.6 11.72 3.14 11.72 3.96V4.1L9.86 4.66C10.18 3.48 10.82 2.7 11.38 2.22ZM10.62 1.38C10.74 1.38 10.86 1.4 10.96 1.46C10.22 1.98 9.44 2.96 9.1 4.44L7.58 4.9C7.9 3.76 8.86 1.42 10.62 1.38Z" fill="#95bf47" />
                    <path d="M15.34 3.04C15.34 3.04 15.11 3.1 14.74 3.2C14.68 2.98 14.58 2.72 14.42 2.46C13.96 1.68 13.28 1.28 12.46 1.28C12.36 1.28 12.26 1.28 12.16 1.3C12.12 1.24 12.08 1.2 12.04 1.14C11.68 0.76 11.22 0.58 10.68 0.6" fill="#5E8E3E" />
                    <path d="M12.5 3.9V3.7C12.5 3.02 12.4 2.5 12.22 2.1C12.82 2.2 13.26 2.88 13.56 3.56L12.5 3.9Z" fill="#5E8E3E" />
                    <path d="M16.08 24L22 22.38L18.18 4.34C18.14 4.14 17.96 4.02 17.82 4L15.34 3.04L16.08 24Z" fill="#5E8E3E" />
                    <path d="M11.74 8.12L11.12 10.5C11.12 10.5 10.42 10.18 9.58 10.22C8.36 10.3 8.34 11.06 8.36 11.26C8.42 12.16 11.2 12.42 11.38 14.82C11.52 16.72 10.38 17.98 8.72 18.1C6.74 18.24 5.66 17.06 5.66 17.06L6.1 15.22C6.1 15.22 7.18 16.06 8.04 16C8.6 15.96 8.82 15.52 8.8 15.2C8.72 14.06 6.44 14.14 6.28 11.96C6.14 10.14 7.32 8.28 9.9 8.12C10.86 8.06 11.36 8.3 11.36 8.3" fill="white" />
                </svg>
            );
        case "wordpress":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#21759b" />
                    <path d="M3.5 12C3.5 12 7.2 21.3 7.5 22C7.5 22 4.2 19.8 3.5 12Z" fill="white" fillOpacity="0.6" />
                    <path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 14.1 3.2 16 4.4 17.5L8.8 5.8C8.8 5.8 9 5.2 9.5 5.2C10 5.2 10 5.7 10 5.7L10.5 7.5L12 2.5Z" fill="white" fillOpacity="0.9" />
                    <path d="M19.5 11C19.5 9.5 19 8.5 18.5 7.8C18 7 17.3 6.5 17.3 5.8C17.3 5 18 4.3 18.9 4.3C19 4.3 19.1 4.3 19.2 4.3C17.4 2.7 15 1.7 12.3 1.7L14.5 7.7L17 14.5L19.5 11Z" fill="white" fillOpacity="0.9" />
                    <path d="M12 22.3C13.3 22.3 14.5 22 15.6 21.5L12.5 12.5L9.8 20.5C10.5 20.7 11.2 21 12 21C12 21.5 12 22.3 12 22.3Z" fill="white" fillOpacity="0.9" />
                    <text x="8" y="16" fill="white" fontSize="8" fontWeight="bold" fontFamily="serif">W</text>
                </svg>
            );
        case "magento":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V17L5.5 18.5V8.5L12 4.75L18.5 8.5V18.5L21 17V7L12 2Z" fill="#f26322" />
                    <path d="M12 10.25L9.5 11.75V20L12 21.5L14.5 20V11.75L12 10.25Z" fill="#f26322" />
                </svg>
            );
        case "opencart":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#23a1d1" />
                    <circle cx="12" cy="12" r="6" fill="white" />
                    <circle cx="12" cy="12" r="3" fill="#23a1d1" />
                    <rect x="11" y="2" width="2" height="4" rx="1" fill="white" />
                </svg>
            );
        default:
            return <Code2 className="w-7 h-7 text-slate-400" />;
    }
};

const plugins = [
    {
        id: "woocommerce",
        name: "WooCommerce",
        subtitle: "WordPress Plugin",
        description: "Accept cryptocurrency payments on your WooCommerce store. Seamless checkout integration with automatic order status updates.",
        logo: "/plugins/woocommerce.svg",
        logoFallback: "🛒",
        color: "#96588a",
        colorLight: "rgba(150, 88, 138, 0.1)",
        version: "1.0.0",
        status: "stable",
        downloads: "2.4K+",
        rating: 4.8,
        features: [
            "One-click installation via WordPress Admin",
            "Automatic payment status sync",
            "Multi-currency support (100+ cryptos)",
            "Customizable checkout experience",
            "IPN webhook auto-configuration",
            "WooCommerce Subscriptions compatible"
        ],
        requirements: [
            "WordPress 5.0+",
            "WooCommerce 5.0+",
            "PHP 7.4+",
            "SSL Certificate (HTTPS)"
        ],
        installSteps: [
            { title: "Download Plugin", desc: "Download the .zip file from below or install directly from your WordPress admin." },
            { title: "Install & Activate", desc: "Go to Plugins → Add New → Upload Plugin, then select the .zip file and click Install." },
            { title: "Configure API Key", desc: "Navigate to WooCommerce → Settings → Payments → Soltio, and enter your API Key." },
            { title: "Enable & Test", desc: "Enable the payment method with a test mode key first, then switch to live when ready." }
        ],
        downloadUrl: "/api/plugins/download/woocommerce",
        downloadable: true,
        docsUrl: "/api-docs#webhooks"
    },
    {
        id: "shopify",
        name: "Shopify",
        subtitle: "Shopify App",
        description: "Add crypto payments to your Shopify store in minutes. No coding required. Works with all Shopify themes.",
        logo: "/plugins/shopify.svg",
        logoFallback: "🏪",
        color: "#95bf47",
        colorLight: "rgba(149, 191, 71, 0.1)",
        version: "1.0.0",
        status: "stable",
        downloads: "1.8K+",
        rating: 4.9,
        features: [
            "Native Shopify checkout integration",
            "Automatic order fulfillment on payment",
            "Real-time exchange rate conversion",
            "Discount code compatibility",
            "Multi-language support",
            "Shopify Plus compatible"
        ],
        requirements: [
            "Shopify Basic plan or higher",
            "Soltio merchant account",
            "Custom payment app approval"
        ],
        installSteps: [
            { title: "Install from Shopify App Store", desc: "Click 'Add app' from the Shopify App Store or install manually." },
            { title: "Connect Your Account", desc: "Log in with your Soltio merchant credentials to link your store." },
            { title: "Configure Settings", desc: "Choose supported currencies and customize the checkout appearance." },
            { title: "Go Live", desc: "Toggle from Test to Live mode in your Soltio dashboard." }
        ],
        downloadUrl: "/api/plugins/download/shopify",
        downloadable: true,
        docsUrl: "/api-docs"
    },
    {
        id: "wordpress",
        name: "WordPress",
        subtitle: "Standalone Plugin",
        description: "A lightweight WordPress plugin for accepting crypto donations and payments on any WordPress site — no WooCommerce needed.",
        logo: "/plugins/wordpress.svg",
        logoFallback: "📝",
        color: "#21759b",
        colorLight: "rgba(33, 117, 155, 0.1)",
        version: "1.0.0",
        status: "stable",
        downloads: "980+",
        rating: 4.7,
        features: [
            "Payment button shortcode [soltio_pay]",
            "Donation widget for sidebars",
            "Gutenberg block support",
            "Customizable button styles",
            "Transaction history in WP Admin",
            "Multi-site compatible"
        ],
        requirements: [
            "WordPress 5.0+",
            "PHP 7.4+",
            "SSL Certificate (HTTPS)"
        ],
        installSteps: [
            { title: "Download Plugin", desc: "Download the .zip file and upload via WordPress Admin → Plugins → Add New." },
            { title: "Activate Plugin", desc: "Click 'Activate' after installation completes." },
            { title: "Enter API Key", desc: "Go to Settings → Soltio Payments and enter your API key." },
            { title: "Add Payment Button", desc: "Use [soltio_pay amount=\"50\" currency=\"USD\"] shortcode or the Gutenberg block." }
        ],
        downloadUrl: "/api/plugins/download/wordpress",
        downloadable: true,
        docsUrl: "/api-docs"
    },
    {
        id: "magento",
        name: "Magento 2",
        subtitle: "Magento Extension",
        description: "Enterprise-grade crypto payment extension for Magento 2. Built for high-volume stores with advanced order management.",
        logo: "/plugins/magento.svg",
        logoFallback: "🔶",
        color: "#f26322",
        colorLight: "rgba(242, 99, 34, 0.1)",
        version: "1.0.0",
        status: "stable",
        downloads: "420+",
        rating: 4.5,
        features: [
            "Native Magento 2 payment method",
            "Admin panel configuration",
            "Multi-store support",
            "Order status auto-update via IPN",
            "Configurable minimum order amount",
            "B2B module compatible"
        ],
        requirements: [
            "Magento 2.3+",
            "PHP 7.4+",
            "Composer"
        ],
        installSteps: [
            { title: "Install via Composer", desc: "Run: composer require soltio/magento2-payment" },
            { title: "Enable Module", desc: "Run: bin/magento module:enable Soltio_Payment" },
            { title: "Run Setup", desc: "Run: bin/magento setup:upgrade && bin/magento cache:flush" },
            { title: "Configure in Admin", desc: "Go to Stores → Configuration → Sales → Payment Methods → Soltio." }
        ],
        downloadUrl: "/api/plugins/download/magento",
        downloadable: true,
        docsUrl: "/api-docs"
    },
    {
        id: "opencart",
        name: "OpenCart",
        subtitle: "OpenCart Extension",
        description: "Simple and reliable crypto payment extension for OpenCart stores. Easy installation with full admin control.",
        logo: "/plugins/opencart.svg",
        logoFallback: "🛍️",
        color: "#23a1d1",
        colorLight: "rgba(35, 161, 209, 0.1)",
        version: "1.0.0",
        status: "stable",
        downloads: "310+",
        rating: 4.4,
        features: [
            "OpenCart 3.x and 4.x compatible",
            "OCMOD installation (no core file changes)",
            "Multi-language admin panel",
            "Automatic IPN handling",
            "Geo zone restrictions",
            "Order history integration"
        ],
        requirements: [
            "OpenCart 3.0+ or 4.0+",
            "PHP 7.4+",
            "SSL Certificate (HTTPS)"
        ],
        installSteps: [
            { title: "Download Extension", desc: "Download the .ocmod.zip file from below." },
            { title: "Upload via Admin", desc: "Go to Extensions → Installer and upload the .ocmod.zip file." },
            { title: "Install Payment Method", desc: "Go to Extensions → Payments → Soltio and click Install." },
            { title: "Configure & Enable", desc: "Enter your API key, set status to Enabled, and choose your geo zone." }
        ],
        downloadUrl: "/api/plugins/download/opencart",
        downloadable: true,
        docsUrl: "/api-docs"
    }
];

export default function IntegrationsPage() {
    const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const activePlugin = plugins.find(p => p.id === selectedPlugin);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-600/8 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-purple-600/8 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group no-underline">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">Soltio</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-1 text-sm">
                            <Link href="/api-docs" className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all no-underline">Docs</Link>
                            <span className="text-indigo-400 px-3 py-1.5 rounded-lg bg-indigo-500/10 font-semibold no-underline">Integrations</span>
                            <Link href="/dashboard" className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all no-underline">Dashboard</Link>
                        </nav>
                    </div>
                    <Link href="/dashboard/api-keys" className="no-underline">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all border-none cursor-pointer">
                            Get API Keys
                        </button>
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Hero */}
                <div className="pt-20 pb-16 text-center">
                    <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Puzzle className="w-4 h-4" />
                        Official Plugins & Extensions
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Plug & Play<br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Integrations</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Accept crypto payments on any platform. Install our official plugins in minutes — no coding required for most platforms.
                    </p>
                </div>

                {/* Plugin Grid */}
                <AnimatePresence mode="wait">
                    {!selectedPlugin ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32"
                        >
                            {plugins.map((plugin, i) => (
                                <motion.div
                                    key={plugin.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    onClick={() => setSelectedPlugin(plugin.id)}
                                    className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    {/* Glow effect */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                                        style={{ background: `radial-gradient(circle at 50% 0%, ${plugin.color}15, transparent 70%)` }}
                                    />

                                    <div className="relative z-10">
                                        {/* Logo & Status */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                                                style={{ background: plugin.colorLight, borderColor: `${plugin.color}30` }}
                                            >
                                                <PlatformIcon id={plugin.id} size={28} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {plugin.status === "stable" ? (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                        Stable
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                                        Beta
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-xl font-bold text-white mb-1">{plugin.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium mb-4">{plugin.subtitle}</p>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2">{plugin.description}</p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Download className="w-3 h-3" />
                                                {plugin.downloads}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                {plugin.rating}
                                            </span>
                                            <span className="font-mono">v{plugin.version}</span>
                                        </div>

                                        {/* CTA */}
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                                                View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                            {plugin.downloadable ? (
                                                <a
                                                    href={plugin.downloadUrl}
                                                    download
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white no-underline transition-all hover:opacity-80"
                                                    style={{ background: plugin.color }}
                                                >
                                                    <Download className="w-3 h-3" />
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 bg-white/5 border border-white/5">
                                                    <Clock className="w-3 h-3" />
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Custom Integration Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: plugins.length * 0.08 }}
                                className="p-8 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Code2 className="w-7 h-7 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Custom Integration</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Build your own integration using our REST API. Full documentation available.
                                </p>
                                <Link href="/api-docs" className="text-indigo-400 text-sm font-semibold flex items-center gap-2 no-underline hover:gap-3 transition-all">
                                    View API Docs <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : activePlugin && (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pb-32"
                        >
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedPlugin(null)}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to all integrations
                            </button>

                            {/* Plugin Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div className="flex items-center gap-6">
                                    <div
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center border-2"
                                        style={{ background: activePlugin.colorLight, borderColor: `${activePlugin.color}40` }}
                                    >
                                        <PlatformIcon id={activePlugin.id} size={40} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-3xl font-extrabold text-white">{activePlugin.name}</h1>
                                            {activePlugin.status === "stable" ? (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                    Stable
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                                    Beta
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400">{activePlugin.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-shrink-0">
                                    <Link href={activePlugin.docsUrl} className="no-underline">
                                        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer">
                                            <BookOpen className="w-4 h-4" />
                                            Documentation
                                        </button>
                                    </Link>
                                    {activePlugin.downloadable ? (
                                        <a href={activePlugin.downloadUrl} download className="no-underline">
                                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all cursor-pointer border-none hover:opacity-90" style={{ background: activePlugin.color }}>
                                                <Download className="w-4 h-4" />
                                                Download v{activePlugin.version}
                                            </button>
                                        </a>
                                    ) : (
                                        <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 text-sm font-bold transition-all cursor-not-allowed border-none bg-white/10">
                                            <Clock className="w-4 h-4" />
                                            Coming Soon
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Install Steps & Features */}
                                <div className="lg:col-span-2 space-y-10">
                                    {/* Installation Guide */}
                                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                            <Package className="w-5 h-5 text-indigo-400" />
                                            Installation Guide
                                        </h3>
                                        <div className="space-y-8">
                                            {activePlugin.installSteps.map((step, i) => (
                                                <div key={i} className="flex gap-6">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border border-white/10 bg-white/5 text-indigo-400">
                                                            {String(i + 1).padStart(2, "0")}
                                                        </div>
                                                        {i < activePlugin.installSteps.length - 1 && (
                                                            <div className="w-px h-8 bg-white/10 mx-auto mt-2" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold mb-1">{step.title}</h4>
                                                        <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-indigo-400" />
                                            Features
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activePlugin.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-slate-400">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Quick Info */}
                                    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                                        <h4 className="text-sm font-bold text-white mb-4">Plugin Info</h4>
                                        <div className="space-y-4 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Version</span>
                                                <span className="text-white font-mono">v{activePlugin.version}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Downloads</span>
                                                <span className="text-white">{activePlugin.downloads}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Rating</span>
                                                <span className="text-white flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    {activePlugin.rating}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">License</span>
                                                <span className="text-white">MIT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                                        <h4 className="text-sm font-bold text-white mb-4">Requirements</h4>
                                        <ul className="space-y-3 list-none p-0">
                                            {activePlugin.requirements.map((req, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Support */}
                                    <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/15">
                                        <h4 className="text-sm font-bold text-indigo-400 mb-2">Need Help?</h4>
                                        <p className="text-xs text-slate-500 mb-4">Our team is available 24/7 to help you integrate.</p>
                                        <a href="mailto:support@soltio.com" className="text-sm text-indigo-400 font-semibold flex items-center gap-2 no-underline hover:gap-3 transition-all">
                                            Contact Support <ArrowRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
