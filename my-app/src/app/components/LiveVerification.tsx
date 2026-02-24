"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

export function LiveVerification() {
    const [state, setState] = useState<"initializing" | "verifying" | "success">("initializing");

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                setState("initializing");
                await new Promise(resolve => setTimeout(resolve, 2000));

                setState("verifying");
                await new Promise(resolve => setTimeout(resolve, 3000));

                setState("success");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        };
        sequence();
    }, []);

    return (
        <div className={`glass-panel mini-alert tilt-element transition-all duration-500 overflow-hidden ${state === "success" ? "bg-gradient-to-br from-indigo-600 to-purple-800" : "bg-white/5 border-white/10"
            }`}
            style={{
                minWidth: "220px"
            }}>
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${state === "success"
                        ? "bg-white text-indigo-600 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        : "bg-white/10 text-slate-400"
                    }`}>
                    {state === "initializing" && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
                    {state === "verifying" && <Loader2 className="w-5 h-5 animate-spin" />}
                    {state === "success" && <Check className="w-5 h-5 stroke-[3]" />}
                </div>

                <div className="flex flex-col">
                    <span className={`text-sm font-semibold tracking-wide transition-all duration-300 ${state === "success" ? "text-white" : "text-slate-300"
                        }`}>
                        {state === "initializing" && "Initializing..."}
                        {state === "verifying" && "Verifying Block..."}
                        {state === "success" && "Transfer successful"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                        {state === "initializing" && "0x..."}
                        {state === "verifying" && "Confirming..."}
                        {state === "success" && "Verified"}
                    </span>
                </div>
            </div>

            {state === "verifying" && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 animate-[shimmer_2s_infinite]" style={{ width: "100%" }} />
            )}
        </div>
    );
}
