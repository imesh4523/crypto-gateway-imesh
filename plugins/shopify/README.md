# Soltio for Shopify

Accept Bitcoin, Ethereum, USDT and 100+ other cryptocurrencies on your Shopify store.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `SHOPIFY_API_KEY` | From your [Shopify Partner Dashboard](https://partners.shopify.com) |
| `SHOPIFY_API_SECRET` | From your Shopify Partner Dashboard |
| `SOLTIO_API_KEY` | From [Soltio Dashboard](https://soltio.com/dashboard/api-keys) |
| `SOLTIO_API_URL` | Default: `https://api.soltio.com` |
| `SOLTIO_IPN_SECRET` | From Soltio Dashboard → Settings |
| `APP_URL` | Your server's public URL (e.g., `https://soltio-shopify.yoursite.com`) |

### 3. Run the App

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Create Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com)
2. Create a new app → **Custom app**
3. Set **App URL** to `https://your-app-domain.com`
4. Set **Redirect URL** to `https://your-app-domain.com/auth/callback`
5. Add the GDPR webhook URLs:
   - Customer data request: `https://your-app-domain.com/webhooks/gdpr/customers/data_request`
   - Customer data erasure: `https://your-app-domain.com/webhooks/gdpr/customers/redact`
   - Shop data erasure: `https://your-app-domain.com/webhooks/gdpr/shop/redact`

### 5. Install on a Store

Visit: `https://your-app-domain.com/auth?shop=your-store.myshopify.com`

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Shopify    │────►│  Soltio App  │────►│  Soltio API │
│   Store      │     │  (this app)  │     │             │
│              │◄────│              │◄────│             │
└─────────────┘     └──────────────┘     └─────────────┘
     │                     │                     │
     │                     │                     │
   Customer             OAuth &              Creates
   Checkout            Webhooks             Invoices
```

## Payment Flow

1. Customer selects "Pay with Crypto" at checkout
2. App creates a Soltio invoice via API
3. Customer is redirected to Soltio payment page
4. Customer pays with their preferred cryptocurrency
5. Soltio sends IPN webhook to this app
6. App updates the Shopify order status automatically

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth` | Start Shopify OAuth |
| GET | `/auth/callback` | OAuth callback |
| GET | `/settings` | App settings page |
| POST | `/settings/save` | Save settings |
| POST | `/payments/create` | Create crypto payment |
| GET | `/payments/success` | Payment success redirect |
| POST | `/webhooks/soltio` | Soltio IPN handler |
| POST | `/webhooks/app/uninstalled` | App uninstall handler |
| GET | `/health` | Health check |

## Support

- Documentation: [soltio.com/api-docs](https://soltio.com/api-docs)
- Email: support@soltio.com

## License

MIT
