import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Bot, Save, Zap, HelpCircle, Package, Archive, RefreshCcw, CreditCard, Megaphone, Users, ArrowRight } from "lucide-react";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import BotDashboardUi from "./BotDashboardUi";
import BotSettingsForm from "./BotSettingsForm";
import Link from "next/link";

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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <AutoRefresh intervalMs={15000} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-slate-800 dark:text-slate-200 text-lg font-medium">Connect your Cloud Shop Bot and manage limits.</p>
                {user.trialActive ? (
                    <div className="px-5 py-2.5 bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-full border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Free Trial Active
                    </div>
                ) : (
                    <div className="px-5 py-2.5 bg-white/40 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md">
                        Premium Active
                    </div>
                )}
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
                    <Card className="p-6 bg-slate-900 border-0 rounded-3xl shadow-xl relative overflow-hidden">
                        {/* decorative background element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 opacity-20 blur-3xl rounded-full pointer-events-none" />

                        <h3 className="text-white font-black text-xl mb-6">Hosting Quotas</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Bot Clicks Remaining</span>
                                    <span className="text-white font-bold">{Math.max(0, user.botClicksQuota - user.botClicksUsed)} / {user.botClicksQuota}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${((user.botClicksQuota - user.botClicksUsed) / user.botClicksQuota) < 0.1 ? 'bg-rose-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${Math.max(0, Math.min(100, ((user.botClicksQuota - user.botClicksUsed) / user.botClicksQuota) * 100))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Compute Allocation</span>
                                    <span className="text-white font-bold">{user.hostingPowerLimit.toString()} vCPU</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all w-[42%]" />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            {user.trialActive && (
                                <button className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-xl transition-colors flex items-center justify-center gap-2 group">
                                    Upgrade to Premium <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
