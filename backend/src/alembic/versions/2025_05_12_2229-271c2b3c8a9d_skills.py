"""skills

Revision ID: 271c2b3c8a9d
Revises: bf8dd19fe260
Create Date: 2025-05-12 22:29:11.443332

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "271c2b3c8a9d"
down_revision: Union[str, None] = "bf8dd19fe260"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("skill_name", sa.String(length=30), nullable=False),
        sa.Column("create_date", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_skills_id"), "skills", ["id"], unique=False)
    op.create_table(
        "users_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("create_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["skill_id"],
            ["skills.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["profiles.user_id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_skills_id"), "users_skills", ["id"], unique=False)
    op.alter_column(
        "profiles",
        "avatar_basename",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_users_skills_id"), table_name="users_skills")
    op.drop_table("users_skills")
    op.drop_index(op.f("ix_skills_id"), table_name="skills")
    op.drop_table("skills")
    op.alter_column(
        "profiles",
        "avatar_basename",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )
