from fastapi import APIRouter

from app.schemas.ai import (
    EmergencyAnalysisRequest,
    EmergencyAnalysisResponse,
)

from app.services.ai_service import analyze_emergency


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Emergency Intelligence"],
)


@router.post(
    "/analyze",
    response_model=EmergencyAnalysisResponse,
)
def analyze_emergency_description(
    request: EmergencyAnalysisRequest,
):
    """
    Analyze an emergency description using
    SAHAY Emergency Intelligence.
    """

    result = analyze_emergency(
        request.description
    )

    return result