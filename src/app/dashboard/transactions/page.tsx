"use client";

import { Card } from "@/components/ui/card";
import { Search, Filter, ArrowDownToLine, CheckCircle2, Clock, XCircle, ArrowUpRight, Wallet, Copy, Check, Loader2, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TransactionsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [description, setDescription] = useState("");

    // Result State
    const [creationResult, setCreationResult] = useState<any>(null);

    const mockTransactions = [
        { id: "platform_189201a", providerTx: "now_482910a", date: "2026-02-24 10:23:45 AM", amount: "500.00", currency: "USDT", fee: "15.00", net: "485.00", payAddress: "TJYs7eXfM3R4kP8n9k2xPz", status: "SUCCESS" },
        { id: "platform_189201b", providerTx: "now_482910b", date: "2026-02-24 09:12:10 AM", amount: "150.00", currency: "USDT", fee: "4.50", net: "145.50", payAddress: "TWd8mLp6qR7vN5hN3vK", status: "SUCCESS" },
        { id: "platform_189201c", providerTx: "now_482910c", date: "2026-02-23 04:45:00 PM", amount: "3200.00", currency: "USDC", fee: "96.00", net: "3104.00", payAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3E", status: "PENDING" },
        { id: "platform_189201d", providerTx: "now_482910d", date: "2026-02-23 11:20:15 AM", amount: "45.00", currency: "BTC", fee: "1.35", net: "43.65", payAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", status: "SUCCESS" },
        { id: "platform_189201e", providerTx: "-", date: "2026-02-22 08:30:00 PM", amount: "100.00", currency: "LTC", fee: "3.00", net: "97.00", payAddress: "LKj8mHxVnT9oB4xPcS2aFqRdN7eW5YzJ", status: "EXPIRED" },
        { id: "platform_189201f", providerTx: "now_482910f", date: "2026-02-22 02:15:30 PM", amount: "750.00", currency: "USDT", fee: "22.50", net: "727.50", payAddress: "TNa3PqY8mLx2vR9sK4wJ", status: "FAILED" },
    ];

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreateInvoice = async () => {
        if (!amount) return;

        setLoading(true);
        try {
            const response = await fetch('/api/v1/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // No Authorization header needed, backend will use session
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    currency,
                    orderDescription: description
                })
            });

            const data = await response.json();
            if (response.ok) {
                setCreationResult(data.data);
            } else {
                alert(data.error || "Failed to create invoice");
            }
        } catch (error) {
            console.error("Create invoice error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["TxID Platform", "TxID Provider", "Date", "Amount", "Currency", "Fee", "Net", "Pay Address", "Status"];
        const rows = mockTransactions.map(tx => [
            tx.id,
            tx.providerTx,
            tx.date,
            tx.amount,
            tx.currency,
            tx.fee,
            tx.net,
            tx.payAddress,
            tx.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const truncateAddress = (address: string) => {
        if (!address) return "-";
        if (address.length <= 14) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Success
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </span>
                );
            case "EXPIRED":
            case "FAILED":
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3 mr-1" />
                        {status === "FAILED" ? "Failed" : "Expired"}
                    </span>
                );
            default:
                return null;
        }
    };

    const resetModal = () => {
        setIsCreateModalOpen(false);
        setCreationResult(null);
        setAmount("");
        setDescription("");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Transactions
                    </h1>
                    <p className="text-slate-400 mt-1">View and manage all your incoming gateway payments.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/10"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Today&apos;s Volume</p>
                    <p className="text-2xl font-bold text-white">$650.00</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-emerald-400">92.4%</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Pending Value</p>
                    <p className="text-2xl font-bold text-amber-400">$3,200.00</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">1,482</p>
                </Card>
            </div>

            {/* Table Area */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Platform TxID or Provider TxID"
                            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-black/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                        />
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 text-sm font-medium transition-colors border border-white/5">
                            <Filter className="w-4 h-4 text-slate-400" />
                            Status: All
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 text-sm font-medium transition-colors border border-white/5">
                            Currency: All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">TxID (Platform / Provider)</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Gross Amount</th>
                                <th className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-sky-400" />
                                        Pay Address
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium bg-red-500/5 text-red-200/50">Fee (3%)</th>
                                <th className="px-6 py-4 font-medium bg-emerald-500/5 text-emerald-200/50">Net Amount</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-slate-300 group-hover:text-indigo-300 transition-colors">
                                            {tx.id}
                                        </div>
                                        <div className="font-mono text-xs text-slate-500 mt-1">
                                            {tx.providerTx}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{tx.amount}</div>
                                        <div className="text-xs text-slate-500">{tx.currency}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 bg-sky-500/10 px-2 py-1 rounded-lg font-mono text-xs text-sky-300 border border-sky-500/20">
                                            <Wallet className="w-3 h-3 text-sky-400 flex-shrink-0" />
                                            {truncateAddress(tx.payAddress || "")}
                                            <button
                                                onClick={() => handleCopy(tx.payAddress || "", `pay_${tx.id}`)}
                                                className="hover:text-white transition-colors ml-1"
                                                title="Copy Pay Address"
                                            >
                                                {copiedId === `pay_${tx.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-500 bg-red-500/[0.02] border-l border-r border-white/5">
                                        -{tx.fee}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-400 bg-emerald-500/[0.02] border-r border-white/5">
                                        +{tx.net}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(tx.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 bg-black/20">
                    <div>Showing <span className="text-white">1</span> to <span className="text-white">6</span> of <span className="text-white">1,482</span> transactions</div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors" disabled>Previous</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">1</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors">2</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors">3</button>
                        <span className="px-2 py-1">...</span>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors">Next</button>
                    </div>
                </div>
            </Card>

            {/* Create Invoice Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white p-6 shadow-2xl rounded-2xl sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {creationResult ? "Invoice Created Successfully! 🚀" : "Create Manual Invoice"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {creationResult
                                ? "Your payment link is ready. You can share this with your customer."
                                : "Generate a new crypto payment request manually from your dashboard."}
                        </DialogDescription>
                    </DialogHeader>

                    {creationResult ? (
                        <div className="space-y-6 my-4">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-center">
                                <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-semibold">Payment URL</p>
                                <div className="bg-black/40 border border-white/10 p-4 rounded-xl mb-4 break-all font-mono text-sm text-indigo-300">
                                    {creationResult.paymentUrl}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleCopy(creationResult.paymentUrl, 'result-url')}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11"
                                    >
                                        {copiedId === 'result-url' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copiedId === 'result-url' ? 'Copied' : 'Copy Link'}
                                    </Button>
                                    <Button
                                        onClick={() => window.open(creationResult.paymentUrl, '_blank')}
                                        variant="outline"
                                        className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
                                    >
                                        <ArrowUpRight className="w-4 h-4 mr-2" />
                                        Open Link
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Platform ID</p>
                                    <p className="font-mono text-xs text-white">{creationResult.platformTxId}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Amount</p>
                                    <p className="font-bold text-white">{creationResult.amount} {creationResult.currency}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 my-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="100.00"
                                            className="bg-black/30 border-white/10 text-white pl-10 h-11"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-11 appearance-none"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Order Description (Optional)</label>
                                <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. VIP Membership Upgrade"
                                    className="bg-black/30 border-white/10 text-white h-11"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {creationResult ? (
                            <Button
                                onClick={resetModal}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white h-11"
                            >
                                Done
                            </Button>
                        ) : (
                            <div className="flex w-full gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5 h-11"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateInvoice}
                                    disabled={loading || !amount}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-11 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        "Generate Invoice"
                                    )}
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
