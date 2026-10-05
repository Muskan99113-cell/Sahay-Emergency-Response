from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident


router = APIRouter(
    prefix="/api/authority",
    tags=["Authority"],
)


@router.get("/dashboard")
def get_authority_dashboard(
    db: Session = Depends(get_db),
):
    """
    Get emergency overview for the Authority Command Center.
    """

    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    active_incidents = [
        incident
        for incident in incidents
        if incident.status != "completed"
    ]

    critical_count = sum(
        1
        for incident in active_incidents
        if incident.severity.lower() == "critical"
    )

    high_count = sum(
        1
        for incident in active_incidents
        if incident.severity.lower() == "high"
    )

    medium_count = sum(
        1
        for incident in active_incidents
        if incident.severity.lower() == "medium"
    )

    low_count = sum(
        1
        for incident in active_incidents
        if incident.severity.lower() == "low"
    )

    assigned_responders = sum(
        1
        for incident in active_incidents
        if incident.responder_name
    )

    hospital_assigned = sum(
        1
        for incident in active_incidents
        if incident.hospital_name
    )

    return {
        "summary": {
            "total_incidents": len(incidents),
            "active_incidents": len(active_incidents),
            "critical_incidents": critical_count,
            "high_incidents": high_count,
            "medium_incidents": medium_count,
            "low_incidents": low_count,
            "assigned_responders": assigned_responders,
            "hospital_assigned": hospital_assigned,
        },
        "incidents": active_incidents,
    }