# Banking Web App

A simple banking dashboard project with a Node.js backend and static frontend pages.

## What is included

- `index.js` - Express server
- `public/` - frontend HTML pages
- `data/users.json` - seeded user accounts
- `data/transactions.json` - deposit-only transaction history
- `.gitignore`

## Setup

1. Open a terminal in the `banking` folder.
2. Install dependencies:

```bash
npm install express
```

3. Start the server:

```bash
npm start
```

4. Open `http://localhost:3000` in your browser.

## Seed user

- Email: `monica@bankofamerica.com`
- Password: `monica123`

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/transactions`

## Notes

This is a prototype server using JSON files for persistence. For production, replace the JSON storage with a database.
