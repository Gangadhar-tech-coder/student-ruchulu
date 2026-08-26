import json
import uuid
from flask import Blueprint, request, jsonify, current_app
from models import get_db, dict_from_row

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/api/orders", methods=["POST"])
def create_order():
    """Create a new order."""
    data = request.get_json(silent=True) or {}

    required_fields = ["customer_name", "customer_email", "customer_phone", "address", "city", "pincode", "items"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if not data["items"] or len(data["items"]) == 0:
        return jsonify({"error": "Cart is empty"}), 400

    order_id = f"SR-{uuid.uuid4().hex[:8].upper()}"
    total_amount = sum(item["price"] * item["quantity"] for item in data["items"])

    conn = None
    try:
        conn = get_db()
        conn.execute(
            """INSERT INTO orders (order_id, customer_name, customer_email, customer_phone,
               address, city, pincode, items, total_amount, payment_status, order_status, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                order_id,
                data["customer_name"],
                data["customer_email"],
                data["customer_phone"],
                data["address"],
                data["city"],
                data["pincode"],
                json.dumps(data["items"]),
                total_amount,
                data.get("payment_status", "pending"),
                "confirmed" if data.get("payment_status") == "paid" else "pending",
                data.get("notes", ""),
            ),
        )
        conn.commit()

        order = conn.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,)).fetchone()
        order_dict = dict_from_row(order)
    finally:
        if conn:
            conn.close()

    # Send email notification asynchronously in a background thread
    try:
        from utils.email_service import send_order_notification
        mail_config = {
            "MAIL_SERVER": current_app.config.get("MAIL_SERVER", "smtp.gmail.com"),
            "MAIL_PORT": current_app.config.get("MAIL_PORT", 465),
            "MAIL_USERNAME": current_app.config.get("MAIL_USERNAME", ""),
            "MAIL_PASSWORD": current_app.config.get("MAIL_PASSWORD", ""),
            "ADMIN_EMAIL": current_app.config.get("ADMIN_EMAIL", ""),
        }
        import threading
        threading.Thread(
            target=send_order_notification,
            args=(order_dict, mail_config),
            daemon=True,
        ).start()
    except Exception as e:
        print(f"Email notification dispatch error: {e}")

    return jsonify(order_dict), 201


@orders_bp.route("/api/orders", methods=["GET"])
def get_orders():
    """Get all orders (admin)."""
    status = request.args.get("status", "")
    payment_status = request.args.get("payment_status", "")

    conn = None
    try:
        conn = get_db()
        query = "SELECT * FROM orders"
        params = []
        conditions = []

        if status and status != "all":
            conditions.append("order_status = ?")
            params.append(status)

        if payment_status and payment_status != "all":
            conditions.append("payment_status = ?")
            params.append(payment_status)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY created_at DESC"

        orders = conn.execute(query, params).fetchall()
        result = []
        for order in orders:
            order_dict = dict_from_row(order)
            order_dict["items"] = json.loads(order_dict["items"])
            result.append(order_dict)

        return jsonify(result)
    finally:
        if conn:
            conn.close()


@orders_bp.route("/api/orders/<order_id>", methods=["GET"])
def get_order(order_id):
    """Get a single order by order_id."""
    conn = None
    try:
        conn = get_db()
        order = conn.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,)).fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        order_dict = dict_from_row(order)
        order_dict["items"] = json.loads(order_dict["items"])
        return jsonify(order_dict)
    finally:
        if conn:
            conn.close()


@orders_bp.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    """Update order status (admin) and send email alert to customer."""
    data = request.get_json(silent=True) or {}

    conn = None
    new_status = data.get("order_status")
    try:
        conn = get_db()
        order = conn.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,)).fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if new_status:
            conn.execute("UPDATE orders SET order_status = ? WHERE order_id = ?", (new_status, order_id))

        if "payment_status" in data:
            conn.execute("UPDATE orders SET payment_status = ? WHERE order_id = ?", (data["payment_status"], order_id))

        conn.commit()

        order = conn.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,)).fetchone()
        order_dict = dict_from_row(order)

        # Trigger order status email update to the customer asynchronously
        if new_status:
            try:
                from utils.email_service import send_order_status_update_email
                mail_config = {
                    "MAIL_SERVER": current_app.config.get("MAIL_SERVER", "smtp.gmail.com"),
                    "MAIL_PORT": current_app.config.get("MAIL_PORT", 465),
                    "MAIL_USERNAME": current_app.config.get("MAIL_USERNAME", ""),
                    "MAIL_PASSWORD": current_app.config.get("MAIL_PASSWORD", ""),
                }
                import threading
                threading.Thread(
                    target=send_order_status_update_email,
                    args=(order_dict, new_status, mail_config),
                    daemon=True,
                ).start()
            except Exception as mail_err:
                print(f"Failed to dispatch status update email: {mail_err}")

        order_dict["items"] = json.loads(order_dict["items"])
        return jsonify(order_dict)
    finally:
        if conn:
            conn.close()
