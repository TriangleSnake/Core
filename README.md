# CampusSponsorship（React + FastAPI）

- 前端：Vite + React + Tailwind + React Router
- 後端：FastAPI + SQLModel + SQLite + JWT

## 快速啟動（本機）
### 後端
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 前端
```bash
cd frontend
npm i
npm run dev
# http://localhost:5173 （API: http://localhost:8000）
```

## Docker Compose（可選）
```bash
docker compose up --build
```

> 正式上線建議改用 Postgres、Alembic、反代（Caddy/Traefik）、環境變數與 TLS。
