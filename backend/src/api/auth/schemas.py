from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

from api.exceptions import BadRequestException


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)

    model_config = ConfigDict(extra="forbid")


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)
    password_repeat: str

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def check_password_match(self):
        if self.password != self.password_repeat:
            raise BadRequestException("Пароли не совпадают")
        return self


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class UserDataSchema(BaseModel):
    id: int
    email: str
    role: str
    create_date: datetime
    update_date: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponseSchema(BaseModel):
    user: UserDataSchema

    model_config = ConfigDict(from_attributes=True)
