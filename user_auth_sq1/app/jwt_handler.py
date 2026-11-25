import os
from dotenv import load_dotenv
import jwt
from datetime import timedelta, datetime, timezone
load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))     
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")


def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    playload = {
        'sub': str(user_id),
        'iat': now,
        'exp': now + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        'type': 'access'
    }
    return jwt.encode(playload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_access_token(token: str):
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    if payload.get('type') != 'access':
        raise jwt.InvalidTokenError('Invalid token type')
    user_id = payload.get('sub')
    if not isinstance(user_id, str) or not user_id.isdecimal():
        raise jwt.InvalidTokenError('Invalid user ID')  
    return int(user_id)