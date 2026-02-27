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
        { id: "1", product: "Chat GPT Plus", user: "@chatgpt_user", price: 19.99, date: "Today", bg: "bg-emerald-500", text: "text-white", iconText: "GPT" },
        { id: "2", product: "Claude & Gemini", user: "@ai_pro", price: 29.99, date: "Today", bg: "bg-orange-500/80", text: "text-white", iconText: "Ai" },
        { id: "3", product: "Cloud Server 4vCPU", user: "@maria_p", price: 59.99, date: "Yesterday", bg: "bg-blue-500", text: "text-white", iconText: "CS" },
        { id: "4", product: "Dedicated IP", user: "@anon_123", price: 3.00, date: "Yesterday", bg: "bg-indigo-500", text: "text-white", iconText: "IP" },
    ];

    return (
        <div className="mt-8 space-y-8">
            <div className="flex items-center gap-4 ml-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bot Analytics</h2>
                <div className="px-4 py-1.5 bg-white/40 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md">
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
                <Card className="col-span-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md p-2 rounded-[32px] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
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
                <Card className="col-span-3 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[32px] shadow-sm flex flex-col pt-2">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Purchases</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="space-y-5">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-11 w-11 rounded-[16px] ${order.bg} ${order.text} flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                            {order.iconText}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-black text-slate-900 dark:text-white leading-none">
                                                {order.product}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                {order.user}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[13px] font-black text-slate-900 dark:text-emerald-400">
                                            ${order.price.toFixed(2)}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">
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
        <Card className="bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform p-5 flex flex-col justify-between h-[150px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-[11px] font-extrabold text-slate-700/80 dark:text-slate-300 uppercase tracking-widest pl-1">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-900/5 dark:bg-white/10 group-hover:bg-slate-900/10 transition-colors shrink-0">
                    <Icon className="h-4 w-4 text-slate-800 dark:text-slate-200" strokeWidth={2.5} />
                </div>
            </CardHeader>
            <CardContent className="p-0 pl-1 mt-auto">
                <div className="text-[32px] font-black text-[#1a1f36] dark:text-white tracking-tight leading-none mb-2">{value}</div>
                <p className="text-[12px] text-slate-500 font-medium leading-none mb-0.5">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
