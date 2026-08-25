import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/api/upload", methods=["POST"])
def upload_file():
    """Upload an image file for menu items."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex[:8]}_{filename}"

        uploads_dir = os.path.join(current_app.root_path, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        file_path = os.path.join(uploads_dir, unique_filename)
        file.save(file_path)

        # Also copy to frontend public directory if it exists for local dev
        try:
            frontend_dir = os.path.abspath(os.path.join(current_app.root_path, "..", "frontend", "public", "uploads"))
            os.makedirs(frontend_dir, exist_ok=True)
            import shutil
            shutil.copy(file_path, os.path.join(frontend_dir, unique_filename))
        except Exception:
            pass

        image_url = f"/uploads/{unique_filename}"
        return jsonify({"image_url": image_url, "filename": unique_filename})

    return jsonify({"error": "File format not allowed. Allowed: png, jpg, jpeg, webp, gif"}), 400


@upload_bp.route("/uploads/<filename>")
def serve_upload(filename):
    """Serve uploaded images statically."""
    uploads_dir = os.path.join(current_app.root_path, "uploads")
    return send_from_directory(uploads_dir, filename)
