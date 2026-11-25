from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
ph = PasswordHasher()
def hash_password(password: str):
    return ph.hash(password)
def verify_password(hashed_password: str, plain_password: str):
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError):
        return False
        