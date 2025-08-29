import express from "express"
import { requireAuth } from "../middleware/auth.js"

export function clubsRoutes(db, jwtSecret) {
  const router = express.Router()

  // 取得所有社團
  router.get("/", async (req, res) => {
    try {
      const clubs = await db.all("SELECT id, school, name, info, activity, stars FROM clubs")
      res.json(clubs)
    } catch (err) {
      res.status(500).json({ error: "無法取得社團列表" })
    }
  })

  router.post("/", requireAuth(process.env.JWT_SECRET), async (req, res) => {
    try {
      const { school, name, info, activity } = req.body
      if (!name) return res.status(400).json({ error: "缺少必填欄位 name" })

      const id = uuidv4()
      await db.run(
        "INSERT INTO clubs (id, school, name, info, activity, stars) VALUES (?,?,?,?,?,?)",
        [id, school || "", name, info || "", activity || "", 0]
      )

      // 同時把建立者加到 club_users
      await db.run(
        "INSERT INTO club_users (club_id, user_id) VALUES (?, ?)",
        [id, req.user.id]
      )

      res.json({ ok: true, id })
    } catch (err) {
      res.status(500).json({ error: "新增社團失敗", detail: err.message })
    }
  })

  // 使用者加入社團
  router.post("/:id/join", requireAuth(jwtSecret), async (req, res) => {
    const clubId = req.params.id
    const userId = req.user.id
    try {
      // 確認社團存在
      const club = await db.get("SELECT id FROM clubs WHERE id = ?", [clubId])
      if (!club) return res.status(404).json({ error: "社團不存在" })

      // 插入關聯（避免重複 → PRIMARY KEY 保護）
      await db.run("INSERT OR IGNORE INTO club_users (club_id, user_id) VALUES (?, ?)", [clubId, userId])

      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: "加入社團失敗", detail: err.message })
    }
  })

  // 使用者退出社團
  router.post("/:id/leave", requireAuth(jwtSecret), async (req, res) => {
    const clubId = req.params.id
    const userId = req.user.id
    try {
      await db.run("DELETE FROM club_users WHERE club_id = ? AND user_id = ?", [clubId, userId])
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: "退出社團失敗", detail: err.message })
    }
  })

  // 查社團成員
  router.get("/:id/members", async (req, res) => {
    try {
      const members = await db.all(
        `SELECT u.id, u.nickname, u.full_name, u.email 
         FROM users u
         JOIN club_users cu ON u.id = cu.user_id
         WHERE cu.club_id = ?`,
        [req.params.id]
      )
      res.json(members)
    } catch (err) {
      res.status(500).json({ error: "無法取得成員清單", detail: err.message })
    }
  })

  return router
}
