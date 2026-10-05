from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    citizen_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    emergency_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    severity: str = Field(
        default="medium",
        max_length=20,
    )

    description: Optional[str] = None

    latitude: Optional[float] = None

    longitude: Optional[float] = None


class IncidentResponse(BaseModel):
    id: int

    citizen_name: str

    emergency_type: str

    severity: str

    description: Optional[str] = None

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    status: str

    # AI
    ai_confidence: Optional[int] = None

    priority_score: Optional[int] = None

    ai_recommendation: Optional[str] = None

    hospital_required: Optional[bool] = None

    recommended_hospital_type: Optional[str] = None

    # Responder
    responder_name: Optional[str] = None

    responder_status: Optional[str] = None

    # Hospital
    hospital_name: Optional[str] = None

    hospital_status: Optional[str] = None

    # Timestamps
    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True