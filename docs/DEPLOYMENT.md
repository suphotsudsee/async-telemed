# Deployment Notes

## Local Stack

Run from the repository root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Services:

- Patient app: `http://localhost:5173`
- Doctor app: `http://localhost:5174`
- Admin app: `http://localhost:5175`
- Node API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Environment Expectations

- Replace demo OTP verification with a production OTP provider.
- Route image uploads to object storage and store only signed references in PostgreSQL.
- Move encryption keys and LINE secrets into a managed secrets store.
- Add a real background worker for SLA escalations and notification retries.

## Production Hardening

- Put all apps behind a single ingress with TLS.
- Use private networking between API and database.
- Enable database backups and audit-log retention policies.
- Add observability for queue depth, breach rate, and webhook failures.
