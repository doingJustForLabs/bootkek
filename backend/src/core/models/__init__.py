"""
SQL Модели

Нужны для создания моделей(таблиц) SQL

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    ...
"""