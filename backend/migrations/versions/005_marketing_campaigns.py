"""Add the manually confirmed internal campaign registry."""

import sqlalchemy as sa
from alembic import op

revision = "005_marketing_campaigns"
down_revision = "004_mailchimp_campaigns"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "marketing_campaigns",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("objective", sa.String(40), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("owner", sa.String(120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("marketing_campaigns")
