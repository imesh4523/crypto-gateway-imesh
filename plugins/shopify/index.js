/**
 * ═══════════════════════════════════════════════════════
 *  Soltio - Shopify Crypto Payment Gateway App
 *  Accept 100+ cryptocurrencies on your Shopify store
 * ═══════════════════════════════════════════════════════
 */

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Shopify = require('shopify-api-node');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// ─── Middleware ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Config ───
const CONFIG = {
    shopifyApiKey: process.env.SHOPIFY_API_KEY,
    shopifyApiSecret: process.env.SHOPIFY_API_SECRET,
    soltioApiKey: process.env.SOLTIO_API_KEY,
    soltioApiUrl: process.env.SOLTIO_API_URL || 'https://api.soltio.com',
    soltioIpnSecret: process.env.SOLTIO_IPN_SECRET,
    appUrl: process.env.APP_URL,
    scopes: process.env.SHOPIFY_SCOPES || 'read_products,write_orders,read_orders',
};

// In-memory store (use Redis/DB in production)
const merchants = new Map();

// ─── Shopify HMAC Verification ───
function verifyShopifyHmac(query) {
    const { hmac, ...params } = query;
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const hash = crypto.createHmac('sha256', CONFIG.shopifyApiSecret).update(sortedParams).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
}

// ─── Soltio IPN Signature Verification ───
function verifySoltioSignature(payload, signature) {
    if (!CONFIG.soltioIpnSecret) return true; // Skip if no secret configured
    const expected = crypto.createHmac('sha512', CONFIG.soltioIpnSecret).update(JSON.stringify(payload)).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════
//  OAuth Flow — Shopify App Installation
// ═══════════════════════════════════════

/**
 * Step 1: Merchant clicks "Install App" — redirect to Shopify OAuth
 */
app.get('/auth', (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).send('Missing shop parameter');

    const redirectUri = `${CONFIG.appUrl}/auth/callback`;
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store nonce for verification
    merchants.set(`nonce_${shop}`, nonce);

    const authUrl = `https://${shop}/admin/oauth/authorize?` +
        `client_id=${CONFIG.shopifyApiKey}` +
        `&scope=${CONFIG.scopes}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${nonce}`;

    res.redirect(authUrl);
});

/**
 * Step 2: Shopify redirects back with authorization code
 */
app.get('/auth/callback', async (req, res) => {
    const { shop, code, state, hmac } = req.query;

    // Verify HMAC
    if (!verifyShopifyHmac(req.query)) {
        return res.status(401).send('HMAC verification failed');
    }

    // Verify nonce
    const storedNonce = merchants.get(`nonce_${shop}`);
    if (state !== storedNonce) {
        return res.status(401).send('Nonce verification failed');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: CONFIG.shopifyApiKey,
            client_secret: CONFIG.shopifyApiSecret,
            code: code,
        });

        const accessToken = tokenResponse.data.access_token;

        // Store merchant credentials
        merchants.set(shop, {
            accessToken,
            shop,
            installedAt: new Date().toISOString(),
        });

        console.log(`✅ App installed successfully for ${shop}`);

        // Redirect merchant to the app settings page
        res.redirect(`/settings?shop=${shop}`);

    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.status(500).send('Failed to complete authentication');
    }
});

// ═══════════════════════════════════════
//  Settings Page — Configure Soltio Keys
// ═══════════════════════════════════════

app.get('/settings', (req, res) => {
    const { shop } = req.query;
    const merchant = merchants.get(shop);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Soltio Settings - ${shop}</title>
        <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f6f7; padding: 40px; }
            .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
            .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .logo svg { width: 32px; height: 32px; }
            .logo h1 { font-size: 20px; font-weight: 700; color: #1a1a1a; }
            .field { margin-bottom: 20px; }
            .field label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #333; }
            .field input, .field select { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
            .field input:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
            .field small { color: #888; font-size: 12px; margin-top: 4px; display: block; }
            .btn { background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; width: 100%; }
            .btn:hover { background: #4338ca; }
            .status { padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
            .status.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
            .status.info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">
                <svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#4f46e5"/><polygon points="13 4 5 14 11 14 10 20 18 10 12 10 13 4" fill="white"/></svg>
                <h1>Soltio Payment Settings</h1>
            </div>

            <div class="status info">
                Connected to: <strong>${shop}</strong>
            </div>

            <form method="POST" action="/settings/save?shop=${shop}">
                <div class="field">
                    <label>Soltio API Key</label>
                    <input type="password" name="soltio_api_key" placeholder="sk_live_..." value="${merchant?.soltioApiKey || ''}" required />
                    <small>Get your API key from <a href="https://soltio.com/dashboard/api-keys" target="_blank">Soltio Dashboard</a></small>
                </div>
                <div class="field">
                    <label>IPN / Webhook Secret</label>
                    <input type="password" name="ipn_secret" placeholder="whsec_..." value="${merchant?.ipnSecret || ''}" />
                    <small>Found in Soltio Dashboard → Settings. Used to verify incoming payment notifications.</small>
                </div>
                <div class="field">
                    <label>Environment</label>
                    <select name="environment">
                        <option value="test" ${merchant?.environment === 'test' ? 'selected' : ''}>🧪 Sandbox (Test)</option>
                        <option value="live" ${merchant?.environment === 'live' ? 'selected' : ''}>🟢 Live (Production)</option>
                    </select>
                </div>
                <div class="field">
                    <label>Payment Method Title</label>
                    <input type="text" name="payment_title" placeholder="Pay with Crypto" value="${merchant?.paymentTitle || 'Pay with Crypto'}" />
                    <small>What customers see at checkout</small>
                </div>
                <button type="submit" class="btn">Save Settings</button>
            </form>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
                <small style="color: #999;">
                    Webhook URL (add this to your Soltio Dashboard):<br/>
                    <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; color: #334155;">${CONFIG.appUrl}/webhooks/soltio</code>
                </small>
            </div>
        </div>
    </body>
    </html>
    `);
});

app.post('/settings/save', (req, res) => {
    const { shop } = req.query;
    const { soltio_api_key, ipn_secret, environment, payment_title } = req.body;

    const merchant = merchants.get(shop) || {};
    merchants.set(shop, {
        ...merchant,
        soltioApiKey: soltio_api_key,
        ipnSecret: ipn_secret,
        environment: environment,
        paymentTitle: payment_title || 'Pay with Crypto',
    });

    console.log(`✅ Settings saved for ${shop}`);
    res.redirect(`/settings?shop=${shop}&saved=true`);
});

// ═══════════════════════════════════════
//  Payment Flow — Create Checkout
// ═══════════════════════════════════════

/**
 * Called when a customer selects "Pay with Crypto" at checkout
 * Creates a Soltio invoice and returns the redirect URL
 */
app.post('/payments/create', async (req, res) => {
    const { shop } = req.query;
    const merchant = merchants.get(shop);

    if (!merchant || !merchant.soltioApiKey) {
        return res.status(400).json({ error: 'Soltio not configured for this store' });
    }

    const { order_id, amount, currency, customer_email, cancel_url, line_items } = req.body;

    // Build order description from line items
    const description = line_items
        ? line_items.map(item => `${item.title} x${item.quantity}`).join(', ')
        : `Order from ${shop}`;

    try {
        const apiUrl = merchant.environment === 'test'
            ? CONFIG.soltioApiUrl
            : CONFIG.soltioApiUrl;

        const response = await axios.post(`${apiUrl}/api/v1/create-invoice`, {
            amount: parseFloat(amount),
            currency: currency || 'USD',
            orderId: String(order_id),
            orderDescription: description,
            customerEmail: customer_email,
            successUrl: `${CONFIG.appUrl}/payments/success?shop=${shop}&order_id=${order_id}`,
            cancelUrl: cancel_url || `https://${shop}/checkout`,
            ipnCallbackUrl: `${CONFIG.appUrl}/webhooks/soltio?shop=${shop}`,
        }, {
            headers: {
                'Authorization': `Bearer ${merchant.soltioApiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        const data = response.data;
        const paymentUrl = data.paymentUrl || data.data?.paymentUrl;
        const invoiceId = data.invoiceId || data.data?.invoiceId;

        if (!paymentUrl) {
            throw new Error('No payment URL returned from Soltio');
        }

        // Store the invoice mapping
        merchants.set(`invoice_${invoiceId}`, {
            shop,
            orderId: order_id,
            amount,
            currency,
            createdAt: new Date().toISOString(),
        });

        console.log(`💰 Payment created: Invoice ${invoiceId} for order ${order_id} on ${shop}`);

        res.json({
            success: true,
            redirect_url: paymentUrl,
            invoice_id: invoiceId,
        });

    } catch (error) {
        console.error('Payment creation error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error || 'Failed to create payment',
        });
    }
});

/**
 * Payment success redirect — customer lands here after paying
 */
app.get('/payments/success', (req, res) => {
    const { shop, order_id } = req.query;
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Processing</title>
        <style>
            body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f6f6f7; margin: 0; }
            .container { text-align: center; padding: 40px; }
            .spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top: 3px solid #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            h2 { color: #1a1a1a; font-size: 20px; margin-bottom: 8px; }
            p { color: #666; font-size: 14px; }
        </style>
        <script>
            // Redirect back to the Shopify order confirmation after a moment
            setTimeout(function() {
                window.location.href = 'https://${shop}/orders/${order_id}';
            }, 3000);
        </script>
    </head>
    <body>
        <div class="container">
            <div class="spinner"></div>
            <h2>Payment Received!</h2>
            <p>Your crypto payment is being confirmed on the blockchain.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Redirecting you back to the store...</p>
        </div>
    </body>
    </html>
    `);
});

// ═══════════════════════════════════════
//  Webhooks — Soltio IPN Handler
// ═══════════════════════════════════════

/**
 * Receives Instant Payment Notifications from Soltio
 * Updates the Shopify order status accordingly
 */
app.post('/webhooks/soltio', async (req, res) => {
    const { shop } = req.query;
    const payload = req.body;

    // Verify signature
    const signature = req.headers['x-soltio-signature'];
    const merchant = merchants.get(shop);

    if (merchant?.ipnSecret && signature) {
        if (!verifySoltioSignature(payload, signature)) {
            console.error('❌ IPN signature verification failed');
            return res.status(401).json({ error: 'Signature verification failed' });
        }
    }

    const { orderId, status, transactionId, actualAmount, expectedAmount } = payload;
    console.log(`📬 IPN received: Order ${orderId} on ${shop} → ${status}`);

    if (!merchant?.accessToken) {
        console.error('No access token for shop:', shop);
        return res.status(400).json({ error: 'Shop not configured' });
    }

    try {
        const shopify = new Shopify({
            shopName: shop.replace('.myshopify.com', ''),
            accessToken: merchant.accessToken,
        });

        switch (status?.toUpperCase()) {
            case 'FINISHED':
            case 'COMPLETED':
            case 'CONFIRMED':
                // Mark order as paid
                await shopify.order.update(parseInt(orderId), {
                    financial_status: 'paid',
                    note: `Soltio crypto payment confirmed. TX: ${transactionId || 'N/A'}`,
                    tags: 'soltio-paid, crypto-payment',
                });
                console.log(`✅ Order ${orderId} marked as PAID`);
                break;

            case 'CONFIRMING':
            case 'SENDING':
                await shopify.order.update(parseInt(orderId), {
                    note: `Soltio: Payment is being confirmed on the blockchain...`,
                    tags: 'soltio-confirming, crypto-payment',
                });
                break;

            case 'PARTIALLY_PAID':
                await shopify.order.update(parseInt(orderId), {
                    financial_status: 'partially_paid',
                    note: `Soltio: Partial payment received. Expected: ${expectedAmount}, Received: ${actualAmount}`,
                    tags: 'soltio-partial, crypto-payment',
                });
                break;

            case 'EXPIRED':
                await shopify.order.update(parseInt(orderId), {
                    note: `Soltio: Payment expired — no crypto payment received.`,
                    tags: 'soltio-expired',
                });
                break;

            case 'FAILED':
            case 'REFUNDED':
                await shopify.order.update(parseInt(orderId), {
                    financial_status: 'voided',
                    note: `Soltio: Payment ${status.toLowerCase()}.`,
                    tags: `soltio-${status.toLowerCase()}`,
                });
                break;

            default:
                console.log(`Unknown IPN status: ${status}`);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Shopify order update error:', error.message);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ═══════════════════════════════════════
//  Shopify Webhooks — App Lifecycle
// ═══════════════════════════════════════

/**
 * Handle app uninstall
 */
app.post('/webhooks/app/uninstalled', (req, res) => {
    const shop = req.headers['x-shopify-shop-domain'];
    merchants.delete(shop);
    console.log(`🗑️ App uninstalled from ${shop}`);
    res.status(200).send('OK');
});

/**
 * GDPR: Customer data request
 */
app.post('/webhooks/gdpr/customers/data_request', (req, res) => {
    console.log('GDPR: Customer data request received');
    res.status(200).send('OK');
});

/**
 * GDPR: Customer data erasure
 */
app.post('/webhooks/gdpr/customers/redact', (req, res) => {
    console.log('GDPR: Customer data erasure request received');
    res.status(200).send('OK');
});

/**
 * GDPR: Shop data erasure
 */
app.post('/webhooks/gdpr/shop/redact', (req, res) => {
    const shop = req.body.shop_domain;
    merchants.delete(shop);
    console.log(`GDPR: Shop data erased for ${shop}`);
    res.status(200).send('OK');
});

// ═══════════════════════════════════════
//  Health Check & Homepage
// ═══════════════════════════════════════

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Soltio for Shopify</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020617; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { text-align: center; max-width: 500px; padding: 60px 40px; }
            .logo { width: 64px; height: 64px; background: #4f46e5; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
            .logo svg { width: 36px; height: 36px; }
            h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
            h1 span { color: #818cf8; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
            .btn { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
            .btn:hover { background: #4338ca; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 40px; text-align: left; }
            .feature { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; }
            .feature h4 { font-size: 13px; color: #c7d2fe; margin-bottom: 4px; }
            .feature p { font-size: 12px; color: #64748b; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo"><svg viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div>
            <h1>Soltio <span>for Shopify</span></h1>
            <p>Accept Bitcoin, Ethereum, USDT and 100+ other cryptocurrencies on your Shopify store.</p>
            <a href="/auth?shop=your-store.myshopify.com" class="btn">Install on Shopify →</a>
            <div class="features">
                <div class="feature"><h4>⚡ Instant Setup</h4><p>No coding needed.</p></div>
                <div class="feature"><h4>🔒 Secure</h4><p>HMAC-SHA512 verification.</p></div>
                <div class="feature"><h4>💰 100+ Cryptos</h4><p>BTC, ETH, USDT, SOL...</p></div>
                <div class="feature"><h4>📊 Auto Sync</h4><p>Orders update automatically.</p></div>
            </div>
        </div>
    </body>
    </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0', uptime: process.uptime() });
});

// ─── Start Server ───
app.listen(PORT, () => {
    console.log('');
    console.log('  ⚡ Soltio Shopify Payment App');
    console.log(`  🌐 Running on http://localhost:${PORT}`);
    console.log(`  📡 Webhook URL: ${CONFIG.appUrl}/webhooks/soltio`);
    console.log('');
});
