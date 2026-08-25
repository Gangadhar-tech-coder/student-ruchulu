"""Seed the database with sample products (Pickles & Snacks only) with real snack images."""
import os
from models import get_db, init_db

PRODUCTS = [
    # Pickles
    {
        "name": "Avakaya (Mango Pickle)",
        "description": "Authentic Andhra-style raw mango pickle made with fresh mustard powder, red chili, and cold-pressed sesame oil. A taste of home in every bite!",
        "price": 299,
        "category": "pickles",
        "image_url": "/images/avakaya.jpg",
        "weight": "500g",
        "spice_level": 4,
        "is_bestseller": 1,
    },
    {
        "name": "Gongura Pickle",
        "description": "Tangy and spicy sorrel leaves pickle, a signature Andhra delicacy. Perfectly balanced flavors that complement any meal.",
        "price": 249,
        "category": "pickles",
        "image_url": "/images/gongura.jpg",
        "weight": "500g",
        "spice_level": 3,
        "is_bestseller": 1,
    },
    {
        "name": "Lemon Pickle (Nimma Kaya)",
        "description": "Sun-ripened lemons preserved in aromatic spices with a perfect sweet-sour-spicy balance. Made the traditional way!",
        "price": 199,
        "category": "pickles",
        "image_url": "/images/lemon_pickle.jpg",
        "weight": "400g",
        "spice_level": 2,
        "is_bestseller": 0,
    },
    {
        "name": "Tomato Pickle",
        "description": "Rich and tangy tomato pickle cooked with garlic, fenugreek and red chili powder. Perfect with hot rice and ghee!",
        "price": 179,
        "category": "pickles",
        "image_url": "/images/tomato_pickle.jpg",
        "weight": "400g",
        "spice_level": 3,
        "is_bestseller": 0,
    },
    {
        "name": "Red Chili Pickle",
        "description": "Fiery stuffed red chili pickle with ground mustard and fenugreek. For those who love it extra hot! 🔥",
        "price": 279,
        "category": "pickles",
        "image_url": "/images/chili_pickle.jpg",
        "weight": "350g",
        "spice_level": 5,
        "is_bestseller": 0,
    },
    # Snacks with Real Photos
    {
        "name": "Murukku (Janthikalu)",
        "description": "Crispy, crunchy spiral snack made with rice flour and urad dal. Perfectly spiced and deep-fried to golden perfection.",
        "price": 199,
        "category": "snacks",
        "image_url": "/images/murukku.jpg",
        "weight": "300g",
        "spice_level": 1,
        "is_bestseller": 1,
    },
    {
        "name": "Mixture (Andhra Style)",
        "description": "A crunchy medley of sev, peanuts, curry leaves, and spiced lentils. The ultimate tea-time companion!",
        "price": 179,
        "category": "snacks",
        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800",
        "weight": "300g",
        "spice_level": 2,
        "is_bestseller": 0,
    },
    {
        "name": "Chegodi / Chegodilu",
        "description": "Traditional ring-shaped rice flour snack with cumin and sesame seeds. Light, crunchy, and irresistible!",
        "price": 159,
        "category": "snacks",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
        "weight": "250g",
        "spice_level": 1,
        "is_bestseller": 0,
    },
    {
        "name": "Pakodi (Masala Boondi)",
        "description": "Crispy besan boondi seasoned with curry leaves, green chili and peanuts. Addictively crunchy snack!",
        "price": 149,
        "category": "snacks",
        "image_url": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&q=80&w=800",
        "weight": "250g",
        "spice_level": 2,
        "is_bestseller": 0,
    },
]


def seed_products(force=False):
    """Seed the database with sample products."""
    init_db()
    conn = get_db()

    if force:
        conn.execute("DELETE FROM products")
        conn.commit()

    count = conn.execute("SELECT COUNT(*) as count FROM products").fetchone()["count"]
    if count > 0 and not force:
        print(f"Database already has {count} products. Skipping seed.")
        conn.close()
        return

    for product in PRODUCTS:
        conn.execute(
            """INSERT INTO products (name, description, price, category, image_url, weight, spice_level, is_bestseller)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                product["name"],
                product["description"],
                product["price"],
                product["category"],
                product["image_url"],
                product["weight"],
                product["spice_level"],
                product["is_bestseller"],
            ),
        )

    conn.commit()
    conn.close()
    print(f"Seeded {len(PRODUCTS)} products successfully!")


if __name__ == "__main__":
    seed_products(force=True)
