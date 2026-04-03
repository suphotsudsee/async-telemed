# Async Telemed - Development Progress

## Completed

### Backend (Node API)
- [x] Express API with all REST endpoints
- [x] PostgreSQL integration with pg driver
- [x] Thai ID validation with checksum
- [x] Patient profile creation with encryption
- [x] Consultation CRUD operations
- [x] Doctor queue and claim workflow
- [x] SLA monitoring endpoints
- [x] OTP service (demo + SMS provider interface)
- [x] Presigned upload URL generation
- [x] Database fallback to mock mode when `DATABASE_URL` is not set

### Database
- [x] PostgreSQL schema with migrations
- [x] pgcrypto extension for encryption
- [x] Seed data for demo doctors
- [x] Proper indexes for performance

### Frontend
- [x] Patient intake (LINE LIFF ready)
- [x] Doctor triage queue workspace
- [x] Admin SLA dashboard
- [x] Tailwind CSS styling
- [x] Patient consultation history

### Docker
- [x] `docker-compose.yml` for local stack
- [x] Multi-stage builds for frontends
- [x] PostgreSQL container
- [x] Node API container
- [x] Patient, doctor, and admin containers

---

## TODO / Next Steps

### Priority 1 - Core Features
- [x] JWT authentication middleware
- [x] Role-based access control (patient/doctor/admin)
- [x] Rate limiting on auth endpoints
- [x] Audit logging for sensitive operations
- [ ] LINE LIFF integration for production auth
- [ ] LINE webhook signature verification
- [ ] Real OTP SMS provider integration
- [ ] S3/MinIO storage for production

### Priority 2 - Security
- [x] JWT middleware for protected routes
- [x] Role-based access control (patient/doctor/admin)
- [x] Rate limiting on auth endpoints
- [x] Audit logging middleware
- [ ] Input sanitization for SQL injection
- [ ] CORS origin validation
- [ ] Request size limits

### Priority 3 - Operations
- [ ] Logging middleware (structured JSON)
- [ ] Error tracking (Sentry/Datadog)
- [ ] Health check endpoints for all running services
- [ ] Database backup automation

### Priority 4 - Features
- [ ] Notification service (push/email)
- [ ] Audit log queries
- [ ] Analytics dashboard
- [ ] Export functionality

---

## Running Locally

### Prerequisites
- Node.js 22+
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (recommended)

### Quick Start with Docker

```bash
cd C:\fullstack\async-telemed
docker compose -f docker/docker-compose.yml up --build
```

Services will be available at:
- Patient UI: http://localhost:5173
- Doctor UI: http://localhost:5174
- Admin UI: http://localhost:5175
- Node API: http://localhost:8080
- PostgreSQL: localhost:5432

### Development Without Docker

```bash
# Start PostgreSQL (adjust as needed)
createdb telemed

# Run migrations
psql -d telemed -f database/migrations/001_init.sql
psql -d telemed -f database/migrations/002_seed.sql

# Node API
cd backend/node-api
cp .env.example .env
npm install
npm run dev

# Frontends
cd frontend-patient && npm install && npm run dev
cd frontend-doctor && npm install && npm run dev
cd frontend-admin && npm install && npm run dev
```

---

## Project Structure

```text
async-telemed/
├── backend/
│   └── node-api/
├── frontend-patient/
├── frontend-doctor/
├── frontend-admin/
├── database/
├── docker/
└── docs/
```

---

## Environment Variables

See `backend/node-api/.env.example` for active backend configuration.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Token signing key
- `ENCRYPTION_KEY` - Field encryption key (64 hex chars)
- `OTP_MODE` - Set to `demo` for testing
- `STORAGE_PROVIDER` - `local`, `s3`, or `minio`

---

## Demo Notes

- OTP demo mode accepts a demo flow for local development
- The current product uses `node-api` as the only backend service
