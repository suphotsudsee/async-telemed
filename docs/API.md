# API Overview

## Services

### Node API Gateway

- Handles authentication, patient intake, queue orchestration, prescriptions, webhooks, and admin metrics.
- Exposes REST endpoints to frontends.
- Stores operational data in PostgreSQL.

### FastAPI Clinical Service

- Supports image metadata processing, triage scoring, and clinical helper endpoints.
- Designed so future ML services can sit behind the same API.

## REST Surface

### Auth

- `POST /api/v1/auth/thai-id/request-otp`
- `POST /api/v1/auth/thai-id/verify`
- `GET /api/v1/auth/session`

### Patient

- `POST /api/v1/consultations`
- `GET /api/v1/consultations/:id`
- `GET /api/v1/consultations`
- `POST /api/v1/uploads/presign`

### Doctor

- `GET /api/v1/doctor/queue`
- `POST /api/v1/doctor/queue/:consultationId/claim`
- `POST /api/v1/doctor/consultations/:consultationId/respond`

### Admin

- `GET /api/v1/admin/sla`
- `GET /api/v1/admin/routing`

### Integrations

- `POST /api/v1/webhooks/line`

## Data Contracts

### Consultation

```json
{
  "id": "uuid",
  "patientId": "uuid",
  "provinceCode": "10",
  "specialty": "dermatology",
  "status": "submitted",
  "priorityScore": 74,
  "submittedAt": "2026-04-02T10:00:00.000Z"
}
```

### Prescription

```json
{
  "id": "uuid",
  "consultationId": "uuid",
  "items": [
    {
      "medicationName": "Hydrocortisone 1% cream",
      "dosage": "Apply thin layer",
      "frequency": "BID",
      "durationDays": 7
    }
  ]
}
```

## Security Notes

- Session tokens are expected to be short-lived JWTs.
- Sensitive fields are encrypted before persistence.
- LINE webhook signatures must be validated before event processing.
