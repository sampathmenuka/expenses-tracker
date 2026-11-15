# Daily Ledger: expense tracker

A calm daily expense ledger with weekly and monthly reports, budgets, and multi-device sync.

- **Frontend:** React 19, Vite, Tailwind CSS 4, TanStack Query, Recharts, wouter
- **Backend:** FastAPI, SQLAlchemy 2, Alembic, JWT auth
- **Database:** PostgreSQL 17

## Features

- Accounts with email and password. Each user's data is private to them.
- A quick-add form for today. It keeps the category and date between entries, takes an optional note, and logs past dates too.
- Edit any expense by clicking it. Deleting shows an **Undo** toast.
- **History** lists every expense. Filter by period, category, or text, sort by date or amount, and see entries grouped by day with daily subtotals. More entries load as you go.
- **Reports** show weekly or monthly totals. Step back through past periods and compare with the previous one. Charts show daily spending and each category's share.
- **Budgets:** set an overall monthly budget and a limit per category. Progress bars warn as spending nears a limit, and the side panel flags categories near or over theirs.
- **Categories:** built-in ones come ready. Add your own, or rename and recolour any category. Deleting a custom category moves its expenses to *Other*.
- Choose your **currency** in Settings, and change your password there.
- **CSV export** covers everything or just the History results you've filtered.
- **Import from the old offline version.** Expenses saved in the browser by the earlier localStorage-only app are found on sign-in, and one click moves them into your account.

## Getting started

Prerequisites: Node 20+ with pnpm, Python 3.12+, and Docker.

```bash
# 1. Install frontend dependencies
pnpm install

# 2. Start PostgreSQL (published on host port 5433)
pnpm db:up

# 3. Set up the API
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # macOS/Linux: .venv/bin/pip
cp .env.example .env                            # then set a real JWT_SECRET
cd ..
pnpm db:migrate

# 4. Run both servers in separate terminals
pnpm dev:api   # FastAPI on http://localhost:8010 (docs at /docs)
pnpm dev       # Vite on http://localhost:3000, which proxies /api to the API
```

> The `dev:api`, `db:migrate` and `test:api` scripts use Windows venv paths (`.venv/Scripts`). On macOS or Linux, change them to `.venv/bin`.

### Production

`pnpm build` writes the frontend to `dist/public`. FastAPI serves those files on the same origin as the API, so a production deploy is one process:

```bash
pnpm build
cd backend && alembic upgrade head
APP_ENV=production JWT_SECRET=<random 48+ chars> fastapi run app/main.py --port 8010 --proxy-headers
```

With `APP_ENV=production` the API refuses to start without a strong `JWT_SECRET`, turns off the `/docs` pages and sends HSTS. Serve it over HTTPS behind a reverse proxy. `--proxy-headers` makes the rate limiter see real client IPs.

You can also run the API and the database in Docker:

```bash
JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(48))") POSTGRES_PASSWORD=<a strong password> docker compose --profile full up --build
```

## Configuration (`backend/.env`)

| Variable        | Default                                                    | Purpose                                   |
| --------------- | ---------------------------------------------------------- | ----------------------------------------- |
| `APP_ENV`       | `development`                                              | Set to `production` when deployed          |
| `DATABASE_URL`  | `postgresql+psycopg://ledger:ledger@127.0.0.1:5433/ledger` | SQLAlchemy connection string              |
| `JWT_SECRET`    | dev-only value                                             | **Required** in production (32+ random chars) |
| `CORS_ORIGINS`  | `["http://localhost:3000"]`                                | Only needed if the UI runs on another origin |

## Security

- Passwords are hashed with bcrypt. They must be 8 to 72 bytes long, because bcrypt ignores anything past 72 bytes.
- Logins use signed tokens that expire after 7 days. Changing your password, or choosing **Sign out of all other devices**, cancels every token issued before, on every device.
- After 5 failed logins for one account from one IP address, that account is locked for 15 minutes from that address. One IP address is also limited to 30 failed logins across all accounts. A wrong password and an unknown email return the same answer in about the same time, so the login form doesn't reveal which emails have accounts.
- Every response carries a strict Content-Security-Policy and blocks the site from being shown inside another site's frame. API responses also tell browsers and proxies not to store a copy (`Cache-Control: no-store`).
- Every query reads or writes only the signed-in user's data. Tests check that one user can't reach another user's records.
- CSV exports can't run spreadsheet formulas: a cell starting with `= + - @`, a tab or a carriage return gets a leading `'`.
- Postgres is published only on `127.0.0.1`. You can delete your account and all its data from Settings.
- Rate limits are kept in memory, so they assume one API process. With several workers, move them to Redis.

## Tests

```bash
docker compose exec db psql -U ledger -c "CREATE DATABASE ledger_test"   # first time only
pnpm test:api
pnpm check   # TypeScript
```

The API tests run against a real PostgreSQL database (`ledger_test`). Each test starts from a fresh schema.

## Database changes

Edit `backend/app/models.py`, then generate and apply a migration:

```bash
cd backend
.venv/Scripts/alembic revision --autogenerate -m "describe the change"
.venv/Scripts/alembic upgrade head
```
