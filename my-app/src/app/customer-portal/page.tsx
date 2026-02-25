import Link from "next/link";
import { Search, History, Download, ArrowUpRight, ShieldCheck, Mail, Wallet, ExternalLink, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CustomerPortal() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Dynamic Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
            </div>

            {/* Modern Top Navigation */}
            <nav className="relative z-10 border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 4L14 13L9 8L1 16" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 4H23V10" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl text-white tracking-wide">Soltio<span className="text-slate-500 font-medium"> Pay</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Help Center</button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/10">
                            <div className="w-7 h-7 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                                J
                            </div>
                            <span className="text-sm font-medium text-slate-200">john@example.com</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

                {/* Hero Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Payments</h1>
                        <p className="text-slate-400 max-w-xl text-lg">
                            View and manage receipts for all your crypto transactions processed through Soltio Gateway.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by Transaction ID or Store..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:font-light"
                            />
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl p-6 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Transactions</p>
                                <h3 className="text-2xl font-bold text-white mt-0.5">14</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl p-6 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Spent Value (Est.)</p>
                                <h3 className="text-2xl font-bold text-white mt-0.5">$3,420.50</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center justify-between h-full">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                    Verified Account
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">Your email is verified for instant receipts.</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                <ArrowUpRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Transaction History */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        Recent Activity
                    </h2>

                    <div className="space-y-4">
                        {/* Transaction Item 1 */}
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors cursor-default group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        {/* Example Store Logo fallback */}
                                        <span className="font-bold text-xl text-slate-300">G</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Gaming Hub Store</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400 font-light">
                                            <span>Oct 24, 2026 • 14:30</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-slate-300">ID: TX-98234-A</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 pl-14 md:pl-0">
                                    <div className="text-left md:text-right">
                                        <h4 className="text-lg font-bold text-white">0.0245 BTC</h4>
                                        <p className="text-sm text-slate-400 mt-0.5">≈ $150.00</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <ShieldCheck className="w-3 h-3 mr-1" /> Paid
                                        </span>

                                        <div className="h-4 w-px bg-white/10 hidden md:block" />

                                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors tooltip" title="Download Receipt">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors tooltip" title="View on Blockchain Explorer">
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Item 2 */}
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors cursor-default group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <span className="font-bold text-xl text-slate-300">V</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">VPN Services Ltd.</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400 font-light">
                                            <span>Oct 15, 2026 • 09:15</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-slate-300">ID: TX-11092-B</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 pl-14 md:pl-0">
                                    <div className="text-left md:text-right">
                                        <h4 className="text-lg font-bold text-white">45.00 USDT</h4>
                                        <p className="text-sm text-slate-400 mt-0.5">TRC20 Network</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <ShieldCheck className="w-3 h-3 mr-1" /> Paid
                                        </span>

                                        <div className="h-4 w-px bg-white/10 hidden md:block" />

                                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Item 3 (Pending State) */}
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-colors cursor-default group relative overflow-hidden">
                            {/* Pending Strip */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5 pl-2">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <span className="font-bold text-xl text-slate-300">C</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Cloud Hosting Pro</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400 font-light">
                                            <span>Today • 16:35</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-slate-300">ID: TX-55412-C</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 pl-16 md:pl-0">
                                    <div className="text-left md:text-right">
                                        <h4 className="text-lg font-bold text-white">0.15 ETH</h4>
                                        <p className="text-sm text-slate-400 mt-0.5">≈ $320.00</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-1.5 animate-pulse" /> Pending
                                        </span>

                                        <div className="h-4 w-px bg-white/10 hidden md:block" />

                                        <div className="w-[84px]"> {/* Placeholder to keep alignment */}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 text-center">
                        <button className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 hover:text-white transition-colors">
                            Load More Transactions
                        </button>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">© 2026 Soltio Pay Gateway. All rights reserved.</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
