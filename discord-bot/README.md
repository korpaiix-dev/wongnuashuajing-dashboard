# Wongnuashuajing Discord Bot

Bot worker (runs 24/7) — separate from Vercel web

## Deploy on Railway (free $5 / month credit)

1. Push this folder as separate repo: `wns-discord-bot`
2. Railway → New Project → Deploy from GitHub
3. Add env vars (copy from `.env.example`)
4. Start command: `node index.js`

## Local test

```bash
cp .env.example .env  # fill values
npm install
npm run register      # register slash commands once
npm start
```

## Bot intents (Developer Portal)
- Server Members Intent: ON
- Message Content Intent: ON (if needed)

## Required permissions when invite
- Send Messages
- Embed Links
- Use Application Commands
- Read Message History
