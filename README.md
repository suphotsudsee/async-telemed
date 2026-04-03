# Asynchronous Telemedicine System

ระบบ telemedicine แบบ asynchronous สำหรับงานผิวหนัง ประกอบด้วย:

- `backend/node-api`: API หลักสำหรับ patient, doctor, admin
- `frontend-patient`: หน้า patient intake, ประวัติคำขอ, และติดตามสถานะ
- `frontend-doctor`: หน้า login แพทย์, คิวเคส, รับเคส, ส่งผล, และส่งต่อเคส
- `frontend-admin`: หน้า admin dashboard
- `database`: migrations และ schema PostgreSQL
- `docker`: Dockerfiles และ `docker-compose.yml`

## Ports

ค่า port หลักที่ใช้ตอนนี้:

- `8080`: backend API
- `5173`: Patient App ผ่าน Docker
- `5174`: Doctor App ผ่าน Docker
- `5175`: Admin App ผ่าน Docker
- `5432`: PostgreSQL

ถ้าจะรันแบบ dev server เพิ่มเอง:

- `5185`: Patient App แบบ Vite dev server ที่เคยใช้ทดสอบ

## Quick Start

รันระบบหลักผ่าน Docker:

```bash
cd docker
docker compose up -d --build node-api patient-ui doctor-ui admin-ui postgres
```

เปิดใช้งานได้ที่:

- Patient: `http://localhost:5173`
- Doctor: `http://localhost:5174`
- Admin: `http://localhost:5175`
- API: `http://localhost:8080`

## Doctor Login

Doctor App ตอนนี้ใช้ `username/password` จริงแล้ว

บัญชีเริ่มต้น:

- `dr.narin / doctor123`
- `dr.pim / doctor123`

หมายเหตุ:

- backend จะเติม `username` และ `password_hash` ให้ doctor seed อัตโนมัติแม้ใช้ PostgreSQL volume เดิม
- หลัง login สำเร็จ Doctor App จะเก็บ session token ใน `localStorage` และใช้กับ `queue / claim / respond`

## Development

ถ้าต้องการรัน frontend/backend แบบ local dev:

```bash
npm install
npm run dev:node-api
npm run dev:patient
npm run dev:doctor
npm run dev:admin
```

ข้อควรระวัง:

- อย่ารัน Vite dev server ซ้อนกับพอร์ต Docker เดียวกันโดยไม่ตั้ง port ใหม่
- ถ้าจะใช้ Docker UI เป็นหลัก ให้ปิด dev server ที่ค้างอยู่ก่อน
- ถ้าจะใช้ `frontend-patient` แบบ dev server แนะนำให้ใช้ `5185` แทน `5173`

## Avoid Port Collisions

ปัญหาที่เจอบ่อยคือมี `vite` ค้างอยู่ในเครื่อง แล้วแย่ง `localhost:5173` หรือ `localhost:5174` ทำให้ browser เปิดหน้าเก่าแทน Docker app

เช็กว่า port ไหนถูกใช้งานอยู่:

```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 5173,5174,5175,5185 } |
  Select-Object LocalAddress,LocalPort,OwningProcess | Sort-Object LocalPort
```

เช็กว่า process ไหนเป็น `vite`:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like '*vite*' } |
  Select-Object ProcessId,Name,CommandLine | Format-List
```

ถ้าต้องการใช้ Docker UI และพบว่า port ถูก `node vite` จับอยู่ ให้ปิด process นั้นก่อน เช่น:

```powershell
Stop-Process -Id <PID> -Force
```

วิธีสังเกตว่าเปิดหน้า Docker จริงหรือยัง:

- Docker UI จะเสิร์ฟไฟล์ `/assets/...js`
- Vite dev server จะมี `/@vite/client`

ตัวอย่างตรวจหน้า `5173`:

```powershell
Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing |
  Select-Object -ExpandProperty Content
```

ถ้ามี `@vite/client` แปลว่ายังเป็น dev server ไม่ใช่ Docker app

## Build

ตรวจ build แยกแต่ละ frontend:

```bash
cd frontend-patient && npm run build
cd ../frontend-doctor && npm run build
cd ../frontend-admin && npm run build
```

ตรวจ backend:

```bash
cd backend/node-api && npm run build
```

## E2E Tests

Playwright ถูกแยกเป็น 2 spec หลัก:

- `tests/e2e/doctor-auth.spec.ts`: ตรวจ `login fail / logout / session restore`
- `tests/e2e/full-loop.spec.ts`: ตรวจ flow `patient -> doctor -> patient`, เคสไม่มีรูป, และ `escalated`

รัน test ทั้งชุด:

```bash
npm run test:e2e
```

ถ้าต้องการชี้ไปที่ URL อื่น:

```powershell
$env:PATIENT_APP_URL='http://localhost:5173'
$env:DOCTOR_APP_URL='http://localhost:5174'
npm run test:e2e
```

ผลล่าสุดที่ตรวจผ่าน:

- doctor auth 3 เคส
- full loop 3 เคส
- รวม 6 เคสผ่านทั้งหมด

## Full Loop

ลูปที่รองรับตอนนี้:

1. Patient ส่ง consultation เข้าระบบ
2. Doctor login ด้วย `username/password`
3. Doctor ดึงคิวจริงจาก backend
4. Doctor รับเคส
5. Doctor ส่งผลวินิจฉัย/คำแนะนำ/ยา หรือส่งต่อเคส
6. Patient เปิด `ดูสถานะคำขอ` และเห็นสถานะล่าสุดจาก backend
7. Patient เปิด history แล้วกลับมาดูเคสย้อนหลังได้

## Current Notes

- stack ปัจจุบันใช้ `node-api` ตัวเดียวเป็น backend หลัก
- ถ้าใช้ Docker เป็นหลัก แนะนำให้เปิดผ่าน `5173/5174/5175`
- ถ้าใช้ dev server ควบคู่กัน ให้แยก port ชัดเจนเพื่อไม่ให้ browser ไปเจอหน้าเก่า
- ถ้าต้องการเปลี่ยนรหัสผ่านหมอถาวร ควรทำผ่านฐานข้อมูลหรือหน้า admin ในรอบถัดไป
