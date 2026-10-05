from pydantic import BaseModel, Field


class EmergencyAnalysisRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Citizen's emergency description",
    )


class EmergencyAnalysisResponse(BaseModel):
    emergency_type: str
    severity: str
    confidence: int
    priority_score: int
    recommendation: str
    hospital_required: bool
    recommended_hospital_type: str
    analysis_engine: str