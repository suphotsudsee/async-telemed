# Async Telemed - Docker Quick Start

## Prerequisites
- Docker Desktop installed
- Docker Compose v2+

## Quick Start

### 1. Build and Run Main Services
```bash
cd C:\fullstack\async-telemed
docker compose -f docker/docker-compose.yml up --build
```

### 2. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| **Patient App** | http://localhost:5173 | LINE LIFF Patient Interface |
| **Doctor App** | http://localhost:5174 | Doctor Triage Workspace |
| **Admin App** | http://localhost:5175 | SLA Dashboard |
| **Backend API** | http://localhost:8080 | Node.js REST API |
| **PostgreSQL** | localhost:5432 | Database |

## Notes

- `docker-node-api:latest` คือ image ของ backend ที่ระบบใช้งานจริงในตอนนี้
- `docker-fastapi:latest` เคยเป็น clinical helper service สำรอง แต่ไม่ได้ถูกเรียกจาก flow ปัจจุบันแล้ว
- stack Docker หลักตอนนี้ใช้ `node-api` เป็น backend ตัวเดียว

### 3. Test the App
1. Open http://localhost:5173
2. Login ผ่าน LINE mock / LIFF flow
3. Fill in consultation form
4. Submit and see result

## Development Mode

### Rebuild on Changes
```bash
docker compose -f docker/docker-compose.yml up --build --watch
```

### View Logs
```bash
# All services
docker compose -f docker/docker-compose.yml logs -f

# Specific service
docker compose -f docker/docker-compose.yml logs -f node-api
```

### Stop Services
```bash
# Stop all
docker compose -f docker/docker-compose.yml down

# Stop and remove volumes (resets database)
docker compose -f docker/docker-compose.yml down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check postgres is healthy
docker compose -f docker/docker-compose.yml ps

# View postgres logs
docker compose -f docker/docker-compose.yml logs postgres
```

### Rebuild Specific Service
```bash
docker compose -f docker/docker-compose.yml build node-api
docker compose -f docker/docker-compose.yml up -d node-api
```

## Architecture

```text
Patient UI (5173)
Doctor UI (5174)
Admin UI (5175)
        |
        v
Node API (8080)
        |
        v
PostgreSQL (5432)
```
