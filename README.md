# Asynchronous Telemedicine System

Monorepo scaffold for a dermatology-focused asynchronous telemedicine platform covering:

- `backend/`: TypeScript Express API gateway and FastAPI clinical service
- `frontend-patient/`: React + LINE LIFF patient intake
- `frontend-doctor/`: React triage queue and consultation workspace
- `frontend-admin/`: React SLA and operational dashboard
- `database/`: PostgreSQL schema and migrations
- `docs/`: PRD and API documentation
- `docker/`: Local and deployment configuration

## Pilot Scope

- Thai ID based patient sign-in
- Async dermatology consultation requests with image upload
- Provincial routing to doctor pools
- SLA tracking for response and completion targets
- e-Prescription generation
- LINE webhook integration
- PDPA-aligned encryption for sensitive fields

## Milestones

1. Workspace and docs scaffold
2. Backend services and database model
3. Patient, doctor, and admin web apps
4. Containerized local deployment
