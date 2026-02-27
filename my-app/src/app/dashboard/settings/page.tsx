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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight">
                    Settings & Security
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Manage your account details and view your recent login activity tracking.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile, Webhook & 2FA */}
                <div className="lg:col-span-1 space-y-6">
                    <ProfileSettings email={user?.email || "merchant@example.com"} role={user?.role || "Merchant"} />
                    <WebhookSettings />
                    <TwoFactorSettings initiallyEnabled={false} />
                </div>

                {/* Right Column - REAL Login History Table Tracking IP */}
                <div className="lg:col-span-2">
                    <Card className="bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-xl p-8 rounded-[32px] h-full shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-white/40 dark:border-white/10 pb-6 relative">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a1f36] dark:text-white tracking-tight">Security & Login History</h3>
                            <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-indigo-500" />
                        </div>

                        <div className="space-y-6">
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-2xl">
                                We securely record your IP address and device information every time you login to keep your funds safe and provide accountability for all account access.
                            </p>

                            <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="text-[11px] text-slate-500 font-black uppercase tracking-widest bg-white/40 dark:bg-transparent border-b border-white/40 dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">IP Address & Location</th>
                                            <th className="px-6 py-4">Device / Browser</th>
                                            <th className="px-6 py-4 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/40 dark:divide-white/[0.03]">
                                        {loginHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    <div className="w-12 h-12 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Shield className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="font-bold">No login history recorded yet.</p>
                                                </td>
                                            </tr>
                                        ) : null}
                                        {loginHistory.map((log: any) => (
                                            <tr key={log.id} className="group hover:bg-white/60 dark:hover:bg-white/[0.02] transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            log.status === "SUCCESS" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                                        )} />
                                                        <span className="text-xs font-black text-[#1a1f36] dark:text-slate-300 uppercase tracking-wider">{log.status === "SUCCESS" ? "Success" : "Failed"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-[#1a1f36] dark:text-white font-mono text-[11px] font-black">
                                                            <Globe className="w-3.5 h-3.5 text-slate-400" /> {log.ipAddress || "Unknown IP"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[11px] font-black">
                                                            <MapPin className="w-3.5 h-3.5" /> {log.location || "Unknown Location"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] text-slate-600 dark:text-slate-400 font-bold truncate max-w-[200px]" title={log.userAgent}>
                                                        {log.userAgent?.split(') ')[1] || log.userAgent?.slice(0, 30) + '...'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-wider">
                                                            <Clock className="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
