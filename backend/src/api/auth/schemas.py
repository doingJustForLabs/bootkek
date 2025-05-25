from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

from api.exceptions import BadRequestException


class UserLoginSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=6, max_length=30)


class UserRegisterSchema(UserLoginSchema):
    model_config = ConfigDict(extra="forbid")

    password_repeat: str

    @model_validator(mode="after")
    def check_password_match(self):
        if self.password != self.password_repeat:
            raise BadRequestException("Пароли не совпадают")
        return self


class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class UserReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: str
    role: str
    create_date: datetime
    update_date: datetime


class UserResponseSchema(BaseModel):
    user: UserReadSchema
