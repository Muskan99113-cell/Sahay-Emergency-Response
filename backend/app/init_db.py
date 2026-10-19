
from app.database import Base, engine

# Import every model so SQLAlchemy registers its table.
from app.models.incident import Incident
from app.models.user import User


def initialize_database():
    Base.metadata.create_all(bind=engine)
    print("SAHAY database initialized successfully.")


if __name__ == "__main__":
    initialize_database()