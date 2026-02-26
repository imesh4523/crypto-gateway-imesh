"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function BotDashboardUi() {
    // Mock data for the chart representing the bot sales
    const chartData = [
        { name: "Mon", total: 120 },
        { name: "Tue", total: 450 },
        { name: "Wed", total: 320 },
        { name: "Thu", total: 800 },
        { name: "Fri", total: 600 },
        { name: "Sat", total: 950 },
        { name: "Sun", total: 1100 },
    ];

    const recentOrders = [
        { id: "1", product: "Cloud Server 4vCPU", user: "@alex_dev", price: 15.00, date: "Today" },
        { id: "2", product: "VPN Subscription", user: "@crypto_king", price: 5.50, date: "Today" },
        { id: "3", product: "Cloud Server 2vCPU", user: "@maria_p", price: 8.00, date: "Yesterday" },
        { id: "4", product: "Dedicated IP", user: "@anon_123", price: 3.00, date: "Yesterday" },
    ];

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bot Analytics</h2>
                <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-full border border-indigo-500/20">
                    Live Data Sync
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Daily Revenue"
                    value="$154.50"
                    icon={TrendingUp}
                    description="Last 24 hours"
                />
                <StatsCard
                    title="Daily Sales"
                    value="24"
                    icon={ShoppingCart}
                    description="Items sold today"
                />
                <StatsCard
                    title="Total Revenue"
                    value="$8,450.00"
                    icon={DollarSign}
                    description="Total gross revenue"
                />
                <StatsCard
                    title="Total Sales"
                    value="1,245"
                    icon={Package}
                    description="Total successful orders"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4 bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-2 rounded-3xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Revenue Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'white'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#6366f1"
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="col-span-3 bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Purchases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                            <ShoppingCart className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                                                {order.product}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {order.user}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-500">
                                            ${order.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {order.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon: Icon,
    description
}: {
    title: string;
    value: string;
    icon: any;
    description: string;
}) {
    return (
        <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl shadow-xl border-0 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className="p-2 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-colors">
                    <Icon className="h-4 w-4 text-indigo-500 group-hover:text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
