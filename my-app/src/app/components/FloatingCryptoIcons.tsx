'use client';

export function FloatingCryptoIcons() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Ethereum */}
            <div className="crypto-coin coin-eth">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M11.996 1.105L11.995 1V7.794L11.996 7.794L17.228 10.106L11.996 1.105Z" opacity="0.6" />
                    <path d="M11.996 1.105L6.763 10.106L11.996 7.794V1.105Z" />
                    <path d="M11.995 16.14V22.868L11.996 22.868L17.232 10.999L11.995 16.14Z" opacity="0.6" />
                    <path d="M11.996 22.868V16.14L6.76 10.999L11.996 22.868Z" />
                    <path d="M11.996 15.021L17.228 10.106L11.996 7.794V15.021Z" opacity="0.2" />
                    <path d="M6.763 10.106L11.996 15.021V7.794L6.763 10.106Z" opacity="0.6" />
                </svg>
            </div>

            {/* Solana */}
            <div className="crypto-coin coin-sol">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M4.09 17.587l2.251-2.25h13.568l-2.25 2.25H4.09zm15.82-5.419H6.341l-2.25-2.25h13.57l2.25 2.25zM4.09 6.413h13.568l2.251 2.25H6.34L4.09 6.413z" />
                </svg>
            </div>

            {/* USDC */}
            <div className="crypto-coin coin-usdc">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 18V6" />
                </svg>
            </div>
        </div>
    );
}
