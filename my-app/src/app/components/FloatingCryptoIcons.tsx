'use client';

export function FloatingCryptoIcons() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* 3D Animated Crypto Icons */}
            <div className="card-float crypto-icon-float binance-float pointer-events-auto" data-speed="6">
                <div className="crypto-coin binance-coin tilt-element">
                    <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024" alt="Binance" />
                </div>
            </div>

            <div className="card-float crypto-icon-float usdt-float pointer-events-auto" data-speed="-5">
                <div className="crypto-coin usdt-coin tilt-element">
                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024" alt="USDT" />
                </div>
            </div>

            <div className="card-float crypto-icon-float btc-float pointer-events-auto" data-speed="4">
                <div className="crypto-coin btc-coin tilt-element">
                    <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024" alt="BTC" />
                </div>
            </div>
        </div>
    );
}
