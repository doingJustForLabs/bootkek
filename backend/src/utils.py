from bcrypt import gensalt, hashpw, checkpw


def hash_password(password: str) -> str:
    salt = gensalt()
    return hashpw(password.encode(), salt).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    return checkpw(password.encode(), hashed_password.encode())


# print(verify_password('123', '$2b$12$zhUJZVQI/c3g/RoLgaRFNunZ4tCrWkpFI3rkD0iM6poSLMszxLGoC'))
