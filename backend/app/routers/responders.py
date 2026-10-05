from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident


router = APIRouter(
    prefix="/api/responders",
    tags=["Responders"],
)


@router.get("/incidents")
def get_responder_incidents(
    db: Session = Depends(get_db),
):
    incidents = (
        db.query(Incident)
        .filter(Incident.status != "completed")
        .order_by(Incident.created_at.desc())
        .all()
    )

    return incidents


@router.post("/incidents/{incident_id}/accept")
def accept_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    if incident.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="This incident is already completed.",
        )

    incident.responder_name = "SAHAY Responder"
    incident.responder_status = "assigned"
    incident.status = "assigned"

    db.commit()
    db.refresh(incident)

    return incident


@router.patch("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    allowed_statuses = [
        "assigned",
        "en_route",
        "arrived",
        "assisting",
        "completed",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {allowed_statuses}",
        )

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    incident.status = status
    incident.responder_status = status

    db.commit()
    db.refresh(incident)

    return incident