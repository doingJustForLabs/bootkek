"""nullable avatar basename

Revision ID: 6e986dfe551e
Revises: bf8dd19fe260
Create Date: 2025-05-13 02:21:59.820139

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6e986dfe551e"
down_revision: Union[str, None] = "bf8dd19fe260"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "profiles",
        "avatar_basename",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "profiles",
        "avatar_basename",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )
