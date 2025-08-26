import os
import datetime as dt
import jwt
from passlib.hash import bcrypt

SECRET = os.getenv("SECRET_KEY", "change-this-in-production")

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.verify(password, password_hash)

def create_token(payload: dict, expires_minutes=60*24):
    to_encode = payload.copy()
    to_encode["exp"] = dt.datetime.utcnow() + dt.timedelta(minutes=expires_minutes)
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

def decode_token(token: str):
    return jwt.decode(token, SECRET, algorithms=["HS256"])
