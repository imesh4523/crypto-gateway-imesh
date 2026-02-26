import { Card } from "@/components/ui/card";
import { User, Shield, Lock, MapPin, Globe, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { TwoFactorSettings } from "@/components/dashboard/TwoFactorSettings";
import { WebhookSettings } from "@/components/dashboard/WebhookSettings";
import { getServerSession } from "next-auth";
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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                    Settings & Security
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account details and view your recent login activity tracking.</p>
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
                    <Card className="bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                            <History className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Security & Login History</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                We securely record your IP address and device information every time you login to keep your funds safe.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-black/20">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-tl-lg">Status</th>
                                            <th className="px-4 py-3 font-medium">IP Address & Loc</th>
                                            <th className="px-4 py-3 font-medium">Device/Browser</th>
                                            <th className="px-4 py-3 font-medium rounded-tr-lg">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {loginHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                    No login history recorded yet.
                                                </td>
                                            </tr>
                                        ) : null}
                                        {loginHistory.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                <td className="px-4 py-3">
                                                    {log.status === "SUCCESS" ? (
                                                        <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 items-center justify-center mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Success" />
                                                    ) : (
                                                        <span className="inline-flex w-2 h-2 rounded-full bg-red-500 items-center justify-center mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Failed" />
                                                    )}
                                                    <span className="text-xs text-slate-700 dark:text-slate-300">{log.status === "SUCCESS" ? "Login" : "Failed"}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-xs mb-1">
                                                        <Globe className="w-3 h-3 text-slate-500" /> {log.ipAddress || "Unknown IP"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs text-indigo-700 dark:text-indigo-300">
                                                        <MapPin className="w-3 h-3" /> {log.location || "Unknown"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{log.userAgent?.slice(0, 30)}...</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                                                        <Clock className="w-3 h-3" /> {log.createdAt.toLocaleString()}
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
