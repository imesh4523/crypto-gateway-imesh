"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentPreview() {
    const [status, setStatus] = useState<"AWAITING" | "VERIFYING" | "PAID">("AWAITING");
    const [timeLeft, setTimeLeft] = useState(7184); // 01:59:44

    useEffect(() => {
        if (status === "AWAITING") {
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

    const handleVerify = () => {
        setStatus("VERIFYING");
        setTimeout(() => {
            setStatus("PAID");
        }, 2000);
    };

    const reset = () => {
        setStatus("AWAITING");
        setTimeLeft(7184);
    };

    return (
        <div className="payment-preview-container">
            <AnimatePresence mode="wait">
                {status !== "PAID" ? (
                    <motion.div
                        key="awaiting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="payment-card-preview"
                    >
                        {/* Header */}
                        <div className="pc-header">
                            <div className="pc-logo-circle">OR</div>
                            <span className="pc-name">Oriyoto</span>
                        </div>

                        {/* Amount */}
                        <div className="pc-amount-section">
                            <div className="pc-amount-row">
                                <span className="pc-amount-large">324</span>
                                <span className="pc-currency">USDT</span>
                                <div className="pc-copy-btn-small">
                                    <Copy size={12} />
                                </div>
                            </div>
                            <div className="pc-sub-amount">324 USD</div>
                        </div>

                        <div className="pc-gateway-tag">
                            GATEWAY • <span className="pc-binance-label">
                                <img src="/binance-logo.svg" alt="Binance" className="w-3 h-3 h-inline" /> BINANCE PAY
                            </span>
                        </div>

                        {/* Inner Details Card */}
                        <div className="pc-inner-outlined-card-preview">
                            <div className="pc-inner-logo-box">
                                <div className="pc-binance-icon-circle">
                                    <img src="/binance-logo.svg" alt="Binance" className="w-5 h-5" />
                                </div>
                                <span className="pc-inner-amount">324</span>
                                <span className="pc-inner-unit">USDT</span>
                            </div>

                            <div className="pc-inner-info">
                                <div className="pc-info-item">
                                    <span className="pc-info-label">Binance Pay ID</span>
                                    <div className="pc-info-value-row">
                                        <span className="pc-info-value">820752178</span>
                                        <Copy size={10} className="text-slate-400" />
                                    </div>
                                </div>

                                <div className="pc-note-preview-box">
                                    <div className="pc-note-header">
                                        <span className="pc-note-tag">⚠ NOTE (REQUIRED!)</span>
                                        <div className="pc-note-copy">
                                            <span className="pc-note-text">PAY-122EDB75</span>
                                            <Copy size={12} className="text-amber-600" />
                                        </div>
                                    </div>
                                    <p className="pc-note-hint">Include the Note when sending via Binance Pay.</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Row */}
                        <div className="pc-status-row-preview">
                            <div className="pc-status-block">
                                <div className="pc-clock-icon-wrapper">
                                    <Clock size={16} className="text-amber-500" />
                                </div>
                                <div>
                                    <div className="pc-label-mini">Time Left</div>
                                    <div className="pc-val-small">{formatTime(timeLeft)}</div>
                                </div>
                            </div>

                            <div className="pc-status-block">
                                <div className="pc-status-dots-circular">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <div>
                                    <div className="pc-label-mini">Status</div>
                                    <div className="pc-val-small">Awaiting</div>
                                </div>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            className={`pc-verify-btn-preview ${status === "VERIFYING" ? "loading" : ""}`}
                            onClick={handleVerify}
                            disabled={status === "VERIFYING"}
                        >
                            {status === "VERIFYING" ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <><CheckCircle2 size={20} /> I'VE PAID – VERIFY NOW</>
                            )}
                        </button>
                        <p className="pc-footer-hint">Reads your Binance Pay history to confirm payment. May take 1-2 min after sending.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="paid"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="payment-success-card"
                    >
                        <div className="ps-icon-wrapper">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                className="ps-icon-box"
                            >
                                <Check size={60} strokeWidth={4} color="white" />
                            </motion.div>
                            <div className="ps-glow"></div>
                        </div>
                        <h2 className="ps-title">Paid!</h2>
                        <p className="ps-desc">Success! Your payment has been confirmed by the network.</p>

                        <button className="ps-continue-btn" onClick={reset}>
                            CONTINUE
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .payment-preview-container {
                    perspective: 1000px;
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .payment-card-preview {
                    background: #fff;
                    border-radius: 40px;
                    padding: 24px;
                    color: #000;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.1);
                    position: relative;
                }

                .pc-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .pc-logo-circle {
                    width: 28px;
                    height: 28px;
                    background: #000;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 9px;
                }

                .pc-name {
                    font-weight: 800;
                    font-size: 1rem;
                }

                .pc-amount-section {
                    margin-bottom: 15px;
                }

                .pc-amount-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .pc-amount-large {
                    font-size: 2.5rem;
                    font-weight: 900;
                    line-height: 1;
                }

                .pc-currency {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #000;
                }

                .pc-copy-btn-small {
                    width: 20px;
                    height: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    cursor: pointer;
                }

                .pc-sub-amount {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                .pc-gateway-tag {
                    font-size: 0.6rem;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pc-binance-label {
                    color: #f59e0b;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .h-inline {
                    display: inline-block;
                }

                .pc-inner-outlined-card-preview {
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    padding: 12px;
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    background: #fff;
                }

                .pc-inner-logo-box {
                    background: #0f172a;
                    border-radius: 16px;
                    padding: 10px;
                    width: 75px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .pc-binance-icon-circle {
                    background: #f59e0b;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 6px;
                }

                .pc-inner-amount {
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 900;
                    line-height: 1;
                }

                .pc-inner-unit {
                    color: #f59e0b;
                    font-size: 0.55rem;
                    font-weight: 700;
                    margin-top: 2px;
                }

                .pc-inner-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .pc-info-item {
                    margin-bottom: 8px;
                }

                .pc-info-label {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 600;
                    display: block;
                    margin-bottom: 2px;
                }

                .pc-info-value-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pc-info-value {
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #000;
                }

                .pc-note-preview-box {
                    background: #fffbeb;
                    border: 1px solid #fef3c7;
                    border-radius: 12px;
                    padding: 10px;
                }

                .pc-note-tag {
                    font-size: 0.5rem;
                    font-weight: 950;
                    color: #d97706;
                    display: block;
                    margin-bottom: 2px;
                }

                .pc-note-copy {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pc-note-text {
                    font-weight: 900;
                    font-size: 0.85rem;
                    color: #000;
                }

                .pc-note-hint {
                    font-size: 0.5rem;
                    color: #94a3b8;
                    margin-top: 4px;
                    font-weight: 500;
                }

                .pc-status-row-preview {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .pc-status-block {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .pc-label-mini {
                    font-size: 0.6rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .pc-val-small {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #000;
                }

                .pc-status-dots-circular {
                    position: relative;
                    width: 14px;
                    height: 14px;
                    animation: circleRotate 2s linear infinite;
                }

                .pc-status-dots-circular .dot {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #f59e0b;
                    border-radius: 50%;
                }

                .pc-status-dots-circular .dot:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
                .pc-status-dots-circular .dot:nth-child(2) { bottom: 1px; left: 1px; opacity: 0.6; }
                .pc-status-dots-circular .dot:nth-child(3) { bottom: 1px; right: 1px; opacity: 0.3; }

                @keyframes circleRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .pc-verify-btn-preview {
                    width: 100%;
                    background: #f59e0b;
                    color: #000;
                    border: none;
                    padding: 16px;
                    border-radius: 100px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
                }

                .pc-verify-btn-preview:hover {
                    background: #fbbf24;
                    transform: translateY(-2px);
                }

                .pc-clock-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border: 1.5px solid #f59e0b;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pc-footer-hint {
                    text-align: center;
                    font-size: 0.5rem; /* Reduced to approx 8px */
                    color: #94a3b8;
                    margin-top: 10px;
                    line-height: 1.4;
                    padding: 0 10px;
                    opacity: 0.8;
                }

                /* Success State */
                .payment-success-card {
                    background: #fff;
                    border-radius: 40px;
                    padding: 50px 30px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .ps-icon-box {
                    width: 100px;
                    height: 100px;
                    background: #10b981;
                    border-radius: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: rotate(12deg);
                    margin-bottom: 25px;
                    box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
                }

                .ps-title {
                    font-size: 3rem;
                    font-weight: 950;
                    color: #000;
                    margin-bottom: 10px;
                }

                .ps-desc {
                    font-size: 1rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 30px;
                }

                .ps-continue-btn {
                    width: 100%;
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
