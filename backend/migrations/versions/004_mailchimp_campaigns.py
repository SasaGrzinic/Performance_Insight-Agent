"""Persist sent mailing metadata without subscriber data."""

import sqlalchemy as sa
from alembic import op

revision = "004_mailchimp_campaigns"
down_revision = "003_linkedin_campaigns"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "mailchimp_campaigns",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("mailchimp_campaigns")
