from pydantic import BaseModel, EmailStr, Field


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    password_repeat: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    remember_me: bool
