export const paymentSuccessTemplate = (brandName: string, amount: string, currency: string, txId: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f4f5f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: #10b981; padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; color: #334155; line-height: 1.6; }
        .amount-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: 800; color: #0f172a; margin: 8px 0; }
        .label { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .footer { padding: 30px; text-align: center; background: #f8fafc; font-size: 13px; color: #94a3b8; }
        .button { display: inline-block; padding: 14px 30px; background: #0f172a; color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; transition: all 0.2s; }
        .success-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon" style="font-size: 32px; line-height: 64px;">✓</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">Payment Confirmed!</h1>
        </div>
        <div class="content">
            <h2 style="color: #0f172a;">Hi there,</h2>
            <p>Great news! Your payment to <strong>${brandName}</strong> has been successfully processed.</p>
            
            <div class="amount-card">
                <div class="label">Amount Paid</div>
                <div class="amount">${amount} ${currency}</div>
                <div class="label" style="font-size: 12px; color: #94a3b8;">TxID: ${txId}</div>
            </div>
            
            <p>You can now close the checkout window. If you have any questions regarding your order, please contact the merchant directly.</p>
            
            <center>
                <a href="#" class="button">View Transaction</a>
            </center>
        </div>
        <div class="footer">
            <p>Sent via <strong>Gateway</strong> - Secure Crypto Payments</p>
            <p>&copy; 2026 ${brandName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
