"""add enums

Revision ID: dc0d8b1f65f7
Revises: 271c2b3c8a9d
Create Date: 2025-05-16 10:04:15.488037

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "dc0d8b1f65f7"
down_revision: Union[str, None] = "271c2b3c8a9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Сначала создаем enum типы
    courses_enum = postgresql.ENUM(
        "course1",
        "course2",
        "course3",
        "course4",
        "course5",
        "mag1",
        "mag2",
        name="courses",
    )
    courses_enum.create(op.get_bind())

    sex_enum = postgresql.ENUM("male", "female", name="sex")
    sex_enum.create(op.get_bind())

    faculties_enum = postgresql.ENUM(
        "cithin", "npm", "hft", "ipur", "fen", name="muctrfaculties"
    )
    faculties_enum.create(op.get_bind())

    # Затем изменяем колонки, используя созданные enum типы
    op.alter_column(
        "profiles",
        "course",
        type_=courses_enum,
        postgresql_using="course::text::courses",
    )
    op.alter_column(
        "profiles", "sex", type_=sex_enum, postgresql_using="sex::text::sex"
    )
    op.alter_column(
        "profiles",
        "faculty",
        type_=faculties_enum,
        postgresql_using="faculty::text::muctrfaculties",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Возвращаем обратно VARCHAR типы
    op.alter_column("profiles", "faculty", type_=sa.VARCHAR())
    op.alter_column("profiles", "sex", type_=sa.VARCHAR())
    op.alter_column("profiles", "course", type_=sa.VARCHAR())

    # Удаляем enum типы
    op.execute("DROP TYPE IF EXISTS muctrfaculties")
    op.execute("DROP TYPE IF EXISTS sex")
    op.execute("DROP TYPE IF EXISTS courses")
