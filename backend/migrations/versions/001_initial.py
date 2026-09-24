"""Initial schema. Immutable metadata snapshot lives beside this revision."""

from alembic import op

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    from migrations.schema_v1 import metadata

    metadata.create_all(op.get_bind())
    if op.get_bind().dialect.name == "postgresql":
        op.execute(
            "CREATE UNIQUE INDEX only_one_master_admin ON users (role) WHERE role = 'master_admin'"
        )


def downgrade():
    from migrations.schema_v1 import metadata

    metadata.drop_all(op.get_bind())
