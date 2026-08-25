import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from models import get_db

admin_bp = Blueprint("admin", __name__)


def token_required(f):
    """Decorator to protect admin routes with JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


@admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Admin login endpoint."""
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")

    if username == current_app.config["ADMIN_USERNAME"] and password == current_app.config["ADMIN_PASSWORD"]:
        token = jwt.encode(
            {
                "user": username,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=current_app.config.get("JWT_EXPIRATION_HOURS", 24)),
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )
        return jsonify({"token": token, "username": username})

    return jsonify({"error": "Invalid credentials"}), 401


@admin_bp.route("/api/admin/verify", methods=["GET"])
@token_required
def verify_token():
    """Verify if the admin token is still valid."""
    return jsonify({"valid": True})


@admin_bp.route("/api/admin/dashboard", methods=["GET"])
@token_required
def dashboard_stats():
    """Get dashboard statistics."""
    conn = get_db()

    total_orders = conn.execute("SELECT COUNT(*) as count FROM orders").fetchone()["count"]
    total_revenue = conn.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'").fetchone()["total"]
    pending_orders = conn.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'").fetchone()["count"]
    confirmed_orders = conn.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'confirmed'").fetchone()["count"]
    processing_orders = conn.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'processing'").fetchone()["count"]
    shipped_orders = conn.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'shipped'").fetchone()["count"]
    delivered_orders = conn.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'").fetchone()["count"]
    total_products = conn.execute("SELECT COUNT(*) as count FROM products").fetchone()["count"]

    # Recent orders (last 5)
    recent_orders = conn.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5").fetchall()

    conn.close()

    import json
    recent = []
    for order in recent_orders:
        od = dict(order)
        od["items"] = json.loads(od["items"])
        recent.append(od)

    return jsonify({
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "processing_orders": processing_orders,
        "shipped_orders": shipped_orders,
        "delivered_orders": delivered_orders,
        "total_products": total_products,
        "recent_orders": recent,
    })
