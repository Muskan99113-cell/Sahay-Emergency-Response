import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Production (Vercel) -> Neon PostgreSQL
# Local development -> SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Support both common PostgreSQL URL formats
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

else:
    # Local machine only
    DATABASE_URL = "sqlite:///./sahay.db"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()