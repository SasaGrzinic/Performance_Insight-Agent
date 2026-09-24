"""Persist organization posts separately from daily account metrics."""

import sqlalchemy as sa
from alembic import op

revision = "002_linkedin_posts"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "linkedin_posts",
        sa.Column("id", sa.String(200), primary_key=True),
        sa.Column("organization", sa.String(100), nullable=False),
        sa.Column("published_at", sa.String(40), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_linkedin_posts_organization", "linkedin_posts", ["organization"])
    op.create_index("ix_linkedin_posts_published_at", "linkedin_posts", ["published_at"])


def downgrade():
    op.drop_table("linkedin_posts")
