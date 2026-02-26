/**
 * Soltio Checkout Script for Shopify
 * 
 * This script is embedded in the Shopify theme to add the 
 * "Pay with Crypto" button at checkout.
 * 
 * Usage: Add this to your Shopify theme's checkout.liquid or
 * use Shopify Script Tags API to inject it automatically.
 */

(function () {
    'use strict';

    const SOLTIO_APP_URL = '{{APP_URL}}'; // Replaced during installation

    // Wait for checkout page to load
    function init() {
        if (!isCheckoutPage()) return;

        // Add payment option
        addCryptoPaymentOption();

        // Listen for changes
        observeCheckoutChanges();
    }

    function isCheckoutPage() {
        return window.location.pathname.includes('/checkout') ||
            window.location.pathname.includes('/cart');
    }

    function addCryptoPaymentOption() {
        const paymentSection = document.querySelector('[data-payment-method]') ||
            document.querySelector('.payment-method-list') ||
            document.querySelector('#checkout-payment-methods');

        if (!paymentSection) return;

        const cryptoOption = document.createElement('div');
        cryptoOption.className = 'soltio-payment-option';
        cryptoOption.innerHTML = `
            <div class="soltio-payment-card" id="soltio-crypto-pay">
                <div class="soltio-payment-header">
                    <div class="soltio-radio">
                        <input type="radio" name="payment_method" value="soltio_crypto" id="soltio-radio-input" />
                        <span class="soltio-radio-circle"></span>
                    </div>
                    <div class="soltio-payment-info">
                        <div class="soltio-payment-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                                <rect width="24" height="24" rx="6" fill="#4f46e5"/>
                                <polygon points="13 4 5 14 11 14 10 20 18 10 12 10 13 4" fill="white"/>
                            </svg>
                            Pay with Crypto
                        </div>
                        <div class="soltio-payment-subtitle">Bitcoin, Ethereum, USDT & 100+ cryptocurrencies</div>
                    </div>
                    <div class="soltio-crypto-icons">
                        <span class="soltio-coin" title="Bitcoin">₿</span>
                        <span class="soltio-coin" title="Ethereum">Ξ</span>
                        <span class="soltio-coin" title="USDT">₮</span>
                    </div>
                </div>
                <div class="soltio-payment-body" id="soltio-payment-body" style="display:none;">
                    <p>You will be redirected to complete your payment securely with cryptocurrency.</p>
                    <button type="button" class="soltio-pay-button" onclick="soltioInitPayment()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        Continue to Crypto Payment
                    </button>
                </div>
            </div>
        `;

        paymentSection.appendChild(cryptoOption);

        // Handle radio selection
        document.getElementById('soltio-radio-input').addEventListener('change', function () {
            document.getElementById('soltio-payment-body').style.display = this.checked ? 'block' : 'none';
        });
    }

    // Create payment and redirect
    window.soltioInitPayment = async function () {
        const btn = document.querySelector('.soltio-pay-button');
        btn.disabled = true;
        btn.innerHTML = '<span class="soltio-spinner"></span> Processing...';

        try {
            // Gather checkout data from Shopify's checkout object
            const checkout = window.Shopify?.Checkout || {};
            const shopDomain = window.Shopify?.shop || window.location.hostname;

            const response = await fetch(`${SOLTIO_APP_URL}/payments/create?shop=${shopDomain}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: checkout.order_id || checkout.token || Date.now(),
                    amount: checkout.payment_due || document.querySelector('[data-checkout-total]')?.textContent?.replace(/[^0-9.]/g, ''),
                    currency: checkout.currency || 'USD',
                    customer_email: checkout.email || '',
                    cancel_url: window.location.href,
                    line_items: checkout.line_items || [],
                }),
            });

            const data = await response.json();

            if (data.success && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                throw new Error(data.error || 'Payment creation failed');
            }
        } catch (error) {
            console.error('Soltio Error:', error);
            alert('Could not initiate crypto payment. Please try again or select a different payment method.');
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Continue to Crypto Payment
            `;
        }
    };

    function observeCheckoutChanges() {
        const observer = new MutationObserver(() => {
            if (!document.getElementById('soltio-crypto-pay')) {
                addCryptoPaymentOption();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .soltio-payment-card {
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            margin-top: 12px;
            overflow: hidden;
            transition: border-color 0.2s;
        }
        .soltio-payment-card:has(input:checked) {
            border-color: #4f46e5;
        }
        .soltio-payment-header {
            display: flex;
            align-items: center;
            padding: 16px;
            cursor: pointer;
            gap: 12px;
        }
        .soltio-radio {
            position: relative;
            width: 20px;
            height: 20px;
        }
        .soltio-radio input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
            z-index: 2;
        }
        .soltio-radio-circle {
            position: absolute;
            inset: 0;
            border: 2px solid #cbd5e1;
            border-radius: 50%;
            transition: all 0.2s;
        }
        .soltio-radio input:checked + .soltio-radio-circle {
            border-color: #4f46e5;
            background: #4f46e5;
            box-shadow: inset 0 0 0 3px white;
        }
        .soltio-payment-info { flex: 1; }
        .soltio-payment-title {
            display: flex;
            align-items: center;
            font-weight: 600;
            font-size: 14px;
            color: #1a1a1a;
        }
        .soltio-payment-subtitle {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
        }
        .soltio-crypto-icons {
            display: flex;
            gap: 4px;
        }
        .soltio-coin {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
        }
        .soltio-payment-body {
            padding: 0 16px 16px;
        }
        .soltio-payment-body p {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 12px;
        }
        .soltio-pay-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
            font-family: inherit;
        }
        .soltio-pay-button:hover { opacity: 0.9; }
        .soltio-pay-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .soltio-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: soltio-spin 0.6s linear infinite;
        }
        @keyframes soltio-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
