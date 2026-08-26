import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from models import init_db


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    # Initialize database
    with app.app_context():
        init_db()

    # Register blueprints
    from routes.products import products_bp
    from routes.orders import orders_bp
    from routes.payment import payment_bp
    from routes.admin import admin_bp
    from routes.auth import auth_bp
    from routes.upload import upload_bp

    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(upload_bp)

    # Serve uploads folder statically
    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        uploads_dir = os.path.join(app.root_path, "uploads")
        return send_from_directory(uploads_dir, filename)

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Student Ruchulu API is running!"}

    return app


if __name__ == "__main__":
    app = create_app()
    print("\nStudent Ruchulu API Server")
    print("=" * 40)
    print("Running on http://localhost:5000")
    print("API Docs: /api/health")
    print("=" * 40 + "\n")
    app.run(debug=True, port=5000)
