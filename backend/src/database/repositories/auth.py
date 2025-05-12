# from datetime import datetime, timedelta
# from typing import Optional
#
# from pydantic import EmailStr
# from sqlalchemy import select, delete
# from sqlalchemy.ext.asyncio import AsyncSession
#
# from core.config import settings
# from database.models import User, UserSession
# from sqlalchemy.sql import text
#
# class UserAuthRepository:
#     @staticmethod
#     async def start_user(session: AsyncSession, email: EmailStr, password: str):
#         user = await session.scalar(select(User).where(User.email == email))
#
#         if not user:
#             session.add(
#                 User(
#                     email=email,
#                     password=password,
#                     create_date=datetime.now(),
#                     update_date=datetime.now(),
#                     active=True,
#                 )
#             ),
#             await session.commit()
#
#     @staticmethod
#     async def get_user_by_email(
#         session: AsyncSession, email: EmailStr
#     ) -> Optional[User]:
#         res = await session.execute(select(User).filter(User.email == email))
#         return res.scalars().first()
#
#     @staticmethod
#     async def get_user_by_user_id(
#         session: AsyncSession, user_id: int
#     ) -> Optional[User]:
#         res = await session.execute(select(User).filter(User.id == user_id))
#         return res.scalars().first()
#
#     @staticmethod
#     async def start_user_session(
#         session: AsyncSession, user_id: int, refresh_token: str
#     ):
#         await session.execute(delete(UserSession).where(UserSession.user_id == user_id))
#
#         time_offset: timedelta = settings.jwt.refresh_token.expires
#         current_datetime = datetime.now()
#         future_datetime = current_datetime + time_offset
#         session.add(
#             UserSession(
#                 user_id=user_id,
#                 refresh_token=refresh_token,
#                 start_date=current_datetime,
#                 end_date=future_datetime,
#             )
#         )
#         await session.commit()
#
#     @staticmethod
#     async def get_user_session_by_user_id(
#         session: AsyncSession, user_id: int
#     ) -> Optional[UserSession]:
#         res = await session.execute(
#             select(UserSession).filter(UserSession.user_id == user_id)
#         )
#         return res.scalars().first()
#
#     @staticmethod
#     async def get_user_session_by_token(
#         session: AsyncSession, refresh_token: str
#     ) -> Optional[UserSession]:
#         res = await session.execute(
#             select(UserSession).filter(UserSession.refresh_token == refresh_token)
#         )
#         return res.scalars().first()
#
#     @staticmethod
#     async def delete_user_session(
#         session: AsyncSession, user_id: int
#     ) -> Optional[UserSession]:
#         stmt = delete(UserSession).where(UserSession.user_id == user_id)
#         await session.execute(stmt)
#         await session.commit()

    # @staticmethod
    # async def get_all_users(db: AsyncSession):
    #     # Используем select для асинхронного получения всех пользователей
    #     result = await db.execute(select(User))
    #     return result.scalars().all()  # Получаем все объекты пользователей