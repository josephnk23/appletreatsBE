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
            <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #333; font-family: Arial, sans-serif;">
                ${item.name}${item.selectedOptions?.length ? `<br/><span style="font-size: 12px; color: #666;">${item.selectedOptions.join(' · ')}</span>` : ''}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #333; text-align: center; font-family: Arial, sans-serif;">
                ${item.quantity}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #333; font-weight: 600; text-align: right; font-family: Arial, sans-serif;">
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
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border: 2px solid #1a1a1a;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color: #014086; padding: 30px; border-bottom: 2px solid #1a1a1a;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 28px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; font-family: Arial, sans-serif;">Apple Treats</div>
                                    </td>
                                    <td style="text-align: right; vertical-align: middle;">
                                        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ffffff; font-weight: 600; font-family: Arial, sans-serif;">Order Confirmation</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Success Banner -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8f8f8; border-bottom: 2px solid #1a1a1a;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <div style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; font-family: Arial, sans-serif;">Thank You For Your Order!</div>
                                        <div style="font-size: 14px; color: #666; font-family: Arial, sans-serif;">Hi ${order.customerName}, your order has been confirmed.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 25px 30px; border-bottom: 2px solid #1a1a1a;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 50%; vertical-align: top;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin-bottom: 6px; font-family: Arial, sans-serif;">Order Number</div>
                                        <div style="font-size: 16px; font-weight: 700; color: #014086; font-family: Arial, sans-serif;">${order.orderId}</div>
                                    </td>
                                    <td style="width: 50%; vertical-align: top; text-align: right;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin-bottom: 6px; font-family: Arial, sans-serif;">Order Date</div>
                                        <div style="font-size: 16px; font-weight: 600; color: #333; font-family: Arial, sans-serif;">${order.date}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping Address -->
                    <tr>
                        <td style="padding: 25px 30px; border-bottom: 2px solid #1a1a1a;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin-bottom: 12px; font-family: Arial, sans-serif;">Shipping Address</div>
                            <div style="font-size: 14px; line-height: 1.6; color: #333; font-family: Arial, sans-serif;">
                                <strong>${order.customerName}</strong><br />
                                ${order.shippingAddress.address}<br />
                                ${order.shippingAddress.city}, ${order.shippingAddress.region} ${order.shippingAddress.zipCode}<br />
                                ${order.shippingAddress.country}
                            </div>
                        </td>
                    </tr>

                    <!-- Items Header -->
                    <tr>
                        <td style="padding: 0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr style="background-color: #1a1a1a;">
                                    <td style="padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; font-weight: 700; font-family: Arial, sans-serif;">Item</td>
                                    <td style="padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; font-weight: 700; text-align: center; font-family: Arial, sans-serif;">Qty</td>
                                    <td style="padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; font-weight: 700; text-align: right; font-family: Arial, sans-serif;">Price</td>
                                </tr>
                                ${itemRows}
                            </table>
                        </td>
                    </tr>

                    <!-- Summary -->
                    <tr>
                        <td style="padding: 25px 30px; border-top: 2px solid #1a1a1a;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size: 14px; color: #666; padding: 8px 0; font-family: Arial, sans-serif;">Subtotal</td>
                                    <td style="font-size: 14px; color: #333; padding: 8px 0; text-align: right; font-family: Arial, sans-serif;">₵${order.subtotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #666; padding: 8px 0; font-family: Arial, sans-serif;">Shipping</td>
                                    <td style="font-size: 14px; color: #333; padding: 8px 0; text-align: right; font-family: Arial, sans-serif;">₵${order.shippingCost.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #666; padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-family: Arial, sans-serif;">Tax</td>
                                    <td style="font-size: 14px; color: #333; padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e5e5; font-family: Arial, sans-serif;">₵${order.tax.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 18px; font-weight: 700; color: #1a1a1a; padding: 16px 0 0; font-family: Arial, sans-serif;">Total</td>
                                    <td style="font-size: 18px; font-weight: 700; color: #014086; padding: 16px 0 0; text-align: right; font-family: Arial, sans-serif;">₵${order.total.toLocaleString()}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Track Order Button -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://appletreats.vercel.app/checkout/track?id=${order.orderId}" style="display: inline-block; background-color: #014086; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 16px 40px; border: 2px solid #1a1a1a; font-family: Arial, sans-serif;">Track Your Order</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 25px 30px; text-align: center;">
                            <p style="font-size: 12px; color: #999; margin: 0 0 8px; font-family: Arial, sans-serif;">Questions? Contact us at support@appletreats.com</p>
                            <p style="font-size: 12px; color: #666; margin: 0; font-family: Arial, sans-serif;">© 2026 Apple Treats. All rights reserved.</p>
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
