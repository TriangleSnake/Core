import express from "express"
import { requireAuth } from "../middleware/auth.js"
import { requireClubMember, requireClubOwner } from "../utils/permissions.js"
import crypto from "crypto"

export function clubsRoutes(db, jwtSecret) {
  const router = express.Router()

  // 取得所有社團
  router.get("/", async (req, res) => {
    try {
      const clubs = await db.all(
        "SELECT username, school, name, info, activity, stars FROM clubs"
      )
      res.json(clubs)
    } catch (err) {
      res.status(500).json({ error: "無法取得社團列表" })
    }
  })

  // 新增社團
  router.post("/", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username, school, name, info, activity } = req.body || {}

      if (!username || !name) {
        return res.status(400).json({ error: "缺少必要欄位 username 或 name" })
      }

      if (!/^[a-z0-9-]{3,32}$/.test(username)) {
        return res.status(400).json({ error: "username 僅能使用 a-z 0-9 -，長度 3~32" })
      }

      const taken = await db.get(`SELECT 1 FROM clubs WHERE username = ?`, [username.toLowerCase()])
      if (taken) return res.status(409).json({ error: "username 已被使用" })

      await db.run(
        `INSERT INTO clubs (username, school, name, info, activity, stars)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [username.toLowerCase(), school || "", name, info || "", activity || ""]
      )

      await db.run(
        `INSERT INTO club_users (club_username, user_id, role)
         VALUES (?, ?, 'owner')`,
        [username.toLowerCase(), req.user.id]
      )
      await db.run(
        `INSERT INTO club_users (club_username, user_id, role)
        VALUES (?, ?, 'owner')`,
        [username.toLowerCase(), req.user.id]
      )

      // ✅ 建立社團官方群組並把 owner 加入
      const chatId = crypto.randomUUID()
      await db.run(
        `INSERT INTO chats (id, is_group, title, club_username, company_username, post_id)
        VALUES (?, 1, ?, ?, NULL, NULL)`,
        [chatId, `${name} 官方群組`, username.toLowerCase()]
      )
      await db.run(
        `INSERT INTO chat_members (chat_id, user_id, role, last_read_at)
        VALUES (?, ?, 'owner', CURRENT_TIMESTAMP)`,
        [chatId, req.user.id]
      )

      res.status(201).json({ ok: true, username })
    } catch (err) {
      res.status(500).json({ error: "新增社團失敗", detail: err.message })
    }
  })

  // 取得單一社團
  router.get("/:username", async (req, res) => {
    try {
      const c = await db.get(
        `SELECT username, school, name, info, activity, stars, avatar
         FROM clubs WHERE username = ?`,
        [req.params.username]
      )
      if (!c) return res.status(404).json({ error: "社團不存在" })
      res.json(c)
    } catch (err) {
      res.status(500).json({ error: "取得社團失敗", detail: err.message })
    }
  })

  // ✅ 更新社團（僅 owner）
  router.post("/:username", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username } = req.params
      const { name, school, info, activity } = req.body || {}

      await requireClubOwner(db, username, req.user.id)

      await db.run(
        `UPDATE clubs SET name = ?, school = ?, info = ?, activity = ?
         WHERE username = ?`,
        [name || "", school || "", info || "", activity || "", username]
      )

      const updated = await db.get(
        `SELECT username, school, name, info, activity, stars, avatar
         FROM clubs WHERE username = ?`,
        [username]
      )
      res.json(updated)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "更新社團失敗" })
    }
  })

  // 取得社團頭貼
  router.get("/:username/avatar", async (req, res) => {
    try {
      const row = await db.get("SELECT avatar FROM clubs WHERE username = ?", [req.params.username])
      if (!row || !row.avatar) return res.json({ avatar: null })
      res.json({ avatar: row.avatar })
    } catch (err) {
      res.status(500).json({ error: "無法取得社團頭貼" })
    }
  })

  // 更新社團頭貼（僅限 owner）
  router.post(
    "/:username/avatar",
    requireAuth(jwtSecret),
    express.json({ limit: "5mb" }),
    async (req, res) => {
      try {
        const { username } = req.params
        const { avatar } = req.body

        if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
          return res.status(400).json({ error: "頭貼格式錯誤，必須是 data:image/*" })
        }

        await requireClubOwner(db, username, req.user.id)

        await db.run("UPDATE clubs SET avatar = ? WHERE username = ?", [avatar, username])
        res.json({ ok: true })
      } catch (err) {
        res.status(err.status || 500).json({ error: err.message || "更新社團頭貼失敗" })
      }
    }
  )

  // 成員清單
  router.get("/:username/members", async (req, res) => {
    try {
      const members = await db.all(
        `SELECT u.id, u.name, u.username, u.email, cu.role
         FROM users u
         JOIN club_users cu ON u.id = cu.user_id
         WHERE cu.club_username = ?
         ORDER BY cu.joined_at DESC`,
        [req.params.username]
      )
      res.json(members)
    } catch (err) {
      res.status(500).json({ error: "無法取得成員清單", detail: err.message })
    }
  })

  // ✅ 編輯成員角色（僅 owner）
  router.post("/:username/members/:userId/role", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username, userId } = req.params
      const { role } = req.body || {}

      if (!["member", "admin"].includes(role)) {
        return res.status(400).json({ error: "角色必須是 member 或 admin" })
      }

      await requireClubOwner(db, username, req.user.id)

      await db.run(
        `UPDATE club_users SET role = ? WHERE club_username = ? AND user_id = ?`,
        [role, username, userId]
      )
      res.json({ ok: true })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "更新角色失敗" })
    }
  })

  // 加入社團
router.post("/:username/join", requireAuth(jwtSecret), async (req, res) => {
  const clubUsername = req.params.username
  const userId = req.user.id
  try {
    const club = await db.get("SELECT username FROM clubs WHERE username = ?", [clubUsername])
    if (!club) return res.status(404).json({ error: "社團不存在" })

    // 嘗試加入社團
    const result = await db.run(
      "INSERT OR IGNORE INTO club_users (club_username, user_id) VALUES (?, ?)",
      [clubUsername, userId]
    )

    if (result.changes === 0) {
      return res.json({ ok: true, joined: false, message: "已經是成員" })
    }

    // ✅ 檢查是否已有聊天室，沒有就建立
    let chat = await db.get(
      "SELECT id FROM chats WHERE club_username = ?",
      [clubUsername]
    )
    if (!chat) {
      const chatId = crypto.randomUUID()
      await db.run(
        `INSERT INTO chats (id, is_group, title, club_username) 
         VALUES (?, 1, ?, ?)`,
        [chatId, `社團 ${clubUsername} 聊天室`, clubUsername]
      )
      chat = { id: chatId }
    }

    // ✅ 把使用者加入聊天室
    await db.run(
      `INSERT OR IGNORE INTO chat_members (chat_id, user_id, role) 
       VALUES (?, ?, 'member')`,
      [chat.id, userId]
    )

    res.json({ ok: true, joined: true, message: "加入成功並加入聊天室" })
  } catch (err) {
    console.error("join club error:", err)
    res.status(500).json({ error: "加入社團失敗", detail: err.message })
  }
})

  // 退出社團
  router.post("/:username/leave", requireAuth(jwtSecret), async (req, res) => {
    const clubUsername = req.params.username
    const userId = req.user.id
    try {
      await db.run("DELETE FROM club_users WHERE club_username = ? AND user_id = ?", [clubUsername, userId])
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: "退出社團失敗", detail: err.message })
    }
  })

  // 取得社團貼文
  router.get("/:username/posts", async (req, res) => {
    try {
      const { username } = req.params

      const posts = await db.all(`
        SELECT p.id, p.title, p.content, p.tags, p.participants, p.budget, p.event_date, p.event_location,
              strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
              u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
              'club' AS orgType, c.username AS orgUsername, c.name AS orgName
        FROM club_posts p
        JOIN users u ON u.id = p.user_id
        JOIN clubs c ON c.username = p.club_username
        WHERE c.username = ?
        ORDER BY createdAt DESC
      `, [username])

      res.json(posts)
    } catch (err) {
      console.error("club posts error:", err)
      res.status(500).json({ error: "無法取得社團貼文" })
    }
  })


  // 新增貼文（僅限成員）
  router.post("/:username/posts", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username } = req.params
      const { title, content, tags, participants, budget, event_date, event_location } = req.body || {}
      if (!content?.trim()) return res.status(400).json({ error: "內容不能為空" })

      await requireClubMember(db, username, req.user.id)

      const id = crypto.randomUUID()
      await db.run(
        `INSERT INTO club_posts (id, club_username, user_id, title, content, tags, participants, budget, event_date, event_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, username, req.user.id, title || "", content.trim(), tags || "", participants || 0, budget || null, event_date || null, event_location || ""]
      )

      const newPost = await db.get(
        `SELECT p.*, 
                u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
                c.username AS orgUsername, c.name AS orgName, 'club' AS orgType
        FROM club_posts p
        JOIN users u ON u.id = p.user_id
        JOIN clubs c ON c.username = p.club_username
        WHERE p.id = ?`,
        [id]
      )
      res.status(201).json(newPost)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "新增貼文失敗" })
    }
  })

  // 取得自己的角色
  router.get("/:username/role", requireAuth(jwtSecret), async (req, res) => {
    try {
      const { username } = req.params
      const member = await db.get(
        `SELECT role FROM club_users WHERE club_username = ? AND user_id = ?`,
        [username, req.user.id]
      )
      if (!member) return res.json({ role: null })
      res.json({ role: member.role })
    } catch (err) {
      res.status(500).json({ error: "無法取得角色" })
    }
  })

  // ✅ 新增成員（僅 owner）
  router.post("/:username/members", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username } = req.params
      const { userId, role } = req.body || {}

      if (!userId) return res.status(400).json({ error: "缺少 userId" })
      const roleFinal = role && ["member", "admin"].includes(role) ? role : "member"

      await requireClubOwner(db, username, req.user.id)

      await db.run(
        `INSERT OR IGNORE INTO club_users (club_username, user_id, role)
         VALUES (?, ?, ?)`,
        [username, userId, roleFinal]
      )

      res.json({ ok: true })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "新增成員失敗" })
    }
  })

  // ✅ 刪除成員（僅 owner）
  router.delete("/:username/members/:userId", requireAuth(jwtSecret), async (req, res) => {
    try {
      const { username, userId } = req.params
      await requireClubOwner(db, username, req.user.id)

      await db.run(
        `DELETE FROM club_users WHERE club_username = ? AND user_id = ?`,
        [username, userId]
      )

      res.json({ ok: true })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "刪除成員失敗" })
    }
  })

  // ✅ 修改成員角色（僅 owner）
  router.post("/:username/members/:userId/role", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { username, userId } = req.params
      const { role } = req.body || {}

      if (!["member", "admin"].includes(role)) {
        return res.status(400).json({ error: "角色必須是 member 或 admin" })
      }

      await requireClubOwner(db, username, req.user.id)

      await db.run(
        `UPDATE club_users SET role = ? WHERE club_username = ? AND user_id = ?`,
        [role, username, userId]
      )

      res.json({ ok: true })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "更新角色失敗" })
    }
  })

  return router
}
