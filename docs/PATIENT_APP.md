# Running the Patient App

## Quick Start

### Install dependencies
```bash
cd C:\fullstack\async-telemed\frontend-patient
npm install
```

### Run in development mode
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Testing Flow

### Without LINE (Development Mode)
The app automatically detects if it's NOT running in LINE and uses mock authentication:

1. Open http://localhost:5173
2. Click "เข้าสู่ระบบด้วย LINE"
3. It will simulate login with mock user
4. Fill in the consultation form:
   - Step 1: Select province
   - Step 2: Describe symptoms
   - Step 3: Upload images
   - Step 4: Review and submit

### With LINE (Production Mode)
1. Set environment variables in `.env`:
   ```
   VITE_LIFF_ID=your-liff-id
   VITE_API_URL=https://your-api.com
   ```

2. Open the app inside LINE:
   - Share link in LINE chat
   - Open from LINE Official Account
   - Scan LIFF QR code

3. User goes through LINE authentication

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Patient App (React)                │
├─────────────────────────────────────────────────────┤
│  LoginScreen ──► ConsultationForm ──► ResultScreen  │
│       │               │                    │        │
│       └─────── useLiff() ─────────────────┘        │
│                    │                                │
│               LINE SDK                              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                Backend API (Node.js)                │
├─────────────────────────────────────────────────────┤
│  POST /api/v1/auth/thai-id/verify                   │
│  POST /api/v1/consultations                         │
│  POST /api/v1/uploads/presign                       │
│  POST /api/v1/webhooks/line                         │
└─────────────────────────────────────────────────────┘
```

## Next Steps

### 1. Test the App
```bash
cd frontend-patient
npm run dev
```

### 2. Connect to Backend
Make sure the backend is running:
```bash
cd backend/node-api
npm run dev
```

### 3. Configure LIFF (Production)
1. Go to https://developers.line.biz/console
2. Create LINE Login channel
3. Add LIFF app
4. Set endpoint URL to your deployed app
5. Add LIFF ID to `.env`

### 4. Deploy
Build for production:
```bash
npm run build
```

Deploy the `dist` folder to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront