from bcrypt import gensalt, hashpw, checkpw
import secrets


# Вызовите эту функцию для генерации секретного ключа
def generate_secret_key():
    return secrets.token_hex(32)


def hash_password(password: str) -> str:
    salt = gensalt()
    return hashpw(password.encode(), salt).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    return checkpw(password.encode(), hashed_password.encode())
