from pydantic import BaseModel, EmailStr, Field


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)
    password_repeat: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)


class TokenInfo(BaseModel):
    access_token: str
    token_type: str = "Bearer"
