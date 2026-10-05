from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    citizen_name = Column(
        String(100),
        nullable=False,
    )

    emergency_type = Column(
        String(50),
        nullable=False,
    )

    severity = Column(
        String(20),
        default="medium",
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    status = Column(
        String(30),
        default="active",
        nullable=False,
    )

    # ========================================================
    # AI EMERGENCY INTELLIGENCE
    # ========================================================

    ai_confidence = Column(
        Integer,
        nullable=True,
    )

    priority_score = Column(
        Integer,
        nullable=True,
    )

    ai_recommendation = Column(
        Text,
        nullable=True,
    )

    hospital_required = Column(
        Integer,
        nullable=True,
    )

    recommended_hospital_type = Column(
        String(150),
        nullable=True,
    )

    # ========================================================
    # RESPONDER
    # ========================================================

    responder_name = Column(
        String(100),
        nullable=True,
    )

    responder_status = Column(
        String(30),
        nullable=True,
    )

    # ========================================================
    # HOSPITAL
    # ========================================================

    hospital_name = Column(
        String(100),
        nullable=True,
    )

    hospital_status = Column(
        String(30),
        nullable=True,
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )