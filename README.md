# HealthAxis

Two folders — `backend/` and `frontend/`.

---

## Quick Start

### 1. Set up PostgreSQL

Open PowerShell, find your version:
```
Get-ChildItem "C:\Program Files\PostgreSQL"
```

Add psql to PATH (replace 17 with your version):
```
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"
```

Create database and run schema:
```
psql -U postgres -c "CREATE DATABASE hospital_db;"
psql -U postgres -d hospital_db -f backend/database/init.sql
```

### 2. Set your DB password

Edit `backend/.env`:
```
DB_PASSWORD=your_actual_postgres_password
```

### 3. Start the app

Double-click `start.bat`

Or manually:
```
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Seed demo data

```
cd backend
npm run seed
```

Demo accounts:

| Role         | Email                     | Password     |
|--------------|---------------------------|--------------|
| Admin        | admin@hospital.com        | admin123     |
| Doctor       | dr.smith@hospital.com     | doctor123    |
| Doctor       | dr.jones@hospital.com     | doctor123    |
| Receptionist | reception@hospital.com    | reception123 |
| Patient      | john@email.com            | patient123   |

---

## Troubleshooting

**"Failed to fetch"** — Backend not running. Run `cd backend && npm run dev`.

**PostgreSQL error** — Check `backend/.env` password is correct.

**psql not found** — Run: `$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"`
