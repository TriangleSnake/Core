# CampusSponsorship Backend (FastAPI)

## 開發
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 目錄
- `app/main.py` 啟動、CORS、router 掛載
- `app/models.py` SQLModel 資料表
- `app/schemas.py` Pydantic I/O 模型
- `app/auth.py` 密碼雜湊與 JWT
- `app/deps.py` 取得目前使用者
- `app/routers/*` 各功能路由
