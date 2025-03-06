import bcrypt

password1 = 'qwerty'

def hash_password(password: str) -> bytes:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt)


print(hash_password(password1))
