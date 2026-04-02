from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    symptom_duration_days: int = Field(ge=0)
    red_flags: list[str] = Field(default_factory=list)
    image_count: int = Field(ge=1, le=5)


class ImageMetadataRequest(BaseModel):
    filenames: list[str] = Field(min_length=1, max_length=5)

