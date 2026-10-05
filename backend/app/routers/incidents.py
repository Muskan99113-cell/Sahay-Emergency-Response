from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
)
from app.services.ai_service import analyze_emergency


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"],
)


@router.post(
    "/",
    response_model=IncidentResponse,
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new SAHAY emergency incident.

    The emergency description is automatically analyzed
    by SAHAY Emergency Intelligence.
    """

    description = (
        incident_data.description
        or incident_data.emergency_type
        or "Emergency assistance requested."
    )

    # ========================================================
    # AI ANALYSIS
    # ========================================================

    ai_result = analyze_emergency(
        description
    )

    detected_emergency_type = (
        ai_result["emergency_type"]
    )

    detected_severity = (
        ai_result["severity"]
    )

    # ========================================================
    # DATABASE INCIDENT
    # ========================================================

    incident = Incident(
        citizen_name=incident_data.citizen_name,

        emergency_type=detected_emergency_type,

        severity=detected_severity,

        description=incident_data.description,

        latitude=incident_data.latitude,

        longitude=incident_data.longitude,

        status="active",

        # AI fields
        ai_confidence=ai_result["confidence"],

        priority_score=ai_result["priority_score"],

        ai_recommendation=ai_result["recommendation"],

        hospital_required=(
            1
            if ai_result["hospital_required"]
            else 0
        ),

        recommended_hospital_type=(
            ai_result[
                "recommended_hospital_type"
            ]
        ),
    )

    db.add(incident)

    db.commit()

    db.refresh(incident)

    return incident


@router.get(
    "/",
    response_model=list[IncidentResponse],
)
def get_incidents(
    db: Session = Depends(get_db),
):
    """
    Get all emergency incidents.
    """

    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return incidents


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single emergency incident.
    """

    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident