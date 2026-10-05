from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incident Timeline"],
)


STATUS_LABELS = {
    "active": "SOS Created",
    "assigned": "Responder Assigned",
    "en_route": "Responder En Route",
    "arrived": "Responder Arrived",
    "assisting": "Emergency Assistance In Progress",
    "completed": "Emergency Completed",
}


@router.get("/{incident_id}/timeline")
def get_incident_timeline(
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

    current_status = incident.status or "active"

    status_order = [
        "active",
        "assigned",
        "en_route",
        "arrived",
        "assisting",
        "completed",
    ]

    try:
        current_index = status_order.index(current_status)
    except ValueError:
        current_index = 0

    timeline = []

    for index, status in enumerate(status_order):
        if index <= current_index:
            timeline.append(
                {
                    "status": status,
                    "title": STATUS_LABELS[status],
                    "completed": True,
                    "current": status == current_status,
                }
            )
        else:
            timeline.append(
                {
                    "status": status,
                    "title": STATUS_LABELS[status],
                    "completed": False,
                    "current": False,
                }
            )

    return {
        "incident_id": incident.id,
        "current_status": current_status,
        "timeline": timeline,
    }