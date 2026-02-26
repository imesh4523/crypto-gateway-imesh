"use client"

import { useState } from "react"
import { PackageOpen, ExternalLink } from "lucide-react"

export function BotOrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [orders] = useState(initialOrders)

    return (
        <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/10 rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            {/* Header Actions */}
            <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                    <p className="text-sm text-slate-500">Completed purchases from your Telegram users.</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold tracking-tight">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Credential Delivered</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <PackageOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        <p className="font-medium text-base">No orders have been made yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {order.customer ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-slate-500 overflow-hidden">
                                                    {order.customer.firstName?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white">{order.customer.firstName}</span>
                                                    <span className="text-xs text-slate-500 font-medium">@{order.customer.username || order.customer.telegramId}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 font-medium">Unknown User</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-base">
                                        {order.product?.name || <span className="text-slate-400">Deleted Product</span>}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                        ${order.product?.price || 0}
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px] truncate">
                                        {order.credential ? (
                                            <code className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded font-mono text-xs">
                                                {order.credential.content}
                                            </code>
                                        ) : (
                                            <span className="text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded">Missing Credential</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
