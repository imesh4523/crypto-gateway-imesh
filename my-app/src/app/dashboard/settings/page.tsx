import { Card } from "@/components/ui/card";
import { User, Shield, Lock, MapPin, Globe, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { TwoFactorSettings } from "@/components/dashboard/TwoFactorSettings";
import { WebhookSettings } from "@/components/dashboard/WebhookSettings";
import { getServerSession } from "next-auth";
import { cn } from "@/lib/utils";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        redirect("/login");
    }

    const loginHistory = await prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">
                    Settings & Security
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium text-lg">Manage your account details and view your recent login activity tracking.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Profile & Webhook */}
                <div className="xl:col-span-1 space-y-8">
                    <ProfileSettings email={user?.email || "merchant@example.com"} role={user?.role || "Merchant"} />
                    <WebhookSettings />
                    <TwoFactorSettings initiallyEnabled={false} />
                </div>

                {/* Right Column - Login History */}
                <div className="xl:col-span-2">
                    <Card className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl p-0 overflow-hidden rounded-[32px] h-full shadow-xl shadow-indigo-500/5">
                        <div className="p-8 pb-0">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                                    <History className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#1a1f36] dark:text-white tracking-tight">Security & Login History</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                                        We record IP and device info to keep your funds safe.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-white/5 border-y border-white/40 dark:border-white/10">
                                    <tr>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Security Info</th>
                                        <th className="px-8 py-4">Device / Browser</th>
                                        <th className="px-8 py-4 text-right">Activity Log</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/20 dark:divide-white/[0.05]">
                                    {loginHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-500">
                                                <div className="w-16 h-16 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                                    <Shield className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-bold text-lg">No activity recorded yet.</p>
                                                <p className="text-sm text-slate-400 mt-1">Your login history will appear here.</p>
                                            </td>
                                        </tr>
                                    ) : null}
                                    {loginHistory.map((log: any) => (
                                        <tr key={log.id} className="group hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2.5 h-2.5 rounded-full ring-4",
                                                        log.status === "SUCCESS"
                                                            ? "bg-emerald-500 ring-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                                            : "bg-rose-500 ring-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                                                    )} />
                                                    <span className="text-xs font-black text-[#1a1f36] dark:text-slate-300 uppercase tracking-wider">
                                                        {log.status === "SUCCESS" ? "Success" : "Failed"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-[#1a1f36] dark:text-white font-mono text-[12px] font-bold">
                                                        <Globe className="w-3.5 h-3.5 text-indigo-500" /> {log.ipAddress || "Unknown IP"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                                                        <MapPin className="w-3.5 h-3.5" /> {log.location || "Unknown Location"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]" title={log.userAgent}>
                                                    {log.userAgent?.split(') ')[1] || log.userAgent?.slice(0, 30) + '...'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2 text-[#1a1f36] dark:text-indigo-300 text-[12px] font-black tracking-tight">
                                                        <Clock className="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
                                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
