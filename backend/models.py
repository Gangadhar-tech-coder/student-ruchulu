import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "student_ruchulu.db")


def get_db():
    """Get a database connection with 30s lock timeout."""
    conn = sqlite3.connect(DATABASE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_db()
    try:
        cursor = conn.cursor()

        # Products table (pickles & snacks only)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT NOT NULL CHECK(category IN ('pickles', 'snacks')),
                image_url TEXT DEFAULT '',
                weight TEXT DEFAULT '250g',
                spice_level INTEGER DEFAULT 2 CHECK(spice_level BETWEEN 0 AND 5),
                is_bestseller INTEGER DEFAULT 0,
                is_available INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT DEFAULT '',
                email TEXT UNIQUE,
                phone TEXT DEFAULT '',
                password_hash TEXT DEFAULT '',
                address TEXT DEFAULT '',
                city TEXT DEFAULT '',
                pincode TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Migration: ensure password_hash exists if database was created earlier
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''")
        except Exception:
            pass

        # OTPs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                identifier TEXT NOT NULL,
                otp TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                pincode TEXT NOT NULL,
                items TEXT NOT NULL,
                total_amount REAL NOT NULL,
                payment_id TEXT DEFAULT '',
                payment_order_id TEXT DEFAULT '',
                payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
                order_status TEXT DEFAULT 'pending' CHECK(order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        print("Database initialized successfully!")
    finally:
        conn.close()


def dict_from_row(row):
    """Convert a sqlite3.Row to a dictionary."""
    if row is None:
        return None
    return dict(row)


def dicts_from_rows(rows):
    """Convert a list of sqlite3.Row to a list of dictionaries."""
    return [dict(row) for row in rows]


if __name__ == "__main__":
    init_db()
