from pydantic import BaseModel, EmailStr


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool
