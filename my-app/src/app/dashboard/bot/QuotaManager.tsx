"use client";

import { useState, ReactNode } from "react";
import { Zap, Shield, Crown, Check, ArrowRight, X, Cpu, MousePointer2, Package, Sparkles, Loader2, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuotaManagerProps {
    user: {
        id: string;
        plan: string;
        trialActive: boolean;
        botClicksQuota: number;
        botClicksUsed: number;
        hostingPowerLimit: any;
        productLimitQuota: number;
    };
    trigger?: ReactNode;
}

const PLANS = [
    {
        id: 'FREE',
        name: 'Free Trial',
        price: '0',
        icon: Zap,
        color: 'text-indigo-600',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        features: [
            '500 Bot Clicks',
            '1.0 vCPU Hosting',
            'Up to 10 Products',
            'Basic Support'
        ]
    },
    {
        id: 'PRO',
        name: 'Pro Business',
        price: '29',
        icon: Shield,
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        recommended: true,
        features: [
            '50,000 Bot Clicks',
            '2.0 vCPU Hosting',
            'Up to 500 Products',
            'Priority Support',
            'Advanced Analytics'
        ]
    },
    {
        id: 'PREMIUM',
        name: 'Enterprise',
        price: '99',
        icon: Crown,
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        features: [
            '1,000,000 Bot Clicks',
            '4.0 vCPU Hosting',
            'Unlimited Products',
            '24/7 Dedicated Support',
            'White-label Option'
        ]
    }
];

export default function QuotaManager({ user, trigger }: QuotaManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
    const router = useRouter();

    const handleUpgrade = async (planId: string) => {
        if (planId === user.plan) return;
        if (planId === 'FREE') return; // Cannot downgrade to free

        setLoading(true);
        setCheckoutPlan(planId);
        try {
            const res = await fetch('/api/v1/user/upgrade-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId })
            });
            const data = await res.json();
            if (data.success && data.data?.checkoutUrl) {
                // Redirect to the checkout page for crypto payment
                router.push(data.data.checkoutUrl);
                setIsOpen(false);
            } else {
                console.error("Upgrade checkout error:", data.error);
                alert(data.error || "Failed to create checkout. Please try again.");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
            setCheckoutPlan(null);
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="w-full">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "group relative px-6 py-2.5 font-black rounded-full border shadow-lg backdrop-blur-xl flex items-center gap-3 transition-all active:scale-95 overflow-hidden",
                        user.trialActive
                            ? "bg-white/40 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                            : "bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    )}
                >
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        user.trialActive ? "bg-indigo-500" : "bg-emerald-500"
                    )} />
                    <span className="relative z-10">{user.trialActive ? "Free Trial Active" : `${user.plan} Plan Active`}</span>
                    <Sparkles className="w-4 h-4 opacity-50" />
                </button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="bg-white dark:bg-[#0f111a] border-slate-200 dark:border-white/5 p-0 overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl"
                    style={{ maxWidth: '1000px', width: '95vw' }}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 z-50" />

                    <div className="max-h-[85vh] overflow-y-auto p-6 md:p-10 lg:p-12">
                        <DialogHeader className="mb-10 text-center md:text-left">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10">
                                <div>
                                    <DialogTitle className="text-3xl md:text-4xl font-black text-[#1a1f36] dark:text-white tracking-tight leading-tight">
                                        Bot Hosting <span className="text-indigo-600 dark:text-indigo-400">&amp; Quotas</span>
                                    </DialogTitle>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-base">Powering your shop bot with enterprise infrastructure.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-3 shrink-0">
                                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Online</span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Usage Metrics Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                            <UsageCard
                                label="Bot Clicks"
                                used={user.botClicksUsed}
                                total={user.botClicksQuota}
                                icon={MousePointer2}
                                color="text-indigo-600"
                                barBg="bg-indigo-500"
                            />
                            <UsageCard
                                label="Compute (vCPU)"
                                used={parseFloat(user.hostingPowerLimit.toString())}
                                total={4.0}
                                icon={Cpu}
                                color="text-emerald-600"
                                barBg="bg-emerald-500"
                            />
                            <UsageCard
                                label="Product Memory"
                                used={0}
                                total={user.productLimitQuota}
                                icon={Package}
                                color="text-amber-600"
                                barBg="bg-amber-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PLANS.map((plan) => {
                                const isCurrentPlan = user.plan === plan.id;
                                const isCheckingOut = checkoutPlan === plan.id;
                                const isFree = plan.id === 'FREE';

                                return (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "relative p-8 rounded-[36px] border-2 transition-all duration-300 flex flex-col min-h-[480px]",
                                            isCurrentPlan
                                                ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02] z-10"
                                                : "bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-500/20"
                                        )}
                                    >
                                        {plan.recommended && !isCurrentPlan && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                Recommended
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-1.5 mb-8">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-2", plan.bg)}>
                                                <plan.icon className={cn("w-6 h-6", plan.color)} />
                                            </div>
                                            <h4 className="text-xl font-black">{plan.name}</h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black">${plan.price}</span>
                                                <span className="text-[11px] opacity-60 font-black uppercase tracking-widest">/month</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-10 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-[13px] font-bold">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                        isCurrentPlan ? "bg-white/20" : "bg-emerald-500/10"
                                                    )}>
                                                        <Check className={cn("w-3 h-3", isCurrentPlan ? "text-white" : "text-emerald-500")} strokeWidth={4} />
                                                    </div>
                                                    <span className={isCurrentPlan ? "text-white/80" : "text-slate-600 dark:text-slate-400"}>
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            disabled={isCurrentPlan || loading || isFree}
                                            onClick={() => handleUpgrade(plan.id)}
                                            className={cn(
                                                "w-full h-12 rounded-2xl font-black text-sm transition-all",
                                                isCurrentPlan
                                                    ? "bg-white/10 text-white hover:bg-white/10 cursor-default"
                                                    : isFree
                                                        ? "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                                            )}
                                        >
                                            {isCurrentPlan ? (
                                                "Currently Active"
                                            ) : isFree ? (
                                                "Your Base Plan"
                                            ) : isCheckingOut && loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Creating Checkout...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    Pay ${plan.price} / mo
                                                </span>
                                            )}
                                        </Button>

                                        {/* Crypto payment note */}
                                        {!isCurrentPlan && !isFree && (
                                            <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold mt-3 uppercase tracking-wider">
                                                Pay via crypto · Instant activation
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function UsageCard({ label, used, total, icon: Icon, color, barBg }: any) {
    const percentage = Math.min(100, (used / total) * 100);
    return (
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 p-6 rounded-[28px] group">
            <div className="flex items-center gap-4 mb-5">
                <div className={cn("w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center shrink-0", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block truncate">{label}</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xl font-black text-[#1a1f36] dark:text-white leading-none">
                            {used.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase">
                            / {total >= 1000000 ? 'INF.' : total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="w-full h-2 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", barBg)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
