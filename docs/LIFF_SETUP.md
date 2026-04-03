# LINE LIFF Setup Guide

## Prerequisites
- LINE Developers Account: https://developers.line.biz
- LINE Channel (Messaging API)

## Step 1: Create LINE Channel

1. Go to https://developers.line.biz/console
2. Click "Create a new channel"
3. Select "LINE Login" channel type
4. Fill in:
   - Channel name: "Telemed Patient"
   - Channel description: "Dermatology consultation app"
   - Category: "Medical/Health"
   - Subcategory: "Telemedicine"

## Step 2: Create LIFF App

1. In your channel, go to "LIFF" tab
2. Click "Add LIFF app"
3. Configure:
   - LIFF app name: "Telemed Patient"
   - Size: "Tall" (full height)
   - Endpoint URL: Your app URL (e.g., https://telemed-patient.example.com)
   - Scope: `profile openid chat_message.write`
   - Bot prompt: "Aggressive" (asks to add bot)

## Step 3: Get Credentials

After creating, you'll get:
- LIFF ID: `1234567890-abcdefgh` (use in liffId config)
- Channel ID: `1234567890`
- Channel Secret: `your-channel-secret`

## Step 4: Configure Webhook

1. Go to "Messaging API" tab
2. Enable webhook
3. Set webhook URL: `https://your-api-domain.com/api/v1/webhooks/line`
4. Verify signature in your backend

## Step 5: Environment Variables

Add to your `.env`:

```env
LINE_CHANNEL_ID=your-channel-id
LINE_CHANNEL_SECRET=your-channel-secret
LINE_LIFF_ID=your-liff-id
LINE_LIFF_URL=https://your-frontend-domain.com
```

## Testing Locally

For local development, use ngrok or similar tunneling:

```bash
# Install ngrok
npm install -g ngrok

# Expose local frontend
ngrok http 5173

# Use the ngrok URL as LIFF endpoint
```

## Production Checklist

- [ ] HTTPS endpoint (required by LINE)
- [ ] Valid SSL certificate
- [ ] Domain registered in LINE Developers Console
- [ ] LINE SDK loaded in frontend
- [ ] Backend webhook signature verification