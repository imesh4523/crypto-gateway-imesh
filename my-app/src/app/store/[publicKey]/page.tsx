import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";

export default async function PublicPayPage({ params }: { params: Promise<{ publicKey: string }> }) {
    const { publicKey } = await params;

    const user = await prisma.user.findUnique({
        where: { publicKey: publicKey },
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Merchant Not Found</h1>
                    <p className="text-slate-500">The payment link you followed is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    async function createInvoice(formData: FormData) {
        'use server';
        const amount = formData.get('amount') as string;
        const description = formData.get('description') as string;

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return;
        }

        const foundUser = await prisma.user.findUnique({ where: { publicKey } });
        if (!foundUser) return;

        const invoice = await prisma.invoice.create({
            data: {
                userId: foundUser.id,
                amount: Number(amount),
                currency: "USD",
                orderDescription: description || "Direct Payment",
                status: "PENDING"
            }
        });

        // Redirect to the new clean /pay/[id] URL
        redirect(`/pay/${invoice.id}`);
    }

    return (
        <div style={{ backgroundColor: user.themeBgColor || "#f4f5f8" }} className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500">
            <Card className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-0">
                {/* Header */}
                <div className="p-8 pb-6 border-b border-slate-50 flex flex-col items-center">
                    {user.brandLogoUrl ? (
                        <img src={user.brandLogoUrl} alt="Logo" className="h-12 object-contain mb-4" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl mb-4">
                            <span className="font-black text-white text-xl">{user.brandName?.substring(0, 2).toUpperCase() || "SM"}</span>
                        </div>
                    )}
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{user.brandName || user.name}</h1>
                    <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Merchant</span>
                    </div>
                </div>

                {/* Form */}
                <form action={createInvoice} className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Payment Amount (USD)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-black text-lg">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-2xl font-black text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none tabular-nums"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">What is this for? (Optional)</label>
                            <input
                                type="text"
                                name="description"
                                placeholder="Order #123, Tip, etc."
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            Pay Securely <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                            Payments are processed via our secure crypto gateway. All transactions are non-refundable once confirmed on the blockchain.
                        </p>
                    </div>
                </form>

                <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by Oriyoto Gateway</p>
                </div>
            </Card>
        </div>
    );
}
