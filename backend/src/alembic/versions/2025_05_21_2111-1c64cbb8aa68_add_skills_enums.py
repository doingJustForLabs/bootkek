"""add skills enums

Revision ID: 1c64cbb8aa68
Revises: dc0d8b1f65f7
Create Date: 2025-05-21 21:11:26.832942

"""

from datetime import datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from api.enums import Skills

# revision identifiers, used by Alembic.
revision: str = "1c64cbb8aa68"
down_revision: Union[str, None] = "dc0d8b1f65f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


skills_enum_type = postgresql.ENUM(
    *[skill.value for skill in Skills], name="skills_enum", create_type=True
)


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "skills",
        "skill_name",
        existing_type=sa.VARCHAR(length=30),
        type_=sa.String(length=128),
        existing_nullable=False,
    )

    skills_enum_type.create(op.get_bind())

    current_time = datetime.utcnow()
    skills_data = [
        {"skill_name": Skills.maths.value, "create_date": current_time},
        {"skill_name": Skills.cpp.value, "create_date": current_time},
        {"skill_name": Skills.cs.value, "create_date": current_time},
        {"skill_name": Skills.chem.value, "create_date": current_time},
        {"skill_name": Skills.physics.value, "create_date": current_time},
        {"skill_name": Skills.eng.value, "create_date": current_time},
        {"skill_name": Skills.plo.value, "create_date": current_time},
    ]

    op.bulk_insert(
        sa.Table(
            "skills",
            sa.MetaData(),
            # id обычно автоинкрементный и не включается в bulk_insert, если не задан явно
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("skill_name", sa.String(128), nullable=False),
            sa.Column("create_date", sa.DateTime(), nullable=False),
        ),
        skills_data,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "skills",
        "skill_name",
        existing_type=sa.String(length=128),
        type_=sa.VARCHAR(length=30),
        existing_nullable=False,
    )
    skills_enum_type.drop(op.get_bind())
