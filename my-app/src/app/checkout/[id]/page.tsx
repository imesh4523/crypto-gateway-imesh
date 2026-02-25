'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { ChevronDown, Copy, Settings, HelpCircle, Clock, CheckCircle2, Loader2, Check, ExternalLink } from 'lucide-react';

const CURRENCIES = [
    { id: 'USDTTRC20', name: 'USDT', network: 'TRX (TRC-20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024' },
    { id: 'USDTBSC', name: 'USDT', network: 'BSC (BEP-20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024' },
    { id: 'BTC', name: 'BTC', network: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024' },
    { id: 'ETH', name: 'ETH', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
];

export default function CheckoutPage() {
    const params = useParams();
    const invoiceId = params?.id as string;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [payAddress, setPayAddress] = useState('');
    const [payAmount, setPayAmount] = useState<number | null>(null);
    const [payCurrency, setPayCurrency] = useState('USDTTRC20');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [status, setStatus] = useState('FETCHING');

    // UI states
    const [timeLeft, setTimeLeft] = useState(3557); // 59:17
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

    useEffect(() => {
        if (!invoiceId) return;
        fetchInvoice();
        const interval = setInterval(fetchInvoice, 5000);
        return () => clearInterval(interval);
    }, [invoiceId]);

    useEffect(() => {
        if (status === 'WAITING' || status === 'SELECT_CRYPTO') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/checkout/${invoiceId}`);
            const data = await res.json();
            if (data.success) {
                setInvoice(data.data);

                if (data.data.status === 'COMPLETED' || data.data.transaction?.status === 'SUCCESS') {
                    setStatus('PAID');
                } else if (data.data.transaction && data.data.transaction.payAddress) {
                    setPayAddress(data.data.transaction.payAddress);
                    setPayAmount(data.data.transaction.amount);
                    setPayCurrency(data.data.transaction.currency || 'USDTTRC20');
                    generateQR(data.data.transaction.payAddress);
                    setStatus('WAITING');
                } else {
                    setStatus('SELECT_CRYPTO');
                }
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            setStatus('ERROR');
        } finally {
            setLoading(false);
        }
    };

    const generateQR = async (text: string) => {
        try {
            const url = await QRCode.toDataURL(text, { margin: 1, width: 200, color: { dark: '#000000', light: '#ffffff' } });
            setQrCodeDataUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectCrypto = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/checkout/${invoiceId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payCurrency })
            });
            const data = await res.json();
            if (data.success) {
                setPayAddress(data.data.payAddress);
                setPayAmount(data.data.payAmount);
                generateQR(data.data.payAddress);
                setStatus('WAITING');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Failed to generate payment address');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text: string, type: 'amount' | 'address') => {
        navigator.clipboard.writeText(text);
        if (type === 'amount') {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
        } else {
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        }
    };

    const selectedCurrencyObj = CURRENCIES.find(c => c.id === payCurrency) || CURRENCIES[0];

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (status === 'ERROR' || !invoice) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Invoice not found or expired.</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center py-12 px-4 font-sans text-slate-900">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

                {/* Header Section */}
                <div className="p-8 pb-6 bg-[#f8f9fa] border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center">
                            <span className="font-bold text-slate-500 text-xs">SM</span>
                        </div>
                        <span className="font-bold text-lg">{invoice.merchantName}</span>
                    </div>
                    <button className="bg-black text-white text-sm font-semibold py-1.5 px-4 rounded-full hover:bg-slate-800 transition">
                        Sign up
                    </button>
                </div>

                {/* SELECT CRYPTO VIEW */}
                {status === 'SELECT_CRYPTO' && (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-6">Select currency</h1>

                        <div className="mb-6">
                            <p className="font-bold text-lg">{invoice.amount} {invoice.currency}</p>
                            <p className="text-sm text-slate-500 font-medium">Select network</p>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                            <HelpCircle className="w-4 h-4" />
                            <span>You pay network fee</span>
                            <div className="ml-auto flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                                    <HelpCircle className="w-4 h-4 text-slate-600" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                                    <Settings className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 mb-8 shadow-sm">
                            <div className="relative">
                                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Expiration time</p>
                                <p className="text-emerald-500 font-bold">{formatTime(timeLeft)}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 relative">
                            {/* Currency Dropdown Simulation */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-slate-300 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={selectedCurrencyObj.logo} alt={selectedCurrencyObj.name} className="w-6 h-6" />
                                        <span className="font-medium">{selectedCurrencyObj.name} ({selectedCurrencyObj.network})</span>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                </button>

                                {isCurrencyDropdownOpen && (
                                    <div className="absolute top-16 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2">
                                        {CURRENCIES.map(curr => (
                                            <button
                                                key={curr.id}
                                                onClick={() => { setPayCurrency(curr.id); setIsCurrencyDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition"
                                            >
                                                <img src={curr.logo} alt={curr.name} className="w-6 h-6" />
                                                <span className="font-medium text-slate-700">{curr.name}</span>
                                                <span className="text-slate-400 text-sm block">· {curr.network}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSelectCrypto}
                            disabled={generating}
                            className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Proceed to the payment'}
                        </button>
                    </div>
                )}

                {/* WAITING FOR PAYMENT VIEW */}
                {status === 'WAITING' && (
                    <div className="p-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl font-bold tracking-tight">{payAmount || invoice.amount} {selectedCurrencyObj.name}</h1>
                                <button onClick={() => copyToClipboard(String(payAmount || invoice.amount), 'amount')} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
                                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                                </button>
                            </div>
                            <p className="font-bold text-slate-800 text-lg mb-1">{invoice.amount} {invoice.currency}</p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <span>Network · {selectedCurrencyObj.network}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                            <HelpCircle className="w-4 h-4" />
                            <span>You pay network fee</span>
                            <div className="ml-auto flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                                    <HelpCircle className="w-4 h-4 text-slate-600" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                                    <Settings className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border text-center lg:text-left border-slate-200 rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
                            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                                <div className="shrink-0 bg-white p-2 border border-slate-100 rounded-xl mx-auto lg:mx-0 w-[180px] h-[180px]">
                                    {qrCodeDataUrl ? (
                                        <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg"></div>
                                    )}
                                </div>
                                <div className="flex-1 py-2">
                                    <p className="text-sm text-slate-500 font-medium mb-2">Recipient's wallet address</p>
                                    <div className="flex items-start gap-2 mb-4">
                                        <p className="text-slate-800 font-medium break-all text-sm leading-relaxed">{payAddress}</p>
                                        <button onClick={() => copyToClipboard(payAddress, 'address')} className="w-6 h-6 shrink-0 bg-slate-100 rounded-md flex items-center justify-center hover:bg-slate-200 transition mt-0.5">
                                            {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-500 leading-relaxed">
                                        When your payment status will change, we'll send to you notification <span className="underline cursor-pointer text-slate-600 font-medium hover:text-black hover:bg-slate-100 px-1 py-0.5 rounded transition">Leave your email</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 divide-x border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Expiration time</p>
                                        <p className="text-emerald-500 font-bold text-sm">{formatTime(timeLeft)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-8 h-8 text-emerald-500 -rotate-90" viewBox="0 0 24 24" fill="none" strokeDasharray="60" strokeDashoffset="55" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs font-medium text-slate-500">Confirmations</p>
                                            <HelpCircle className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <p className="text-emerald-500 font-bold text-sm">0 from 5</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAID STATUS VIEW */}
                {status === 'PAID' && (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-3">Payment Successful</h3>
                        <p className="text-slate-500 mb-8">Your invoice has been paid. Thank you.</p>

                        <button className="bg-slate-100 text-slate-700 font-medium py-3 px-6 rounded-xl hover:bg-slate-200 transition">
                            Return to Merchant
                        </button>
                    </div>
                )}

            </div>

            <div className="mt-8 text-center flex items-center justify-center gap-2">
                <span className="text-sm text-slate-500 font-medium cursor-pointer hover:text-slate-800 transition">AML Policy</span>
            </div>
        </div>
    );
}
