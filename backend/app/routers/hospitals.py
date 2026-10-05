from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident


router = APIRouter(
    prefix="/api/hospitals",
    tags=["Hospitals"],
)


# ============================================================
# GET INCOMING EMERGENCIES
# ============================================================

@router.get("/incidents")
def get_hospital_incidents(
    db: Session = Depends(get_db),
):
    """
    Return active emergencies that require hospital
    coordination.

    Highest-priority emergencies appear first.
    """

    incidents = (
        db.query(Incident)
        .filter(
            Incident.status != "completed",
            Incident.hospital_required == 1,
        )
        .order_by(
            Incident.priority_score.desc(),
            Incident.created_at.desc(),
        )
        .all()
    )

    return incidents


# ============================================================
# ACCEPT EMERGENCY
# ============================================================

@router.post("/incidents/{incident_id}/accept")
def accept_hospital_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    """
    Hospital accepts an incoming emergency
    and starts coordination.
    """

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found.",
        )

    if incident.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="This incident is already completed.",
        )

    if not incident.hospital_required:
        raise HTTPException(
            status_code=400,
            detail=(
                "Hospital coordination is not required "
                "for this emergency."
            ),
        )

    # Assign demo hospital.
    incident.hospital_name = "SAHAY Emergency Hospital"

    # First hospital state.
    incident.hospital_status = "accepted"

    db.commit()
    db.refresh(incident)

    return incident


# ============================================================
# UPDATE HOSPITAL STATUS
# ============================================================

@router.patch("/incidents/{incident_id}/status")
def update_hospital_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    """
    Update hospital preparation status.

    accepted
        Hospital has accepted the emergency.

    preparing
        Hospital is preparing emergency resources.

    ready
        Hospital is ready to receive the patient.

    unavailable
        Hospital cannot currently receive the patient.
    """

    allowed_statuses = [
        "accepted",
        "preparing",
        "ready",
        "unavailable",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid hospital status.",
                "allowed_statuses": allowed_statuses,
            },
        )

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found.",
        )

    if not incident.hospital_required:
        raise HTTPException(
            status_code=400,
            detail=(
                "Hospital coordination is not required "
                "for this emergency."
            ),
        )

    # Hospital must be assigned before changing
    # its operational status.
    if not incident.hospital_name:
        if status != "unavailable":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Hospital must accept the emergency "
                    "before updating its status."
                ),
            )

        incident.hospital_name = (
            "SAHAY Emergency Hospital"
        )

    incident.hospital_status = status

    db.commit()
    db.refresh(incident)

    return incident


# ============================================================
# HOSPITAL SUMMARY
# ============================================================

@router.get("/summary")
def get_hospital_summary(
    db: Session = Depends(get_db),
):
    """
    Dashboard summary for hospital operations.
    """

    incidents = (
        db.query(Incident)
        .filter(
            Incident.status != "completed",
            Incident.hospital_required == 1,
        )
        .all()
    )

    incoming = len(incidents)

    critical = sum(
        1
        for incident in incidents
        if incident.severity.lower() == "critical"
    )

    high = sum(
        1
        for incident in incidents
        if incident.severity.lower() == "high"
    )

    accepted = sum(
        1
        for incident in incidents
        if incident.hospital_status == "accepted"
    )

    preparing = sum(
        1
        for incident in incidents
        if incident.hospital_status == "preparing"
    )

    ready = sum(
        1
        for incident in incidents
        if incident.hospital_status == "ready"
    )

    unavailable = sum(
        1
        for incident in incidents
        if incident.hospital_status == "unavailable"
    )

    return {
        "incoming": incoming,
        "critical": critical,
        "high": high,
        "accepted": accepted,
        "preparing": preparing,
        "ready": ready,
        "unavailable": unavailable,
    }