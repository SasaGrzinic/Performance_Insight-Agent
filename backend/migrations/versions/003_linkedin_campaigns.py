"""Store campaign identity independently of reporting months."""

import sqlalchemy as sa
from alembic import op

revision = "003_linkedin_campaigns"
down_revision = "002_linkedin_posts"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "linkedin_campaigns",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("account", sa.String(100), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_linkedin_campaigns_account", "linkedin_campaigns", ["account"])


def downgrade():
    op.drop_table("linkedin_campaigns")
