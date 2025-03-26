from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AuthorizationSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)

    model_config = ConfigDict(extra="forbid")


class UserRegisterSchema(AuthorizationSchema):
    password_repeat: str


class UserLoginSchema(AuthorizationSchema):
    pass


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
