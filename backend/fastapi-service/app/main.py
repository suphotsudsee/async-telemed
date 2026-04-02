from fastapi import FastAPI

from .models import ImageMetadataRequest, TriageRequest

app = FastAPI(title="Async Telemed Clinical Service", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}


@app.post("/triage/score")
def triage_score(payload: TriageRequest):
    priority = min(100, 35 + len(payload.red_flags) * 20 + max(0, 20 - payload.symptom_duration_days) + payload.image_count * 3)
    recommended_sla_hours = 2 if priority >= 80 else 4
    return {
        "priority_score": priority,
        "recommended_sla_hours": recommended_sla_hours,
        "queue_bucket": "urgent" if priority >= 80 else "standard",
    }


@app.post("/images/analyze-metadata")
def analyze_image_metadata(payload: ImageMetadataRequest):
    return {
        "count": len(payload.filenames),
        "accepted_formats": [name.split(".")[-1].lower() for name in payload.filenames],
        "advice": "Reject blurred or low-light images in production after CV quality checks."
    }

