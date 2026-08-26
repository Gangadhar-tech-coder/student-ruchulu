import random
import datetime
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, request, jsonify, current_app
from models import get_db, dict_from_row
from utils.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new customer with email and password."""
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", "")).strip()
        name = str(data.get("name", "")).strip()
        phone = str(data.get("phone", "")).strip()

        if not email or "@" not in email:
            return jsonify({"error": "Valid Email address is required"}), 400
        if not password or len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        conn = get_db()
        existing = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return jsonify({"error": "An account with this email address already exists. Please log in."}), 400

        password_hash = generate_password_hash(password)
        cursor = conn.execute(
            """INSERT INTO users (name, email, phone, password_hash, address, city, pincode)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                name or email.split("@")[0],
                email,
                phone,
                password_hash,
                data.get("address", ""),
                data.get("city", ""),
                data.get("pincode", ""),
            ),
        )
        conn.commit()

        user_id = cursor.lastrowid
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        user_dict = dict_from_row(user)
        user_dict.pop("password_hash", None)

        token = jwt.encode(
            {
                "user_id": user_id,
                "email": email,
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({
            "message": "Account created successfully!",
            "token": token,
            "user": user_dict,
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error in register: {e}")
        return jsonify({"error": f"Failed to create account: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()


@auth_bp.route("/api/auth/login", methods=["POST"])
def login_user():
    """Authenticate customer with email and password."""
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", "")).strip()

        if not email or not password:
            return jsonify({"error": "Email and Password are required"}), 400

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        if not user:
            return jsonify({"error": "Account not found with this email. Please sign up."}), 404

        user_dict = dict_from_row(user)
        stored_hash = user_dict.get("password_hash", "")

        if stored_hash:
            if not check_password_hash(stored_hash, password):
                return jsonify({"error": "Invalid password"}), 401
        else:
            # Set password if existing account has no password yet
            new_hash = generate_password_hash(password)
            conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user["id"]))
            conn.commit()

        user_dict.pop("password_hash", None)

        token = jwt.encode(
            {
                "user_id": user["id"],
                "email": email,
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({
            "message": "Logged in successfully!",
            "token": token,
            "user": user_dict,
        })
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()


@auth_bp.route("/api/auth/me", methods=["GET"])
def get_me():
    """Get current user details from JWT token."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Token missing"}), 401

    conn = None
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload.get("user_id")

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_dict = dict_from_row(user)
        user_dict.pop("password_hash", None)

        # Get customer's past orders
        orders = conn.execute("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC", (user_dict["email"],)).fetchall()
        import json
        order_list = []
        for o in orders:
            od = dict_from_row(o)
            try:
                od["items"] = json.loads(od["items"])
            except Exception:
                pass
            order_list.append(od)

        user_dict["orders"] = order_list
        return jsonify(user_dict)
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if conn:
            conn.close()
