import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Bot, Save, Zap, HelpCircle, Package, Archive, RefreshCcw, CreditCard, Megaphone, Users, ArrowRight, Cpu, MousePointer2 } from "lucide-react";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import BotDashboardUi from "./BotDashboardUi";
import BotSettingsForm from "./BotSettingsForm";
import Link from "next/link";
import QuotaManager from "./QuotaManager";
import { decrypt } from "@/lib/encryption";

export default async function BotIntegrationPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/auth/signin");
    }

    const user: any = await prisma.user.findUnique({
        where: { email: session.user.email },
        // @ts-ignore
        include: { BotIntegration: true }
    });

    if (!user) return null;

    if (user.BotIntegration) {
        user.BotIntegration.telegramToken = decrypt(user.BotIntegration.telegramToken);
        user.BotIntegration.binanceApiKey = decrypt(user.BotIntegration.binanceApiKey);
        user.BotIntegration.binanceSecretKey = decrypt(user.BotIntegration.binanceSecretKey);
    }

    const userData = {
        id: user.id,
        plan: user.plan,
        trialActive: user.trialActive,
        botClicksQuota: user.botClicksQuota,
        botClicksUsed: user.botClicksUsed,
        hostingPowerLimit: user.hostingPowerLimit,
        productLimitQuota: user.productLimitQuota
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <AutoRefresh intervalMs={15000} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-slate-800 dark:text-slate-200 text-lg font-medium font-bold italic opacity-80">Connect your Cloud Shop Bot and manage limits.</p>
                <QuotaManager user={userData} />
            </div>

            {/* Telegram Admin App Sub-navigation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Link href="/dashboard/bot/products" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Products</span>
                    </Card>
                </Link>

                <Link href="/dashboard/bot/inventory" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Archive className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Inventory</span>
                    </Card>
                </Link>

                <Link href="/dashboard/bot/orders" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <RefreshCcw className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Orders</span>
                    </Card>
                </Link>

                <Link href="/dashboard/bot/payments" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Payments</span>
                    </Card>
                </Link>

                <Link href="/dashboard/bot/broadcast" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Broadcast</span>
                    </Card>
                </Link>

                <Link href="/dashboard/bot/users" className="group">
                    <Card className="p-4 bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/5 hover:bg-white/60 hover:dark:bg-white/20 backdrop-blur-md rounded-[32px] shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 h-28">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Users</span>
                    </Card>
                </Link>
            </div>

            {/* Telegram Admin Bot Dashboard Elements */}
            <BotDashboardUi />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Bot Setup Card */}
                    <BotSettingsForm initialData={user.BotIntegration} />
                </div>

                {/* Quotas & Limits Sidebar */}
                <div className="space-y-6">
                    <Card className="p-8 bg-slate-900 border-0 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        {/* decorative background element */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 opacity-20 blur-3xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500 opacity-10 blur-3xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-white font-black text-xl tracking-tight">Hosting Quotas</h3>
                            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{user.plan}</span>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <MousePointer2 className="w-4 h-4 text-indigo-400" />
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Bot Clicks</span>
                                    </div>
                                    <span className="text-white font-black text-sm">{Math.max(0, user.botClicksQuota - user.botClicksUsed).toLocaleString()} <span className="text-white/40 font-bold">/ {user.botClicksQuota.toLocaleString()}</span></span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${((user.botClicksQuota - user.botClicksUsed) / user.botClicksQuota) < 0.1 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                            }`}
                                        style={{ width: `${Math.max(0, Math.min(100, ((user.botClicksQuota - user.botClicksUsed) / user.botClicksQuota) * 100))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-emerald-400" />
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Compute</span>
                                    </div>
                                    <span className="text-white font-black text-sm">{user.hostingPowerLimit.toString()} vCPU <span className="text-white/40 font-bold">Limit</span></span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 w-[42%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-amber-400" />
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Product Limit</span>
                                    </div>
                                    <span className="text-white font-black text-sm">{user.productLimitQuota} <span className="text-white/40 font-bold">Max</span></span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 w-[25%] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                </div>
                            </div>

                            <QuotaManager
                                user={userData}
                                trigger={
                                    <button
                                        className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl"
                                    >
                                        Manage Subscription <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                }
                            />
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
