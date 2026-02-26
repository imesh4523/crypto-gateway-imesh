"use client";

import { Card } from "@/components/ui/card";
import { Search, Filter, ArrowDownToLine, CheckCircle2, Clock, XCircle, ArrowUpRight, Wallet, Copy, Check, Loader2, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TransactionsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Details Modal State
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [showIpnMenu, setShowIpnMenu] = useState(false);

    // Data State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalVol: 0, pendingVal: 0, successCount: 0, total: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [fetchingData, setFetchingData] = useState(true);

    // Form State
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [description, setDescription] = useState("");

    // Result State
    const [creationResult, setCreationResult] = useState<any>(null);

    useEffect(() => {
        fetchTransactions(page);

        // Auto-refresh transaction statuses quietly without interrupting the UI (polling)
        const interval = setInterval(() => {
            fetchTransactions(page, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [page]);

    const fetchTransactions = async (pageNumber: number, silent: boolean = false) => {
        if (!silent) setFetchingData(true);
        try {
            const res = await fetch(`/api/v1/transactions?page=${pageNumber}&limit=10`);
            const data = await res.json();
            if (data.data) {
                setTransactions(data.data);
                setTotalPages(data.pagination.totalPages || 1);

                // Calculate quick stats from loaded data (ideally this should come from a stats endpoint)
                let vol = 0, pVal = 0, succ = 0;
                data.data.forEach((tx: any) => {
                    const amt = Number(tx.amount) || 0;
                    if (tx.status === 'SUCCESS' || tx.status === 'COMPLETED') { vol += amt; succ++; }
                    if (tx.status === 'PENDING') { pVal += amt; }
                });
                setStats({
                    totalVol: vol,
                    pendingVal: pVal,
                    successCount: succ,
                    total: data.pagination.total
                });

                // If a transaction is currently open in the details modal, update its status live too!
                if (selectedTx && !silent) {
                    const updatedSelectedTx = data.data.find((tx: any) => tx.id === selectedTx.id);
                    if (updatedSelectedTx && updatedSelectedTx.status !== selectedTx.status) {
                        setSelectedTx({ ...updatedSelectedTx });
                    }
                } else if (silent) {
                    // Quick state replacement hack to update modal state if it's open dynamically
                    setSelectedTx((currentSelected: any) => {
                        if (!currentSelected) return currentSelected;
                        const newlyFetchedData = data.data.find((tx: any) => tx.id === currentSelected.id);
                        if (newlyFetchedData && newlyFetchedData.status !== currentSelected.status) {
                            return newlyFetchedData;
                        }
                        // fallback for generic details updates like amount
                        if (newlyFetchedData) return newlyFetchedData;
                        return currentSelected;
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!silent) setFetchingData(false);
        }
    };

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
                fetchTransactions(1); // Refresh list
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
        const rows = transactions.map(tx => [
            tx.id,
            tx.providerId || "-",
            new Date(tx.createdAt).toLocaleString(),
            tx.amount,
            tx.currency,
            (Number(tx.amount) * 0.03).toFixed(2), // 3% fee
            (Number(tx.amount) * 0.97).toFixed(2),
            tx.payAddress || "-",
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
            case "COMPLETED":
            case "FINISHED":
                return (
                    <span className="text-[13px] font-medium text-emerald-500">
                        Finished
                    </span>
                );
            case "CONFIRMED":
                return (
                    <span className="text-[13px] font-medium text-emerald-500">
                        Confirmed
                    </span>
                );
            case "PENDING":
            case "WAITING":
                return (
                    <span className="text-[13px] font-medium text-amber-500">
                        Waiting
                    </span>
                );
            case "EXPIRED":
            case "FAILED":
                return (
                    <span className="text-[13px] font-medium text-rose-500">
                        {status === "FAILED" ? "Failed" : "Expired"}
                    </span>
                );
            default:
                return <span className="text-[13px] font-medium text-slate-400">{status}</span>;
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
                    <p className="text-sm text-slate-400 mb-1">Total Volume Loaded</p>
                    <p className="text-2xl font-bold text-white">${stats.totalVol.toFixed(2)}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Success Rate (Loaded)</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {transactions.length > 0 ? ((stats.successCount / transactions.length) * 100).toFixed(1) : 0}%
                    </p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Pending Value Loaded</p>
                    <p className="text-2xl font-bold text-amber-400">${stats.pendingVal.toFixed(2)}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
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
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-400 font-medium bg-transparent border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">Payment ID</th>
                                <th className="px-6 py-4 text-left font-medium">Order ID</th>
                                <th className="px-6 py-4 text-left font-medium">Original price</th>
                                <th className="px-6 py-4 text-left font-medium">Amount sent / received</th>
                                <th className="px-6 py-4 text-left font-medium">Status</th>
                                <th className="px-6 py-4 text-left font-medium">Created / Last update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {fetchingData ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                                        <p className="font-medium">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <Wallet className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-300">No transactions found</p>
                                        <p className="text-sm mt-1">Generate an invoice to see it here!</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="group hover:bg-white/[0.02] transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-300 group-hover:text-indigo-400 transition-colors" title={tx.providerTxId || "Pending"}>
                                                {tx.providerTxId || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-300" title={tx.id}>
                                                {tx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-slate-300">
                                                {tx.amount} {tx.currency === 'USD' ? 'USD' : (tx.currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-300">
                                                <span className="font-medium">{tx.payAmount || tx.amount} {tx.payCurrency || tx.currency}</span>
                                                <span className="text-slate-500">{tx.status === 'SUCCESS' ? (tx.payAmount || tx.amount) : '0'} {tx.payCurrency || tx.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-400">
                                                <span>{new Date(tx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                <span>{new Date(tx.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 bg-black/20">
                    <div>Showing real transactions <span className="text-white">Page {page} of {totalPages}</span></div>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors">Previous</button>
                        <span className="px-3 py-1 rounded border border-white/10 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">{page}</span>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50">Next</button>
                    </div>
                </div>
            </Card>

            {/* Create Invoice Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-[#0f111a] border-white/5 text-white p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl sm:max-w-[420px]">
                    <DialogHeader className="mb-1">
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {creationResult ? "Invoice Created! 🎉" : "Create Manual Invoice"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm mt-1">
                            {creationResult
                                ? "Your payment link is ready. You can share this with your customer."
                                : "Generate a new crypto payment request manually from your dashboard."}
                        </DialogDescription>
                    </DialogHeader>

                    {creationResult ? (
                        <div className="space-y-5 my-4">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl text-center shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Payment URL</p>
                                <div className="bg-black/60 border border-white/5 p-3 rounded-xl mb-5 break-all font-mono text-sm text-indigo-300">
                                    {creationResult.paymentUrl}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleCopy(creationResult.paymentUrl, 'result-url')}
                                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 h-11 rounded-xl text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                    >
                                        {copiedId === 'result-url' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copiedId === 'result-url' ? 'Copied' : 'Copy Link'}
                                    </Button>
                                    <Button
                                        onClick={() => window.open(creationResult.paymentUrl, '_blank')}
                                        variant="outline"
                                        className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white h-11 text-sm rounded-xl font-medium transition-colors"
                                    >
                                        <ArrowUpRight className="w-4 h-4 mr-2" />
                                        Open Link
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-[0.1em]">Platform ID</p>
                                    <p className="font-mono text-xs text-indigo-200">{creationResult.platformTxId}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-[0.1em]">Amount</p>
                                    <p className="font-bold text-base text-white">{creationResult.amount} {creationResult.currency}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 my-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Amount</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="100.00"
                                            className="bg-white/5 border-white/5 text-white pl-10 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-base font-medium shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="w-full sm:w-[130px] space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Currency</label>
                                    <div className="relative group">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-white h-11 appearance-none text-base font-medium focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none cursor-pointer shadow-inner"
                                        >
                                            <option value="USD" className="bg-slate-900">USD</option>
                                            <option value="EUR" className="bg-slate-900">EUR</option>
                                            <option value="GBP" className="bg-slate-900">GBP</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Order Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. VIP Membership Upgrade"
                                    className="w-full bg-white/5 border border-white/5 text-slate-200 rounded-xl p-3 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none resize-none h-24 placeholder:text-slate-600 text-sm font-medium shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-5 border-t border-white/5 pt-5 sm:justify-start">
                        {creationResult ? (
                            <Button
                                onClick={resetModal}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white h-11 rounded-xl font-bold text-base"
                            >
                                Done
                            </Button>
                        ) : (
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 border-white/5 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-11 rounded-xl font-semibold transition-all text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateInvoice}
                                    disabled={loading || !amount}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white h-11 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:shadow-none text-sm disabled:hover:shadow-none"
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

            {/* Transaction Details Modal */}
            <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white p-0 shadow-2xl rounded-2xl w-[90vw] sm:max-w-lg overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b border-white/5">
                        <DialogTitle className="text-xl font-bold flex items-center justify-between">
                            Payment Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="p-0 overflow-y-auto max-h-[60vh]">
                            <div className="flex flex-col text-[13px]">
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Payment ID</div>
                                    <div className="col-span-8 font-mono text-slate-200 break-all">{selectedTx.providerTxId || "Pending"}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Order id</div>
                                    <div className="col-span-8 font-mono text-slate-200 break-all">{selectedTx.id}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Original price</div>
                                    <div className="col-span-8 font-medium text-slate-200">{selectedTx.amount} {selectedTx.currency === 'USD' ? 'USD' : (selectedTx.currency || 'USD')}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Pay price</div>
                                    <div className="col-span-8 flex items-center gap-1.5">
                                        <span className="font-medium text-slate-200">{selectedTx.payAmount || selectedTx.amount} {selectedTx.payCurrency || selectedTx.currency}</span>
                                        <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1 rounded font-bold uppercase border border-amber-500/20">{selectedTx.payCurrency || selectedTx.currency}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Actually paid</div>
                                    <div className="col-span-8 font-medium text-slate-200">
                                        {selectedTx.status === 'SUCCESS' ? (selectedTx.payAmount || selectedTx.amount) : '0'} {selectedTx.payCurrency || selectedTx.currency}
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Outcome price</div>
                                    <div className="col-span-8 font-medium text-slate-300">N/A</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Type</div>
                                    <div className="col-span-8 text-slate-200">crypto2crypto</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Status</div>
                                    <div className="col-span-8">
                                        {getStatusBadge(selectedTx.status)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Created at</div>
                                    <div className="col-span-8 text-slate-300">{new Date(selectedTx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Updated at</div>
                                    <div className="col-span-8 text-slate-300">{new Date(selectedTx.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Payin address</div>
                                    <div className="col-span-8">
                                        <span className="font-bold text-slate-200 break-all">{selectedTx.payAddress || "Not Available"}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Payout address</div>
                                    <div className="col-span-8 text-slate-200">Balance</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Fixed rate</div>
                                    <div className="col-span-8 text-slate-200">False</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 hover:bg-white/[0.02] border-b border-[rgba(255,255,255,0.05)] transition-colors items-center">
                                    <div className="col-span-4 text-slate-400">Fee paid by user</div>
                                    <div className="col-span-8 text-slate-200">False</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-6 bg-transparent border-t-0 flex flex-col justify-end">
                        <div className="relative w-full">
                            {showIpnMenu && (
                                <div className="absolute bottom-full left-0 w-full flex flex-col overflow-hidden rounded-t-xl bg-slate-800 border-t border-l border-r border-[#3b82f6] shadow-[0_-10px_20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-2 fade-in">
                                    <button
                                        onClick={() => { setShowIpnMenu(false); }}
                                        className="w-full bg-transparent hover:bg-white/5 text-[#60a5fa] font-semibold py-4 transition-colors text-sm border-b border-white/10"
                                    >
                                        Send
                                    </button>
                                    <button
                                        onClick={() => { setShowIpnMenu(false); }}
                                        className="w-full bg-transparent hover:bg-white/5 text-[#fb7185] font-semibold py-4 transition-colors text-sm"
                                    >
                                        Disable
                                    </button>
                                </div>
                            )}
                            <Button
                                className={`w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${showIpnMenu ? 'rounded-b-xl rounded-t-none h-12 shadow-none' : 'rounded-xl h-12 shadow-lg shadow-blue-500/20'}`}
                                onClick={() => setShowIpnMenu(!showIpnMenu)}
                            >
                                IPN {showIpnMenu ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
