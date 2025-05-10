"""add default values into profile subs

Revision ID: bf8dd19fe260
Revises: beccb4af32e3
Create Date: 2025-05-10 21:47:22.207990

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bf8dd19fe260"
down_revision: Union[str, None] = "beccb4af32e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "followers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("follower_id", sa.Integer(), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("create_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["follower_id"],
            ["profiles.user_id"],
        ),
        sa.ForeignKeyConstraint(
            ["target_id"],
            ["profiles.user_id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_followers_id"), "followers", ["id"], unique=False)
    op.add_column(
        "profiles",
        sa.Column("subscribers_count", sa.Integer(), nullable=False),
    )
    op.add_column(
        "profiles",
        sa.Column("subscriptions_count", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("profiles", "subscriptions_count")
    op.drop_column("profiles", "subscribers_count")
    op.drop_index(op.f("ix_followers_id"), table_name="followers")
    op.drop_table("followers")
