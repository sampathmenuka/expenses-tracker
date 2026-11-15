"""Recolour built-in categories with a colour-blind-safe palette

Only categories still wearing their original default colour are changed,
so colours users picked themselves are left alone.

Revision ID: 0002
Revises: 0001
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# icon: (old colour, new colour)
RECOLOUR = {
    "food": ("#d6805d", "#2a78d6"),
    "transport": ("#4f8b83", "#eb6834"),
    "mobile": ("#657cc3", "#1baf7a"),
    "education": ("#a26caa", "#eda100"),
    "materials": ("#a78a64", "#e87ba4"),
    "clothes": ("#bf7488", "#008300"),
    "donations": ("#7fa36c", "#4a3aa7"),
    "other": ("#86949a", "#e34948"),
}

UPDATE = sa.text(
    "UPDATE categories SET color = :to WHERE is_custom = false AND icon = :icon "
    "AND lower(color) = :frm"
)


def upgrade() -> None:
    for icon, (old, new) in RECOLOUR.items():
        op.execute(UPDATE.bindparams(icon=icon, frm=old, to=new))


def downgrade() -> None:
    for icon, (old, new) in RECOLOUR.items():
        op.execute(UPDATE.bindparams(icon=icon, frm=new, to=old))
