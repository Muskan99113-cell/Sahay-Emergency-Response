from app.database import Base, engine
from app.models.incident import Incident


def initialize_database():
    Base.metadata.create_all(bind=engine)
    print("SAHAY database initialized successfully.")


if __name__ == "__main__":
    initialize_database()