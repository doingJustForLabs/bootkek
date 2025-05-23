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
    postgresql.ENUM(
        "course1",
        "course2",
        "course3",
        "course4",
        "course5",
        "mag1",
        "mag2",
        name="courses",
    ).create(op.get_bind())

    postgresql.ENUM("male", "female", name="sex").create(op.get_bind())

    postgresql.ENUM(
        "cithin", "npm", "hft", "ipur", "fen", name="muctrfaculties"
    ).create(op.get_bind())

    op.alter_column(
        "profiles",
        "course",
        type_=sa.Enum("math", "physics", "chemistry", name="courses"),
        postgresql_using="course::text::courses",
    )

    op.alter_column(
        "profiles",
        "course",
        existing_type=sa.VARCHAR(),
        type_=sa.Enum(
            "course1",
            "course2",
            "course3",
            "course4",
            "course5",
            "mag1",
            "mag2",
            name="courses",
        ),
        existing_nullable=True,
        postgresql_using="course::text::courses",
    )
    op.alter_column(
        "profiles",
        "sex",
        existing_type=sa.VARCHAR(),
        type_=sa.Enum("male", "female", name="sex"),
        existing_nullable=True,
        postgresql_using="sex::text::sex",
    )
    op.alter_column(
        "profiles",
        "faculty",
        existing_type=sa.VARCHAR(),
        type_=sa.Enum("cithin", "npm", "hft", "ipur", "fen", name="muctrfaculties"),
        existing_nullable=True,
        postgresql_using="faculty::text::muctrfaculties",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "profiles",
        "faculty",
        existing_type=sa.Enum(
            "cithin", "npm", "hft", "ipur", "fen", name="muctrfaculties"
        ),
        type_=sa.VARCHAR(),
        existing_nullable=True,
    )
    op.alter_column(
        "profiles",
        "sex",
        existing_type=sa.Enum("male", "female", name="sex"),
        type_=sa.VARCHAR(),
        existing_nullable=True,
    )
    op.alter_column(
        "profiles",
        "course",
        existing_type=sa.Enum(
            "course1",
            "course2",
            "course3",
            "course4",
            "course5",
            "mag1",
            "mag2",
            name="courses",
        ),
        type_=sa.VARCHAR(),
        existing_nullable=True,
    )

    postgresql.ENUM(name="courses").drop(op.get_bind())
    postgresql.ENUM(name="sex").drop(op.get_bind())
    postgresql.ENUM(name="muctrfaculties").drop(op.get_bind())
