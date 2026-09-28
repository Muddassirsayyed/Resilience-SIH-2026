import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("railopt.db")

def create_db_engine():
    # Attempt connecting to primary DATABASE_URL (e.g. PostgreSQL)
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=False
        )
        # Test connection
        with engine.connect() as conn:
            logger.info(f"Connected to primary database: {settings.DATABASE_URL}")
        return engine
    except Exception as e:
        logger.warning(
            f"Failed to connect to primary database ({settings.DATABASE_URL}). "
            f"Falling back to SQLite database ({settings.SQLITE_FALLBACK_URL}). Error: {e}"
        )
        # SQLite fallback for local development/testing
        fallback_engine = create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
        return fallback_engine

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Safely initialize database tables if they do not exist."""
    from app.models import Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
