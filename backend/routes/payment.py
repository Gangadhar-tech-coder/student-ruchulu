import razorpay
import hmac
import hashlib
from flask import Blueprint, request, jsonify, current_app

payment_bp = Blueprint("payment", __name__)


def get_razorpay_client():
    """Get Razorpay client instance."""
    return razorpay.Client(
        auth=(current_app.config["RAZORPAY_KEY_ID"], current_app.config["RAZORPAY_KEY_SECRET"])
    )


@payment_bp.route("/api/payment/create-order", methods=["POST"])
def create_payment_order():
    """Create a Razorpay payment order."""
    data = request.get_json()
    amount = data.get("amount", 0)

    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    try:
        client = get_razorpay_client()
        payment_order = client.order.create({
            "amount": int(amount * 100),  # Razorpay expects amount in paise
            "currency": "INR",
            "payment_capture": 1,
        })
        return jsonify({
            "order_id": payment_order["id"],
            "amount": payment_order["amount"],
            "currency": payment_order["currency"],
            "key_id": current_app.config["RAZORPAY_KEY_ID"],
        })
    except Exception as e:
        print(f"Razorpay order creation error: {e}")
        return jsonify({"error": "Failed to create payment order. Payment gateway may not be configured."}), 500


@payment_bp.route("/api/payment/verify", methods=["POST"])
def verify_payment():
    """Verify Razorpay payment signature."""
    data = request.get_json()

    razorpay_order_id = data.get("razorpay_order_id", "")
    razorpay_payment_id = data.get("razorpay_payment_id", "")
    razorpay_signature = data.get("razorpay_signature", "")

    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        return jsonify({"error": "Missing payment details"}), 400

    try:
        # Verify signature
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            current_app.config["RAZORPAY_KEY_SECRET"].encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()

        if expected_signature == razorpay_signature:
            return jsonify({"verified": True, "payment_id": razorpay_payment_id})
        else:
            return jsonify({"verified": False, "error": "Invalid signature"}), 400

    except Exception as e:
        print(f"Payment verification error: {e}")
        return jsonify({"error": "Payment verification failed"}), 500


@payment_bp.route("/api/payment/config", methods=["GET"])
def get_payment_config():
    """Get Razorpay public key for frontend."""
    return jsonify({
        "key_id": current_app.config["RAZORPAY_KEY_ID"],
    })
