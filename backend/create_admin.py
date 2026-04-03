"""Create a superadmin user.

Usage:
    python create_admin.py <email> <password>
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import User
from auth import hash_password


def create_admin(email: str, password: str):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User {email} already exists (role: {existing.role})")
            return

        user = User(
            email=email,
            hashed_password=hash_password(password),
            role="superadmin",
            is_verified=True,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Superadmin created: {user.email} (id: {user.id})")
    except Exception as e:
        db.rollback()
        print(f"Failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    create_admin(sys.argv[1], sys.argv[2])
