"use client";

import { useState } from "react";
import { Copy, Search, Server, Layers, Trash2, Edit2, Loader2, ChevronLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    type: string;
}

interface Credential {
    id: string;
    productId: string;
    content: string;
    status: string;
    product: Product;
}

export default function InventoryClient({ initialCredentials, products }: { initialCredentials: Credential[], products: Product[] }) {
    const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("all");

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ productId: "", content: "" });
    const [adding, setAdding] = useState(false);

    // Edit Modal State
    const [editingCred, setEditingCred] = useState<Credential | null>(null);
    const [editForm, setEditForm] = useState({ content: "", status: "", productId: "" });
    const [editing, setEditing] = useState(false);

    const filtered = credentials.filter(c => {
        const matchesSearch = c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProduct = selectedProduct === "all" || c.productId === selectedProduct;
        return matchesSearch && matchesProduct;
    });

    const handleAdd = async () => {
        if (!addForm.productId || !addForm.content.trim()) return alert("Product and Content are required");
        setAdding(true);
        try {
            const lines = addForm.content.split("\n").filter(l => l.trim().length > 0);
            const res = await fetch("/api/bot/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: addForm.productId, lines })
            });
            if (res.ok) {
                // To keep client state simple, we reload window
                window.location.reload();
            } else {
                alert("Failed to add");
            }
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = async () => {
        if (!editingCred) return;
        setEditing(true);
        try {
            const res = await fetch("/api/bot/credentials", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingCred.id, ...editForm })
            });
            if (res.ok) {
                window.location.reload();
            } else {
                alert("Failed to update");
            }
        } finally {
            setEditing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/bot" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Inventory</h1>
                    <p className="text-sm text-slate-500">Manage account stock across all your bot products</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search stock by content or product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                </div>
                <select
                    className="w-full md:w-64 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                >
                    <option value="all">All Products</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
                >
                    <Plus className="w-4 h-4" /> Add Credentials
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Credential Detail</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No stock found in inventory.</td>
                            </tr>
                        ) : (
                            filtered.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{c.product?.name || "Unknown"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 max-w-[250px] truncate block opacity-50 group-hover:opacity-100 transition-opacity">
                                            {c.content}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${c.status === "available" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCred(c);
                                                    setEditForm({ content: c.content, status: c.status, productId: c.productId });
                                                }}
                                                className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Delete this credential?")) {
                                                        await fetch(`/api/bot/credentials?id=${c.id}`, { method: "DELETE" });
                                                        setCredentials(credentials.filter(cc => cc.id !== c.id));
                                                    }
                                                }}
                                                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Credentials</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</label>
                                <select
                                    value={addForm.productId}
                                    onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select a product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Details (one per line)</label>
                                <textarea
                                    value={addForm.content}
                                    onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                                    rows={4}
                                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="user:pass&#10;user2:pass2"
                                />
                            </div>
                        </div>
                        <button onClick={handleAdd} disabled={adding} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex justify-center items-center gap-2">
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingCred && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Credential</h2>
                            <button onClick={() => setEditingCred(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</label>
                                <select
                                    value={editForm.productId}
                                    onChange={(e) => setEditForm({ ...editForm, productId: e.target.value })}
                                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Detail</label>
                                <textarea
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    rows={3}
                                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleEdit} disabled={editing} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex justify-center items-center gap-2">
                            {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
