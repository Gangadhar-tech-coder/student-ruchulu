import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "student-ruchulu-secret-key-change-in-production")
    DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "student_ruchulu.db")

    # Mail configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 465))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "false").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "studentruchulu@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "alvg liwz yjri eihg").replace(" ", "")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "studentruchulu@gmail.com")

    # Razorpay configuration
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_yourkeyhere")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "yoursecrethere")

    # Admin credentials
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")

    # JWT
    JWT_EXPIRATION_HOURS = 24
