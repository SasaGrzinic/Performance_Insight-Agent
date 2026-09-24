"""Local runtime without Docker. Never for production; DB stays in .local/."""

import argparse
import os
import secrets
import subprocess
from pathlib import Path

from dotenv import dotenv_values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--scheduler",
        action="store_true",
        help="Enable scheduled synchronization and monthly reports for configured sources.",
    )
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    local = root / ".local"
    local.mkdir(exist_ok=True)
    env = os.environ.copy()
    # API and worker run from backend/, while the credential file is in the project root.
    for key, value in dotenv_values(root / ".env").items():
        if value is not None:
            env.setdefault(key, value)
    env.update(
        ENVIRONMENT="development",
        DATABASE_URL="sqlite:///" + str(local / "preview.db"),
        APP_ORIGIN="http://127.0.0.1:5173",
        COOKIE_SECURE="false",
        DEMO_ENABLED="true",
        ADMIN_USERNAME="admin",
        ADMIN_EMAIL="admin@localhost.invalid",
        ADMIN_PASSWORD=secrets.token_urlsafe(24),
    )
    credential = local / "admin-password.txt"
    if credential.exists():
        env["ADMIN_PASSWORD"] = credential.read_text().strip()
    else:
        credential.touch(mode=0o600)
        credential.write_text(env["ADMIN_PASSWORD"])
    python = str(root / ".venv/bin/python")
    subprocess.run(
        [python, "-m", "alembic", "upgrade", "head"],
        cwd=root / "backend",
        env=env,
        check=True,
    )
    commands = [
        [
            python,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ],
        [python, "-m", "app.jobs", "worker"],
    ]
    if args.scheduler:
        commands.append([python, "-m", "app.jobs", "scheduler"])
    processes = []
    try:
        for command in commands:
            processes.append(subprocess.Popen(command, cwd=root / "backend", env=env))
        processes[0].wait()
    except KeyboardInterrupt:
        pass
    finally:
        for process in processes:
            process.terminate()
        for process in processes:
            process.wait()


if __name__ == "__main__":
    main()
