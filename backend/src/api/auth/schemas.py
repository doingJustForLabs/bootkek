from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)

    model_config = ConfigDict(extra="forbid")


class UserRegisterSchema(UserLoginSchema):
    password_repeat: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class UserDataSchema(BaseModel):
    email: str
    role: str
    create_date: datetime
    update_date: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponseSchema(BaseModel):
    user: UserDataSchema

    model_config = ConfigDict(from_attributes=True)
