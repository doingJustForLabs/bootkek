"""i love tg_id

Revision ID: 302e4e8c008e
Revises: 09ef42cf4a1d
Create Date: 2025-06-03 01:26:45.762737

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "302e4e8c008e"
down_revision: Union[str, None] = "09ef42cf4a1d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("profiles", sa.Column("tg_id", sa.Integer(), nullable=True))
    op.alter_column(
        "users", "activation_link", existing_type=sa.VARCHAR(), nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users", "activation_link", existing_type=sa.VARCHAR(), nullable=True
    )
    op.drop_column("profiles", "tg_id")

