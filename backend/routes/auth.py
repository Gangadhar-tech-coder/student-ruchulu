import random
import datetime
import jwt
from flask import Blueprint, request, jsonify, current_app
from models import get_db, dict_from_row
from utils.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    """Generate and send OTP code to mobile number or email."""
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        identifier = str(data.get("identifier", "")).strip()

        if not identifier:
            return jsonify({"error": "Mobile number or Email is required"}), 400

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(minutes=10)

        conn = get_db()
        conn.execute("DELETE FROM otps WHERE identifier = ?", (identifier,))
        conn.execute(
            "INSERT INTO otps (identifier, otp, expires_at) VALUES (?, ?, ?)",
            (identifier, otp, expires_at.isoformat()),
        )
        conn.commit()

        # Send via email if identifier contains '@'
        email_sent = False
        if "@" in identifier:
            try:
                mail_config = {
                    "MAIL_SERVER": current_app.config.get("MAIL_SERVER", "smtp.gmail.com"),
                    "MAIL_PORT": current_app.config.get("MAIL_PORT", 587),
                    "MAIL_USERNAME": current_app.config.get("MAIL_USERNAME", ""),
                    "MAIL_PASSWORD": current_app.config.get("MAIL_PASSWORD", ""),
                }
                email_sent = send_otp_email(identifier, otp, mail_config)
            except Exception as mail_err:
                print(f"Email send exception: {mail_err}")

        print(f"OTP for {identifier}: {otp}")

        return jsonify({
            "message": f"OTP sent to {identifier}",
            "identifier": identifier,
            "email_sent": email_sent,
            "dev_otp": otp,
        })
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error in send_otp: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()


@auth_bp.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP and authenticate user."""
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        identifier = str(data.get("identifier", "")).strip()
        otp_input = str(data.get("otp", "")).strip()
        name = str(data.get("name", "")).strip()

        if not identifier or not otp_input:
            return jsonify({"error": "Identifier and OTP are required"}), 400

        conn = get_db()
        record = conn.execute(
            "SELECT * FROM otps WHERE identifier = ? AND otp = ?",
            (identifier, otp_input),
        ).fetchone()

        if not record:
            return jsonify({"error": "Invalid OTP verification code"}), 400

        # Check expiration safely
        try:
            exp_str = record["expires_at"]
            expires = datetime.datetime.fromisoformat(exp_str)
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=datetime.timezone.utc)
            now = datetime.datetime.now(datetime.timezone.utc)
            if now > expires:
                return jsonify({"error": "OTP has expired. Please request a new one."}), 400
        except Exception as tz_err:
            print(f"Expiration check warning: {tz_err}")

        # Delete used OTP
        conn.execute("DELETE FROM otps WHERE identifier = ?", (identifier,))

        # Find or create user
        is_email = "@" in identifier
        if is_email:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (identifier,)).fetchone()
        else:
            user = conn.execute("SELECT * FROM users WHERE phone = ?", (identifier,)).fetchone()

        if not user:
            cursor = conn.execute(
                """INSERT INTO users (name, email, phone)
                   VALUES (?, ?, ?)""",
                (
                    name or identifier.split("@")[0],
                    identifier if is_email else None,
                    identifier if not is_email else None,
                ),
            )
            user_id = cursor.lastrowid
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        else:
            user_id = user["id"]
            if name and not user["name"]:
                conn.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))

        conn.commit()

        user_dict = dict_from_row(user)

        # Issue JWT
        token = jwt.encode(
            {
                "user_id": user_id,
                "identifier": identifier,
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({
            "token": token,
            "user": user_dict,
        })
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error in verify_otp: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
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

        return jsonify(dict_from_row(user))
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if conn:
            conn.close()
