from flask import Blueprint, request, jsonify
from models import get_db, dict_from_row, dicts_from_rows

products_bp = Blueprint("products", __name__)


@products_bp.route("/api/products", methods=["GET"])
def get_products():
    """Get all products with optional filters."""
    category = request.args.get("category", "")
    search = request.args.get("search", "")
    bestsellers = request.args.get("bestsellers", "")

    conn = get_db()
    query = "SELECT * FROM products WHERE is_available = 1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (name LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    if bestsellers == "true":
        query += " AND is_bestseller = 1"

    query += " ORDER BY is_bestseller DESC, created_at DESC"

    products = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify(dicts_from_rows(products))


@products_bp.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """Get a single product by ID."""
    conn = get_db()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(dict_from_row(product))


@products_bp.route("/api/products", methods=["POST"])
def create_product():
    """Create a new product (admin only)."""
    data = request.get_json()

    required_fields = ["name", "description", "price", "category"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO products (name, description, price, category, image_url, weight, spice_level, is_bestseller)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data["name"],
            data["description"],
            data["price"],
            data["category"],
            data.get("image_url", ""),
            data.get("weight", "250g"),
            data.get("spice_level", 2),
            data.get("is_bestseller", 0),
        ),
    )
    conn.commit()
    product_id = cursor.lastrowid

    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    return jsonify(dict_from_row(product)), 201


@products_bp.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """Update a product (admin only)."""
    data = request.get_json()

    conn = get_db()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not product:
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    fields = []
    values = []
    for key in ["name", "description", "price", "category", "image_url", "weight", "spice_level", "is_bestseller", "is_available"]:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])

    if fields:
        values.append(product_id)
        conn.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()

    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    return jsonify(dict_from_row(product))


@products_bp.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """Delete a product (admin only)."""
    conn = get_db()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not product:
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Product deleted successfully"})
