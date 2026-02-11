interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    date: string;
    items: { name: string; quantity: number; price: number; selectedOptions?: string[] }[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: {
        address: string;
        city: string;
        region: string;
        zipCode: string;
        country: string;
    };
}

export function buildOrderConfirmationEmail(order: OrderEmailData): { subject: string; html: string } {
    const subject = `Order Confirmed — ${order.orderId} | Apple Treats`;

    const itemRows = order.items.map(item => `
        <tr>
            <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; font-family: 'Roboto', Arial, sans-serif;">
                ${item.name}${item.selectedOptions?.length ? `<br/><span style="font-size: 12px; color: #888;">${item.selectedOptions.join(' · ')}</span>` : ''}
            </td>
            <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #888; font-family: 'Roboto', Arial, sans-serif;">
                ${item.quantity}
            </td>
            <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a1a; font-weight: 500; text-align: right; font-family: 'Roboto', Arial, sans-serif;">
                ₵${(item.price * item.quantity).toLocaleString()}
            </td>
        </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation - ${order.orderId}</title>
    <!--[if mso]>
    <style>table,td,th { font-family: Arial, sans-serif !important; }</style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: 'Roboto', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7;">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background: #ffffff; border: 1px solid #e0e0e0;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color: #014086; padding: 32px 36px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 24px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px; font-family: 'Roboto', Arial, sans-serif;">Apple Treats</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; font-weight: 300; font-family: 'Roboto', Arial, sans-serif;">Premium Apple Products</div>
                                    </td>
                                    <td style="text-align: right; vertical-align: top;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.8); margin-bottom: 6px; font-weight: 500; font-family: 'Roboto', Arial, sans-serif;">Invoice</div>
                                        <div style="font-size: 16px; font-weight: 700; color: #ffffff; font-family: 'Roboto Mono', monospace;">${order.orderId}</div>
                                        <div style="font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; font-weight: 300; font-family: 'Roboto', Arial, sans-serif;">${order.date}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 32px 36px 0;">
                            <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 8px; font-weight: 500; font-family: 'Roboto', Arial, sans-serif;">Hi ${order.customerName},</p>
                            <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.6; font-family: 'Roboto', Arial, sans-serif;">Thank you for your order! Here's your confirmation and invoice.</p>
                        </td>
                    </tr>

                    <!-- Billed To / Shipping -->
                    <tr>
                        <td style="padding: 28px 36px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align: top; width: 50%;">
                                        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #014086; font-weight: 700; margin-bottom: 10px; font-family: 'Roboto', Arial, sans-serif;">Shipping To</div>
                                        <p style="font-size: 14px; line-height: 1.7; color: #444; margin: 0; font-family: 'Roboto', Arial, sans-serif;">
                                            <strong style="color: #1a1a1a; font-weight: 500;">${order.customerName}</strong><br />
                                            ${order.shippingAddress.address}<br />
                                            ${order.shippingAddress.city}, ${order.shippingAddress.region}<br />
                                            ${order.shippingAddress.country}
                                        </p>
                                    </td>
                                    <td style="vertical-align: top; text-align: right;">
                                        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #014086; font-weight: 700; margin-bottom: 10px; font-family: 'Roboto', Arial, sans-serif;">Payment</div>
                                        <span style="display: inline-block; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-family: 'Roboto', Arial, sans-serif;">Paid</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Items Table -->
                    <tr>
                        <td style="padding: 0 36px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; font-weight: 700; padding: 12px 16px; background-color: #014086; font-family: 'Roboto', Arial, sans-serif;">Item</th>
                                        <th style="text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; font-weight: 700; padding: 12px 16px; background-color: #014086; font-family: 'Roboto', Arial, sans-serif;">Qty</th>
                                        <th style="text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; font-weight: 700; padding: 12px 16px; background-color: #014086; font-family: 'Roboto', Arial, sans-serif;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Summary -->
                    <tr>
                        <td style="padding: 24px 36px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-left: auto; width: 260px; border: 1px solid #e0e0e0; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; border-bottom: 1px solid #f0f0f0; font-family: 'Roboto', Arial, sans-serif;">Subtotal</td>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; text-align: right; border-bottom: 1px solid #f0f0f0; font-family: 'Roboto', Arial, sans-serif;">₵${order.subtotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; border-bottom: 1px solid #f0f0f0; font-family: 'Roboto', Arial, sans-serif;">Shipping</td>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; text-align: right; border-bottom: 1px solid #f0f0f0; font-family: 'Roboto', Arial, sans-serif;">₵${order.shippingCost.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; border-bottom: 1px solid #e0e0e0; font-family: 'Roboto', Arial, sans-serif;">Tax</td>
                                    <td style="padding: 10px 16px; font-size: 14px; color: #666; text-align: right; border-bottom: 1px solid #e0e0e0; font-family: 'Roboto', Arial, sans-serif;">₵${order.tax.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 16px; font-size: 18px; font-weight: 900; color: #ffffff; background-color: #014086; font-family: 'Roboto', Arial, sans-serif;">Total</td>
                                    <td style="padding: 14px 16px; font-size: 18px; font-weight: 900; color: #ffffff; text-align: right; background-color: #014086; font-family: 'Roboto', Arial, sans-serif;">₵${order.total.toLocaleString()}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f5f5f7; padding: 24px 36px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="font-size: 13px; color: #888; margin: 0; font-family: 'Roboto', Arial, sans-serif;">Thank you for shopping with <strong style="color: #014086;">Apple Treats</strong>.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    return { subject, html };
}
