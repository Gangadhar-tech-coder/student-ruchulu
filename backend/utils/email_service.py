import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json


def send_email(to_email, subject, html_content, config):
    """Generic helper to send HTML emails via SMTP."""
    try:
        if not config.get("MAIL_USERNAME") or not config.get("MAIL_PASSWORD"):
            print(f"⚠️ Email SMTP not configured. Skipping sending email to {to_email}")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["MAIL_USERNAME"]
        msg["To"] = to_email

        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(config["MAIL_SERVER"], config["MAIL_PORT"]) as server:
            server.starttls()
            server.login(config["MAIL_USERNAME"], config["MAIL_PASSWORD"])
            server.send_message(msg)

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_otp_email(email, otp, config):
    """Send OTP code for user authentication."""
    subject = f"🔐 {otp} is your Student Ruchulu Verification Code"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #fffaf3; margin: 0; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; }}
            .logo {{ background: linear-gradient(135deg, #d97706, #dc2626); color: white; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; margin-bottom: 16px; }}
            .otp-box {{ background: #fef3c7; border: 2px dashed #f59e0b; color: #92400e; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px; border-radius: 12px; margin: 24px 0; }}
            .footer {{ color: #a8a29e; font-size: 12px; margin-top: 24px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">SR</div>
            <h2>Email Login Verification</h2>
            <p>Use the OTP code below to sign in to Student Ruchulu:</p>
            <div class="otp-box">{otp}</div>
            <p style="font-size: 13px; color: #78716c;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
            <div class="footer">Student Ruchulu · Homemade Pickles & Snacks</div>
        </div>
    </body>
    </html>
    """
    return send_email(email, subject, html, config)


def send_order_notification(order_data, config):
    """Send order notification email to admin and order confirmation to customer."""
    items = json.loads(order_data["items"]) if isinstance(order_data["items"], str) else order_data["items"]
    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6;">{item['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6; text-align: center;">{item['quantity']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6; text-align: right;">₹{item['price']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6; text-align: right;">₹{item['price'] * item['quantity']}</td>
        </tr>
        """

    admin_subject = f"🛒 New Order #{order_data['order_id']} — ₹{order_data['total_amount']}"
    admin_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #fffaf3; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #d97706, #dc2626); padding: 24px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 22px; }}
            .body {{ padding: 24px; }}
            .info-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }}
            .info-box {{ background: #fffbf0; padding: 12px; border-radius: 8px; border: 1px solid #fde68a; }}
            .info-box label {{ font-size: 11px; color: #92400e; text-transform: uppercase; }}
            .info-box p {{ margin: 4px 0 0; font-weight: 600; color: #1c1917; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th {{ background: #fef3c7; padding: 10px; text-align: left; font-size: 12px; color: #92400e; }}
            .total-row {{ background: #fef3c7; font-weight: 700; font-size: 16px; }}
            .footer {{ padding: 16px 24px; text-align: center; color: #a8a29e; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛒 New Order Received!</h1>
                <p>Order #{order_data['order_id']}</p>
            </div>
            <div class="body">
                <div class="info-grid">
                    <div class="info-box">
                        <label>Customer</label>
                        <p>{order_data['customer_name']}</p>
                    </div>
                    <div class="info-box">
                        <label>Phone</label>
                        <p>{order_data['customer_phone']}</p>
                    </div>
                    <div class="info-box">
                        <label>Email</label>
                        <p>{order_data['customer_email']}</p>
                    </div>
                    <div class="info-box">
                        <label>Payment Status</label>
                        <p>{order_data.get('payment_status', 'pending').upper()}</p>
                    </div>
                </div>

                <div class="info-box" style="margin-bottom: 20px;">
                    <label>Delivery Address</label>
                    <p>{order_data['address']}, {order_data['city']} — {order_data['pincode']}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr class="total-row">
                            <td colspan="3" style="padding: 12px;">Grand Total</td>
                            <td style="padding: 12px; text-align: right;">₹{order_data['total_amount']}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="footer">Student Ruchulu Admin Alert</div>
        </div>
    </body>
    </html>
    """
    admin_to = config.get("ADMIN_EMAIL", config.get("MAIL_USERNAME"))
    send_email(admin_to, admin_subject, admin_html, config)

    # Send customer confirmation
    customer_email = order_data.get("customer_email")
    if customer_email:
        send_customer_order_confirmation(order_data, config)


def send_customer_order_confirmation(order_data, config):
    """Send order receipt to the customer's email."""
    customer_email = order_data["customer_email"]
    items = json.loads(order_data["items"]) if isinstance(order_data["items"], str) else order_data["items"]
    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6;">{item['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6; text-align: center;">{item['quantity']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f0e6d6; text-align: right;">₹{item['price'] * item['quantity']}</td>
        </tr>
        """

    subject = f"🎉 Order Confirmed #{order_data['order_id']} — Student Ruchulu"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #fffaf3; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #16a34a, #15803d); padding: 24px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 22px; }}
            .body {{ padding: 24px; }}
            .badge {{ display: inline-block; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 16px; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
            th {{ background: #fef3c7; padding: 10px; text-align: left; font-size: 12px; color: #92400e; }}
            .total-row {{ background: #fef3c7; font-weight: 700; font-size: 16px; }}
            .footer {{ padding: 20px; text-align: center; color: #a8a29e; font-size: 12px; border-top: 1px solid #f5f0eb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank You for Your Order! ❤️</h1>
                <p>Order #{order_data['order_id']}</p>
            </div>
            <div class="body">
                <p>Hi <strong>{order_data['customer_name']}</strong>,</p>
                <p>We are excited to prepare your delicious homemade treats! Here are your order details:</p>
                
                <div class="badge">Status: {order_data.get('order_status', 'CONFIRMED').upper()}</div>

                <div style="background: #fffbf0; padding: 14px; border-radius: 10px; border: 1px solid #fde68a;">
                    <strong>Delivery Address:</strong><br/>
                    {order_data['address']}, {order_data['city']} — {order_data['pincode']}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr class="total-row">
                            <td colspan="2" style="padding: 12px;">Amount Paid / Payable</td>
                            <td style="padding: 12px; text-align: right;">₹{order_data['total_amount']}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="footer">
                Student Ruchulu · Homemade Pickles & Snacks<br/>
                For any queries, reply directly to this email!
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(customer_email, subject, html, config)


def send_order_status_update_email(order_data, new_status, config):
    """Send order status update notification email to customer."""
    customer_email = order_data.get("customer_email")
    if not customer_email:
        return False

    status_colors = {
        "pending": ("#fef3c7", "#92400e"),
        "confirmed": ("#dbeafe", "#1e40af"),
        "processing": ("#e0e7ff", "#3730a3"),
        "shipped": ("#ede9fe", "#5b21b6"),
        "delivered": ("#dcfce7", "#166534"),
        "cancelled": ("#fee2e2", "#991b1b"),
    }
    bg_color, text_color = status_colors.get(new_status.lower(), ("#fde68a", "#92400e"))

    subject = f"📦 Order #{order_data['order_id']} Status Update: {new_status.upper()} — Student Ruchulu"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #fffaf3; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #d97706, #dc2626); padding: 24px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 22px; }}
            .body {{ padding: 28px; text-align: center; }}
            .status-card {{ background: {bg_color}; color: {text_color}; padding: 16px 24px; border-radius: 12px; display: inline-block; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }}
            .footer {{ padding: 20px; text-align: center; color: #a8a29e; font-size: 12px; border-top: 1px solid #f5f0eb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Status Update</h1>
                <p>Order #{order_data['order_id']}</p>
            </div>
            <div class="body">
                <p>Hi <strong>{order_data['customer_name']}</strong>,</p>
                <p>Your order status has been updated by our kitchen team:</p>
                
                <div class="status-card">
                    {new_status.upper()}
                </div>

                <p style="font-size: 14px; color: #57534e;">
                    Delivery Address: {order_data['address']}, {order_data['city']} — {order_data['pincode']}
                </p>
                <p style="font-size: 14px; font-weight: 700; color: #b91c1c;">
                    Total Amount: ₹{order_data['total_amount']}
                </p>
            </div>
            <div class="footer">
                Student Ruchulu · Homemade Pickles & Snacks<br/>
                Thank you for choosing Student Ruchulu!
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(customer_email, subject, html, config)
