import { NextResponse } from 'next/server';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Plugin file mappings — which files go into each plugin's zip
const pluginFiles: Record<string, { basePath: string; zipName: string; folderName: string }> = {
    woocommerce: {
        basePath: path.join(process.cwd(), '..', 'plugins', 'woocommerce'),
        zipName: 'soltio-woocommerce-gateway.zip',
        folderName: 'soltio-woocommerce-gateway',
    },
    shopify: {
        basePath: path.join(process.cwd(), '..', 'plugins', 'shopify'),
        zipName: 'soltio-shopify-app.zip',
        folderName: 'soltio-shopify-app',
    },
    magento: {
        basePath: path.join(process.cwd(), '..', 'plugins', 'magento'),
        zipName: 'soltio-magento2-payment.zip',
        folderName: 'soltio-magento2-payment',
    },
    opencart: {
        basePath: path.join(process.cwd(), '..', 'plugins', 'opencart'),
        zipName: 'soltio-opencart-extension.ocmod.zip',
        folderName: 'upload',
    },
    wordpress: {
        basePath: path.join(process.cwd(), '..', 'plugins', 'wordpress'),
        zipName: 'soltio-wordpress-pay.zip',
        folderName: 'soltio-wordpress-pay',
    },
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ pluginId: string }> }
) {
    const { pluginId } = await params;

    const pluginConfig = pluginFiles[pluginId];

    if (!pluginConfig) {
        return NextResponse.json(
            { error: 'Plugin not found. Available: ' + Object.keys(pluginFiles).join(', ') },
            { status: 404 }
        );
    }

    // Check if plugin directory exists
    if (!fs.existsSync(pluginConfig.basePath)) {
        return NextResponse.json(
            { error: 'Plugin source files not found on server.' },
            { status: 500 }
        );
    }

    try {
        // Create an in-memory zip
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        // Collect data into buffer
        await new Promise<void>((resolve, reject) => {
            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve());
            archive.on('error', (err: Error) => reject(err));

            // Add all files from the plugin directory recursively
            archive.directory(pluginConfig.basePath, pluginConfig.folderName);

            archive.finalize();
        });

        const zipBuffer = Buffer.concat(chunks);

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${pluginConfig.zipName}"`,
                'Content-Length': zipBuffer.length.toString(),
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Zip creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create plugin archive.' },
            { status: 500 }
        );
    }
}

function generateReadme(pluginId: string): string {
    if (pluginId === 'woocommerce') {
        return `# Soltio WooCommerce Payment Gateway

## Installation

1. Download this zip file
2. Go to your WordPress Admin → Plugins → Add New → Upload Plugin
3. Select this .zip file and click "Install Now"
4. Click "Activate Plugin"
5. Go to WooCommerce → Settings → Payments → Soltio Crypto Payments
6. Enter your API Key (get one from https://soltio.com/dashboard/api-keys)
7. Enable the payment method and save

## Configuration

| Setting | Description |
|---------|-------------|
| Title | What customers see at checkout (default: "Pay with Crypto") |
| Description | Payment method description |
| Test Mode | Enable sandbox testing |
| Live API Key | Your production API key |
| Test API Key | Your sandbox API key |
| API URL | Default: https://api.soltio.com |
| IPN Secret | For webhook signature verification |

## Webhook Setup

The plugin automatically registers a webhook endpoint at:
\`\`\`
https://yoursite.com/wc-api/soltio_ipn
\`\`\`

Add this URL in your Soltio Dashboard → Settings → Webhook URL.

## Support

- Documentation: https://soltio.com/api-docs
- Email: support@soltio.com

## License

MIT License
`;
    }

    if (pluginId === 'shopify') {
        return `# Soltio Shopify App
        
Please see the full documentation at https://soltio.com/api-docs for Shopify installation.`;
    }

    if (pluginId === 'magento') {
        return `# Soltio Magento 2 Payment Extension

## Installation
1. Extract the contents into \`app/code/Soltio/Payment\`
2. Run \`bin/magento module:enable Soltio_Payment\`
3. Run \`bin/magento setup:upgrade\`
4. Run \`bin/magento setup:di:compile\`
5. Go to Magento Admin -> Stores -> Configuration -> Sales -> Payment Methods -> Soltio`;
    }

    if (pluginId === 'opencart') {
        return `# Soltio OpenCart Payment Extension

## Installation
1. In OpenCart Admin, go to Extensions -> Installer
2. Upload the \`.ocmod.zip\` file
3. Go to Extensions -> Extensions -> Payments
4. Install and Configure Soltio Crypto Payments`;
    }

    return `# Soltio WordPress Pay Button

## Installation

1. Download this zip file
2. Go to your WordPress Admin → Plugins → Add New → Upload Plugin
3. Select this .zip file and click "Install Now"
4. Click "Activate Plugin"
5. Go to Settings → Soltio Payments
6. Enter your API Key

## Usage

### Payment Button
\`\`\`
[soltio_pay amount="50" currency="USD"]
[soltio_pay amount="99.99" currency="EUR" label="Buy Now"]
\`\`\`

### Donation Widget
\`\`\`
[soltio_donate]
[soltio_donate currency="EUR" title="Support Our Project"]
\`\`\`

## Button Styles

Choose from 3 built-in styles in the settings:
- **Default** — Indigo gradient
- **Dark** — Dark theme
- **Minimal** — Outline style

## Support

- Documentation: https://soltio.com/api-docs
- Email: support@soltio.com

## License

MIT License
`;
}
