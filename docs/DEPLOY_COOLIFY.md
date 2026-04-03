# Deploy To Coolify via GitHub

ไฟล์สำหรับ deploy จริงบน Coolify ถูกเตรียมไว้แล้วที่:

- `docker/docker-compose.coolify.yml`
- `docker/node-api.prod.Dockerfile`
- `docker/.env.coolify.example`

## สิ่งที่ควรใช้บนโดเมนจริง

ตัวอย่างโดเมนแนะนำ:

- Patient App: `https://patient.coolify.phoubon.in.th`
- Doctor App: `https://doctor.coolify.phoubon.in.th`
- Admin App: `https://admin.coolify.phoubon.in.th`
- API: `https://api.coolify.phoubon.in.th`

ถ้าจะใช้ LINE Mini App จริง:

- `VITE_LIFF_URL` ต้องเป็นโดเมนของ Patient App จริง เช่น `https://patient.coolify.phoubon.in.th`
- อย่าใช้ `localhost` เป็น LIFF endpoint
- ใน LINE Developers Console ให้ตั้ง Endpoint URL ของ LIFF เป็นโดเมนเดียวกับ Patient App

## ขั้นตอนบน GitHub

1. push repo นี้ขึ้น GitHub
2. ให้ Coolify เชื่อมกับ GitHub repository นี้
3. ใน Coolify สร้าง resource แบบ `Docker Compose`
4. เลือก compose file เป็น `docker/docker-compose.coolify.yml`
5. ตั้ง environment variables ตามตัวอย่างใน `docker/.env.coolify.example`

## Environment Variables ที่ต้องตั้งใน Coolify

ค่าจำเป็น:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `PUBLIC_API_URL`
- `CORS_ORIGINS`
- `VITE_LIFF_ID`
- `VITE_LIFF_URL`
- `VITE_LIFF_MOCK=false`

ค่าเสริม:

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ID`
- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_ENDPOINT`

## Domain Mapping ใน Coolify

หลัง deploy แล้วให้ map domain แยกตาม service:

- `patient.coolify.phoubon.in.th` -> `patient-ui:80`
- `doctor.coolify.phoubon.in.th` -> `doctor-ui:80`
- `admin.coolify.phoubon.in.th` -> `admin-ui:80`
- `api.coolify.phoubon.in.th` -> `node-api:8080`

## สิ่งที่ผมแก้เพิ่มเพื่อรองรับ production

- เพิ่ม `node-api` production Dockerfile ที่ build เป็น `dist` แล้วรัน `npm run start`
- เพิ่ม compose file สำหรับ Coolify โดยไม่ใช้ bind mount แบบ dev
- เปลี่ยน backend ให้ใช้ `CORS_ORIGINS` จาก environment จริง
- แยก env example สำหรับ Coolify โดยเฉพาะ

## หมายเหตุ

- Compose file เดิม `docker/docker-compose.yml` ยังใช้สำหรับ local/dev
- สำหรับ production บน Coolify ให้ใช้ `docker/docker-compose.coolify.yml`
- ถ้าจะเก็บรูปจริง ควรเปลี่ยน `STORAGE_PROVIDER` จาก `local` ไปเป็น `s3` หรือ object storage ที่เข้าถึงได้ถาวร
