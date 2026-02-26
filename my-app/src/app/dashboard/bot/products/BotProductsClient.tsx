"use client";

import { useState, useEffect, useCallback } from "react";
import { PackagePlus, Save, Trash2, X, ChevronLeft, Loader2, Eye, EyeOff, Plus } from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string | null;
    type: string;
    price: number;
    status: string;
    credentials: { id: string; content: string; status: string }[];
}

interface Credential {
    id: string;
    content: string;
    status: string;
    productId: string;
}

export default function BotProductsClient({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showCredModal, setShowCredModal] = useState<Product | null>(null);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [credLines, setCredLines] = useState("");
    const [savingCreds, setSavingCreds] = useState(false);
    const [showCreds, setShowCreds] = useState(false);

    const [form, setForm] = useState({ name: "", type: "", price: "", description: "", status: "available" });

    const fetchProducts = useCallback(async () => {
        const res = await fetch("/api/bot/products");
        if (res.ok) setProducts(await res.json());
    }, []);

    const fetchCredentials = useCallback(async (productId: string) => {
        const res = await fetch(`/api/bot/credentials?productId=${productId}`);
        if (res.ok) setCredentials(await res.json());
    }, []);

    const handleAddProduct = async () => {
        if (!form.name || !form.type || !form.price) return alert("Name, Type, and Price are required.");
        setLoading(true);
        try {
            const res = await fetch("/api/bot/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setShowAddProduct(false);
                setForm({ name: "", type: "", price: "", description: "", status: "available" });
                await fetchProducts();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Delete this product and all its credentials?")) return;
        await fetch(`/api/bot/products?id=${id}`, { method: "DELETE" });
        await fetchProducts();
    };

    const handleToggleStatus = async (p: Product) => {
        const newStatus = p.status === "available" ? "unavailable" : "available";
        await fetch("/api/bot/products", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, status: newStatus }),
        });
        await fetchProducts();
    };

    const handleOpenCreds = async (p: Product) => {
        setShowCredModal(p);
        setCredLines("");
        await fetchCredentials(p.id);
    };

    const handleAddCredentials = async () => {
        if (!showCredModal || !credLines.trim()) return;
        setSavingCreds(true);
        try {
            const lines = credLines.split("\n").filter((l) => l.trim());
            const res = await fetch("/api/bot/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: showCredModal.id, lines }),
            });
            if (res.ok) {
                const data = await res.json();
                alert(`✅ Added ${data.created} credential(s)!`);
                setCredLines("");
                await fetchCredentials(showCredModal.id);
                await fetchProducts();
            }
        } finally {
            setSavingCreds(false);
        }
    };

    const handleDeleteCred = async (id: string) => {
        await fetch(`/api/bot/credentials?id=${id}`, { method: "DELETE" });
        if (showCredModal) await fetchCredentials(showCredModal.id);
        await fetchProducts();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/bot" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
                        <p className="text-sm text-slate-500">Manage your shop items and stock</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                        <PackagePlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 font-medium">No products yet. Click "Add Product" to get started.</p>
                    </div>
                ) : (
                    products.map((p) => {
                        const avail = p.credentials.filter((c) => c.status === "available").length;
                        const isActive = p.status === "available";
                        return (
                            <div key={p.id} className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{p.type}</span>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{p.name}</h3>
                                        {p.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                                        {isActive ? "Active" : "Paused"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                                    <div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">${Number(p.price).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{avail} in stock</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenCreds(p)}
                                            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Inventory
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(p)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isActive ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`}
                                        >
                                            {isActive ? "Pause" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h2>
                            <button onClick={() => setShowAddProduct(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. AWS 8 VCPU" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category / Type</label>
                                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. AWS, DigitalOcean, VPN" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (USD)</label>
                                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 3.00" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Short product description" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowAddProduct(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAddProduct} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inventory / Credentials Modal */}
            {showCredModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inventory</h2>
                                <p className="text-xs text-slate-500">{showCredModal.name} — {credentials.filter(c => c.status === "available").length} available</p>
                            </div>
                            <button onClick={() => setShowCredModal(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Add new credentials */}
                        <div className="space-y-2 shrink-0">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Credentials (one per line)</label>
                            <textarea
                                value={credLines}
                                onChange={(e) => setCredLines(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder={"user1:pass1:2fa\nuser2:pass2:2fa\n..."}
                            />
                            <button onClick={handleAddCredentials} disabled={savingCreds || !credLines.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                                {savingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add to Inventory
                            </button>
                        </div>

                        {/* Existing credentials list */}
                        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Existing Stock ({credentials.length})</span>
                                <button onClick={() => setShowCreds(!showCreds)} className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                    {showCreds ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showCreds ? "Hide" : "Show"}
                                </button>
                            </div>
                            {credentials.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-4">No credentials yet. Add some above.</p>
                            ) : (
                                credentials.map((c) => (
                                    <div key={c.id} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg ${c.status === "sold" ? "bg-slate-50 dark:bg-slate-800/30 opacity-50" : "bg-slate-50 dark:bg-slate-800"}`}>
                                        <code className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
                                            {showCreds ? c.content : "•".repeat(Math.min(c.content.length, 20))}
                                        </code>
                                        <span className={`text-xs font-bold shrink-0 ${c.status === "sold" ? "text-rose-400" : "text-emerald-500"}`}>
                                            {c.status}
                                        </span>
                                        {c.status === "available" && (
                                            <button onClick={() => handleDeleteCred(c.id)} className="shrink-0 p-1 hover:bg-rose-500/10 text-rose-400 rounded transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
