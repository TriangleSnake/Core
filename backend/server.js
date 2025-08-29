// server.js
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { initDB } from "./db.js"
import cookieParser from "cookie-parser"

import { clubsRoutes } from "./routes/clubs.js";
import { authRoutes } from "./routes/auth.js"
import { rosterRoutes } from "./routes/roster.js"
import { meRoutes } from "./routes/me.js"
import { usersRoutes } from "./routes/users.js"
import { publicRoutes } from "./routes/public.js"
import { chatsRoutes } from "./routes/chats.js"

dotenv.config()

const app = express()
app.use(cookieParser())
app.use(express.json())

const allowOrigin = process.env.CORS_ORIGIN || "http://localhost:5173"
const JWT_SECRET = process.env.JWT_SECRET
app.use(cors({ origin: allowOrigin, credentials: true }))

// 健康檢查
app.get("/health", (_, res) => res.json({ ok: true }))

const db = await initDB()
app.use("/api/auth", authRoutes(db, JWT_SECRET))
app.use("/api/roster", rosterRoutes(db));
app.use("/api/clubs", clubsRoutes(db, JWT_SECRET));
app.use("/api/me", meRoutes(db, JWT_SECRET))
app.use("/api/users", usersRoutes(db, JWT_SECRET))
app.use("/api/public", publicRoutes(db))
app.use("/api/chats", chatsRoutes(db, JWT_SECRET))

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "0.0.0.0"

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`)
})
