"""skills

Revision ID: 6fa4329f34eb
Revises: 271c2b3c8a9d
Create Date: 2025-05-13 02:06:31.634748

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6fa4329f34eb"
down_revision: Union[str, None] = "271c2b3c8a9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""

