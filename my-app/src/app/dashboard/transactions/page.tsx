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
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
                        Transactions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">View and manage all your incoming gateway payments.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-md"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors shadow-sm"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[24px] shadow-sm p-5 flex flex-col justify-center transition-transform hover:-translate-y-1 group">
                    <p className="text-[12px] font-bold text-slate-700/80 dark:text-slate-400 mb-1">Total Volume Loaded</p>
                    <p className="text-3xl font-black text-[#1a1f36] dark:text-white tracking-tight">${stats.totalVol.toFixed(2)}</p>
                </Card>
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[24px] shadow-sm p-5 flex flex-col justify-center transition-transform hover:-translate-y-1 group">
                    <p className="text-[12px] font-bold text-slate-700/80 dark:text-slate-400 mb-1">Success Rate (Loaded)</p>
                    <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight">
                        {transactions.length > 0 ? ((stats.successCount / transactions.length) * 100).toFixed(1) : 0}%
                    </p>
                </Card>
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[24px] shadow-sm p-5 flex flex-col justify-center transition-transform hover:-translate-y-1 group">
                    <p className="text-[12px] font-bold text-slate-700/80 dark:text-slate-400 mb-1">Pending Value Loaded</p>
                    <p className="text-3xl font-black text-amber-500 dark:text-amber-400 tracking-tight">${stats.pendingVal.toFixed(2)}</p>
                </Card>
                <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[24px] shadow-sm p-5 flex flex-col justify-center transition-transform hover:-translate-y-1 group">
                    <p className="text-[12px] font-bold text-slate-700/80 dark:text-slate-400 mb-1">Total Transactions</p>
                    <p className="text-3xl font-black text-[#1a1f36] dark:text-white tracking-tight">{stats.total}</p>
                </Card>
            </div>

            {/* Table Area */}
            <Card className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/40 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Platform TxID or Provider"
                            className="block w-full pl-10 pr-3 py-2 border border-white/50 dark:border-white/10 rounded-xl leading-5 bg-white/50 dark:bg-black/20 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors shadow-inner"
                        />
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors border border-white/50 dark:border-white/5 shadow-sm">
                            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            Status: All
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors border border-white/50 dark:border-white/5 shadow-sm">
                            Currency: All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="text-[13px] text-slate-500 dark:text-slate-400 font-bold bg-white/40 dark:bg-transparent border-b border-white/40 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">Payment ID</th>
                                <th className="px-6 py-4 text-left font-bold">Order ID</th>
                                <th className="px-6 py-4 text-left font-bold">Original price</th>
                                <th className="px-6 py-4 text-left font-bold">Amount sent / received</th>
                                <th className="px-6 py-4 text-left font-bold">Status</th>
                                <th className="px-6 py-4 text-left font-bold">Created / Last update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/[0.03]">
                            {fetchingData ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                                        <p className="font-bold">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50 dark:border-white/10 shadow-sm">
                                            <Wallet className="w-8 h-8 text-slate-400 dark:text-slate-400" />
                                        </div>
                                        <p className="font-black text-slate-800 dark:text-slate-300">No transactions found</p>
                                        <p className="text-sm mt-1 text-slate-500 font-medium">Generate an invoice to see it here!</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="group hover:bg-white/60 dark:hover:bg-white/[0.02] transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={tx.providerTxId || "Pending"}>
                                                {tx.providerTxId || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300" title={tx.id}>
                                                {tx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-black text-slate-800 dark:text-slate-300">
                                                {tx.amount} {tx.currency === 'USD' ? 'USD' : (tx.currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-800 dark:text-slate-300">
                                                <span className="font-black">{tx.payAmount || tx.amount} {tx.payCurrency || tx.currency}</span>
                                                <span className="text-slate-500 font-medium">{tx.status === 'SUCCESS' ? (tx.payAmount || tx.amount) : '0'} {tx.payCurrency || tx.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
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
                <div className="p-4 border-t border-white/40 dark:border-white/10 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-black/20 backdrop-blur-md">
                    <div className="font-medium">Showing real transactions <span className="text-slate-900 dark:text-white font-bold ml-1">Page {page} of {totalPages}</span></div>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 disabled:opacity-50 transition-colors shadow-sm font-medium">Previous</button>
                        <span className="px-3 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm">{page}</span>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-colors disabled:opacity-50 shadow-sm font-medium">Next</button>
                    </div>
                </div>
            </Card>

            {/* Create Invoice Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-white/90 dark:bg-[#0f111a] backdrop-blur-xl border-white/50 dark:border-white/5 text-slate-900 dark:text-white p-6 shadow-2xl rounded-2xl sm:max-w-[420px]">
                    <DialogHeader className="mb-1">
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                            {creationResult ? "Invoice Created! 🎉" : "Create Manual Invoice"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                            {creationResult
                                ? "Your payment link is ready. You can share this with your customer."
                                : "Generate a new crypto payment request manually from your dashboard."}
                        </DialogDescription>
                    </DialogHeader>

                    {creationResult ? (
                        <div className="space-y-5 my-4">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl text-center shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider font-bold">Payment URL</p>
                                <div className="bg-white/60 dark:bg-black/60 border border-slate-200 dark:border-white/5 p-3 rounded-xl mb-5 break-all font-mono text-sm text-indigo-600 dark:text-indigo-300">
                                    {creationResult.paymentUrl}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleCopy(creationResult.paymentUrl, 'result-url')}
                                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 h-11 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 text-white"
                                    >
                                        {copiedId === 'result-url' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copiedId === 'result-url' ? 'Copied' : 'Copy Link'}
                                    </Button>
                                    <Button
                                        onClick={() => window.open(creationResult.paymentUrl, '_blank')}
                                        variant="outline"
                                        className="flex-1 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-slate-900 dark:text-white h-11 text-sm rounded-xl font-bold transition-colors"
                                    >
                                        <ArrowUpRight className="w-4 h-4 mr-2" />
                                        Open Link
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                                    <p className="text-[11px] text-slate-500 mb-1 font-bold uppercase tracking-[0.1em]">Platform ID</p>
                                    <p className="font-mono text-xs text-indigo-600 dark:text-indigo-200">{creationResult.platformTxId}</p>
                                </div>
                                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                                    <p className="text-[11px] text-slate-500 mb-1 font-bold uppercase tracking-[0.1em]">Amount</p>
                                    <p className="font-black text-lg text-slate-900 dark:text-white">{creationResult.amount} {creationResult.currency}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 my-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="100.00"
                                            className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-900 dark:text-white pl-10 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-base font-bold shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="w-full sm:w-[130px] space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Currency</label>
                                    <div className="relative group">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-slate-900 dark:text-white h-11 appearance-none text-base font-bold focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none cursor-pointer shadow-inner"
                                        >
                                            <option value="USD" className="bg-white dark:bg-slate-900">USD</option>
                                            <option value="EUR" className="bg-white dark:bg-slate-900">EUR</option>
                                            <option value="GBP" className="bg-white dark:bg-slate-900">GBP</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Order Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. VIP Membership Upgrade"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-xl p-3 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none resize-none h-24 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-bold shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-5 border-t border-slate-100 dark:border-white/5 pt-5 sm:justify-start">
                        {creationResult ? (
                            <Button
                                onClick={resetModal}
                                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white h-11 rounded-xl font-black text-base"
                            >
                                Done
                            </Button>
                        ) : (
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 h-11 rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateInvoice}
                                    disabled={loading || !amount}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white h-11 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none text-sm"
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
                <DialogContent className="bg-white/95 dark:bg-slate-900 backdrop-blur-xl border-white/50 dark:border-white/10 text-slate-900 dark:text-white p-0 shadow-2xl rounded-2xl w-[90vw] sm:max-w-lg overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-white/5">
                        <DialogTitle className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                            Payment Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="p-0 overflow-y-auto max-h-[60vh]">
                            <div className="flex flex-col text-[13px] font-medium">
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Payment ID</div>
                                    <div className="col-span-8 font-mono text-slate-700 dark:text-slate-200 break-all">{selectedTx.providerTxId || "Pending"}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Order id</div>
                                    <div className="col-span-8 font-mono text-slate-700 dark:text-slate-200 break-all">{selectedTx.id}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Original price</div>
                                    <div className="col-span-8 font-black text-slate-900 dark:text-slate-200">{selectedTx.amount} {selectedTx.currency === 'USD' ? 'USD' : (selectedTx.currency || 'USD')}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Pay price</div>
                                    <div className="col-span-8 flex items-center gap-1.5">
                                        <span className="font-black text-slate-900 dark:text-slate-200">{selectedTx.payAmount || selectedTx.amount} {selectedTx.payCurrency || selectedTx.currency}</span>
                                        <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-1.5 py-0.5 rounded font-black uppercase border border-amber-500/20">{selectedTx.payCurrency || selectedTx.currency}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Actually paid</div>
                                    <div className="col-span-8 font-black text-slate-900 dark:text-slate-200">
                                        {selectedTx.status === 'SUCCESS' ? (selectedTx.payAmount || selectedTx.amount) : '0'} {selectedTx.payCurrency || selectedTx.currency}
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Outcome price</div>
                                    <div className="col-span-8 font-medium text-slate-400">N/A</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Type</div>
                                    <div className="col-span-8 text-slate-700 dark:text-slate-200">crypto2crypto</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Status</div>
                                    <div className="col-span-8 font-bold">
                                        {getStatusBadge(selectedTx.status)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Created at</div>
                                    <div className="col-span-8 text-slate-600 dark:text-slate-300">{new Date(selectedTx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Updated at</div>
                                    <div className="col-span-8 text-slate-600 dark:text-slate-300">{new Date(selectedTx.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Payin address</div>
                                    <div className="col-span-8">
                                        <span className="font-bold text-slate-700 dark:text-slate-200 break-all">{selectedTx.payAddress || "Not Available"}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors items-center">
                                    <div className="col-span-4 text-slate-500">Payout address</div>
                                    <div className="col-span-8 text-slate-700 dark:text-slate-200 font-bold">Balance</div>
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
